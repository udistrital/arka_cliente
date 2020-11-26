import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { NbTreeGridDataSource, NbSortDirection, NbSortRequest, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { Observable, combineLatest } from 'rxjs';
import { CuentaContable } from '../../../@core/data/models/catalogo/cuenta_contable';
import { PopUpManager } from '../../../managers/popUpManager';
import { CuentasGrupoTransaccion } from '../../../@core/data/models/catalogo/cuentas_subgrupo';
import { SubgrupoTransaccion, Subgrupo } from '../../../@core/data/models/catalogo/subgrupo';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

interface TreeNode<T> {
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

interface CatalogoArbol {
  Id: number;
  Nombre: string;
  Descripcion: string;
  FechaCreacion: Date;
  FechaModificacion: Date;
  Activo: boolean;
  Codigo: string;
}

@Component({
  selector: 'ngx-arbol',
  templateUrl: './arbol.component.html',
  styleUrls: ['./arbol.component.scss'],
})
export class ArbolComponent implements OnInit, OnChanges {

  data: TreeNode<CatalogoArbol>[];
  customColumn = 'Codigo';
  defaultColumns = ['Nombre', 'Descripcion', 'Acciones'];
  allColumns = [this.customColumn, ...this.defaultColumns];


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
    this.customColumn2 = this.translate.instant('GLOBAL.Codigo');
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
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
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
    this.catalogoHelper.getArbolCatalogo(this.catalogoId).subscribe((res) => {

      if (res !== null) {
        if (res[0].hasOwnProperty('data')) {
          this.data = res;
          this.dataSource = this.dataSourceBuilder.create(this.data);
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
