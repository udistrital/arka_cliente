import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestManager } from '../../managers/requestManager';

/** Flat node with expandable and level information */
export class DynamicFlatNode {
    constructor(public item: any,
        public level = 1,
        public expandible: boolean = false,
        public isLoading = false) { }
}
@Injectable({
    providedIn: 'root',
})
/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export class DynamicDatabase {

    constructor(private rqManager: RequestManager) { }

    getChildren(node: number, inactivos: boolean, getElementos: boolean) {
        let query = inactivos ? '&get_inactivos=true' : '';
        query += getElementos ? '&get_elementos=true' : '';
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return new Promise<any>(resolve => {
            this.rqManager.get('tr_catalogo/arbol?primer_nivel=false&subgrupo_id=' + node + query).toPromise().then(res => {
                resolve(res);
            },
            );
        });
    }

    getNivelSuperior(catalogoId: number, inactivos: boolean) {
        const query = inactivos ? '&get_inactivos=true' : '';
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('tr_catalogo/arbol?primer_nivel=true&catalogo_id=' + catalogoId + query).pipe(
            map(
                (res: any) => {
                    return res.map(
                        node => new DynamicFlatNode(node.data, 0, node.expandible),
                    );
                },
            ),
        );
    }

}
/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
export class DynamicDataSource {
    children: any;
    dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

    get data(): DynamicFlatNode[] { return this.dataChange.value; }
    set data(value: DynamicFlatNode[]) {
        this.treeControl.dataNodes = value;
        this.dataChange.next(value);
    }

    constructor(private treeControl: FlatTreeControl<DynamicFlatNode>,
        private database: DynamicDatabase,
        private inactivos: boolean,
        private elementos: boolean) { }

    connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
        this.treeControl.expansionModel.changed.subscribe(change => {
            if ((change as SelectionChange<DynamicFlatNode>).added ||
                (change as SelectionChange<DynamicFlatNode>).removed) {
                this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
            }
        });

        return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
    }

    /** Handle expand/collapse behaviors */
    handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
        if (change.added) {
            change.added.forEach(node => this.toggleNode(node, true));
        }
        if (change.removed) {
            change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
        }
    }

    /**
     * Toggle the node, remove from display list
     */
    async toggleNode(node: DynamicFlatNode, expand: boolean) {

        node.isLoading = true;
        if (expand) {
            const children = [this.loadChildren(node.item.Id)];
            await Promise.all(children);
        }

        const index = this.data.indexOf(node);
        if (!this.children || index < 0) { // If no children, or cannot find the node, no op
            node.isLoading = false;
            return;
        }

        if (expand && this.children) {
            const nodes = this.children.map(name =>
                new DynamicFlatNode(name.data, node.level + 1, name.expandible));
            this.data.splice(index + 1, 0, ...nodes);
        } else {
            let count = 0;
            for (let i = index + 1; i < this.data.length
                && this.data[i].level > node.level; i++, count++) { }
            this.data.splice(index + 1, count);
        }

        // notify the change
        this.dataChange.next(this.data);
        node.isLoading = false;
    }

    updateNode(node: any, parentId: number) {
        if (parentId === 0) {
            const index = this.data.map(e => e.item.Id.toString() + (e.item.TipoNivelId ? e.item.TipoNivelId.Id.toString() : 'el')).
                indexOf(node.Id.toString() + (node.TipoNivelId ? node.TipoNivelId.Id.toString() : 'el'));
            this.data[index].item = node;
        } else if (parentId === -1) {
            const nodes = <DynamicFlatNode>{ item: node, level: 0, expandible: false };
            this.data.push(nodes);
        } else {
            const parent = this.data.find(e => e.item.Id === parentId);
            const parentIndex = this.data.map(e => e.item.Id).indexOf(parentId);
            this.data[parentIndex].expandible = true;
            const nodes = <DynamicFlatNode>{ item: node, level: parent.level + 1, expandible: false };
            const expanded = parentIndex < this.data.length - 1 && this.data[parentIndex].expandible &&
                parent.level === this.data[parentIndex + 1].level - 1;
            if (expanded) {
                this.data.splice(parentIndex + 1, 0, nodes);
            }
        }
        this.dataChange.next(this.data);
    }

    private loadChildren(Id: number): Promise<void> {
        return new Promise<void>(resolve => {
          this.database.getChildren(Id, this.inactivos, this.elementos).then( res => {
            this.children = res;
            resolve();
          });
        });
      }

}
