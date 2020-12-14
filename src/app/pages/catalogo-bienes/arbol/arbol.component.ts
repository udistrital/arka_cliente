import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { NbTreeGridDataSource, NbSortDirection, NbSortRequest, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { Observable, combineLatest, from } from 'rxjs';
import { CuentaContable } from '../../../@core/data/models/catalogo/cuenta_contable';
import { PopUpManager } from '../../../managers/popUpManager';
import { CuentasGrupoTransaccion } from '../../../@core/data/models/catalogo/cuentas_subgrupo';
import {TipoNivelID} from '../../../@core/data/models/catalogo/tipo_nivel';
import { SubgrupoTransaccion } from '../../../@core/data/models/catalogo/transacciones';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TipoNivel } from '../../../@core/data/models/catalogo/tipo_nivel';
import { request } from 'http';
import { exists } from 'fs';

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface CatalogoArbol {
  Id: number;
  Nombre: string;
  Descripcion: string;
  FechaCreacion: string;
  FechaModificacion: string;
  Activo: boolean;
  Codigo: string;
  TipoNivelId: TipoNivel;
}

@Component({
  selector: 'ngx-arbol',
  templateUrl: './arbol.component.html',
  styleUrls: ['./arbol.component.scss'],
})
export class ArbolComponent implements OnInit, OnChanges {

  data: TreeNode<CatalogoArbol>[];
  data2: TreeNode<CatalogoArbol>[];
  aux: TreeNode<CatalogoArbol>[];
  customColumn = 'Codigo';
  defaultColumns = ['Nombre', 'Descripcion', 'Acciones'];
  allColumns = [this.customColumn, ...this.defaultColumns];
  stringBusqueda: any;
  mostrar: boolean = false;

  dataSource: NbTreeGridDataSource<CatalogoArbol>;

  sortColumn: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  catalogoSeleccionado: number;
  detalle: boolean;
  cuentasContables: Array<CuentasGrupoTransaccion>;
  grupoSeleccionado: Subgrupo;

  @Input() catalogoId: number;
  @Input() updateSignal: Observable<string[]>;
  @Output() grupo = new EventEmitter<CatalogoArbol>();
  @Output() subgrupo = new EventEmitter<CatalogoArbol>();
  tipos_de_bien: TipoBien;
  elementosSubgrupo: TipoBien;
  customColumn2: any;
  defaultColumns2: any[];
  allColumns2: string[];
  Movimientos: any;

  constructor(
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<CatalogoArbol>,
    private catalogoHelper: CatalogoElementosHelper,
    private translate: TranslateService,
    private pUpManager: PopUpManager) {
    this.stringBusqueda = '';
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.construirForm();
    this.catalogoHelper.getTiposMovimientoKronos().subscribe((res: any) => {
      // console.log(res)
      this.Movimientos = res;

    });
  }

  construirForm() {
    this.customColumn2 = this.translate.instant('GLOBAL.codigo');
    this.defaultColumns2 = [
      this.translate.instant('GLOBAL.Nombre'),
      this.translate.instant('GLOBAL.Descripcion'),
      this.translate.instant('GLOBAL.Acciones'),
    ];
    this.allColumns2 = [this.customColumn, ...this.defaultColumns];
  }
  ngOnInit() {
    this.catalogoSeleccionado = 0;
    this.detalle = false;
    this.cuentasContables = new Array<CuentasGrupoTransaccion>();
  }

  ngOnChanges(changes) {
    if (this.catalogoId !== this.catalogoSeleccionado) {
      this.loadTreeCatalogo();
      this.catalogoSeleccionado = this.catalogoId;
    }
    if (changes['updateSignal'] && this.updateSignal) {
      this.updateSignal.subscribe(() => {
        this.loadTreeCatalogo();
      });
    }
  }

  updateSort(sortRequest: NbSortRequest): void {
    if (this.data2 !== undefined) {
      this.data2 = this.sortGeneral(sortRequest, this.data2);
      this.sortColumn = sortRequest.column;
      this.sortDirection = sortRequest.direction;
      this.dataSource = this.dataSourceBuilder.create(this.data2);
    } else {
    this.data = this.sortGeneral(sortRequest, this.data);
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
    this.dataSource = this.dataSourceBuilder.create(this.data);
    }
  }

  sortGeneral(mrequest, data) {
    const _this = this;
    if (!mrequest) {
        return data;
    }
    const sorted = data.sort(function (na, nb) {
      const key = mrequest.column;
      const dir = mrequest.direction;
      const a = na.data[key];
      const b = nb.data[key];
      let res = 0;
      if (a > b) {
          res = 1;
      }
      if (a < b) {
          res = -1;
      }
      return dir === NbSortDirection.ASCENDING ? res : res * -1;
    });
    for (let _i = 0, data_1 = data; _i < data_1.length; _i++) {
        const node = data_1[_i];
        if (node.hasOwnProperty('children') && node.children !== undefined) {
        node.children = this.sortGeneral(mrequest, node.children);
        }
    }
    return sorted;
  }

  filterSearch() {
    if (this.stringBusqueda === '') {
      this.dataSource = this.dataSourceBuilder.create(this.data);
      this.data2 = undefined;
      this.loadTreeCatalogo();
    }
    if (this.stringBusqueda.length > 4) {
    this.data2 = this.filter(this.stringBusqueda, this.data);
    this.dataSource = this.dataSourceBuilder.create(this.data2);
    }
  }

  filter(query, data) {
    const _this = this;
    if (!query) {
      return data;
    } else {
      if (data !== undefined) {
        return data.reduce(function (filtered, node) {
          const filteredChildren = _this.filter(query, node.children);
          node.children = filteredChildren;
          node.expanded = false;
          if (filteredChildren && filteredChildren.length) {
              node.expanded = true;
              filtered.push(node);
          } else if (_this.filterPredicate(node.data, query)) {
              filtered.push(node);
            }
          return filtered;
        }, []);
      }
    }
  }

  filterPredicate(data, searchQuery) {
    const preparedQuery = searchQuery.trim().toLocaleLowerCase();
    for (let _i = 0, _a = Object.values(data); _i < _a.length; _i++) {
        const val = _a[_i];
        const preparedVal = ('' + val).trim().toLocaleLowerCase();
        if (preparedVal.includes(preparedQuery)) {
            return true;
        }
    }
    return false;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + (nextColumnStep * index);
  }

  getSelectedRow2(selectedRow) {
    this.grupo.emit(selectedRow);
  }
  loadTreeCatalogo() {
    this.mostrar = false;
    this.catalogoHelper.getArbolCatalogo(this.catalogoId).subscribe((res) => {
      this.mostrar = true;
      if (res !== null) {
        if (res[0].hasOwnProperty('data')) {
          this.data = res;
          this.dataSource = this.dataSourceBuilder.create(this.data);
          // this.dataSource.sortService.sort = ()
          // console.log(this.dataSource)
        }
      }
    });
  }

  getSelectedRow(selectedRow) {
    this.subgrupo.emit(selectedRow);
  }

  volver() {
    this.detalle = false;
    this.cuentasContables = undefined;
    this.tipos_de_bien = undefined;
    this.elementosSubgrupo = undefined;

  }
  getDetalle(selectedRow) {
    // console.log(selectedRow);
    this.grupoSeleccionado = selectedRow;
    const observable = combineLatest([
      this.catalogoHelper.getCuentasContables(selectedRow.Id),
      this.catalogoHelper.getDetalleSubgrupo(selectedRow.Id),
      this.catalogoHelper.getElementosSubgrupo(selectedRow.Id),
    ]);

    observable.subscribe(([cuentas, detalle, elementos]: any[]) => {
      // console.log([cuentas, detalle, elementos]);
      // console.log(cuentas);
      // console.log(Object.keys(elementos).length);
      // console.log(Object.keys(cuentas).length);
      if (Object.keys(cuentas[0]).length !== 0) {
        // console.log(this.Movimientos)
        for (const cuenta in cuentas) {
          if (true) {
            cuentas[cuenta].SubtipoMovimientoId = this.Movimientos.find(x => x.Id === parseFloat(cuentas[cuenta].SubtipoMovimientoId));
          }
        }
        this.cuentasContables = <Array<CuentasGrupoTransaccion>>cuentas;
      }
      if (Object.keys(detalle[0]).length !== 0) {
        this.tipos_de_bien = <TipoBien>detalle[0].TipoBienId;
      }
      if (Object.keys(elementos[0]).length !== 0) {
        this.elementosSubgrupo = elementos;
      }
      // this.pUpManager.showErrorAlert('no existen cuentas asociadas a este grupo');
      this.detalle = true;
    });
  }
}
@Component({
  selector: 'ngx-nb-fs-icon',
  template: `
    <nb-tree-grid-row-toggle
      [expanded]="expanded"
      *ngIf="isDir(); else fileIcon"
    >
    </nb-tree-grid-row-toggle>
    <ng-template #fileIcon> </ng-template>
  `,
})
export class FsIconAComponent {
  @Input() kind: string;
  @Input() expanded: boolean;

  isDir(): boolean {
    return this.kind === 'dir';
  }
}
