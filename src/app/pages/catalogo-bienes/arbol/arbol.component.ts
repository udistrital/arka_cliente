import { Component, OnInit, Input, EventEmitter, Output, OnChanges, TemplateRef, ViewChild } from '@angular/core';
import { NbTreeGridDataSource, NbSortDirection, NbSortRequest, NbTreeGridDataSourceBuilder, NbDialogService } from '@nebular/theme';
import { Observable, combineLatest } from 'rxjs';
import { PopUpManager } from '../../../managers/popUpManager';
import { CuentasGrupoTransaccion } from '../../../@core/data/models/catalogo/cuentas_subgrupo';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { DynamicDatabase, DynamicDataSource, DynamicFlatNode } from '../../../helpers/catalogo-elementos/arbolHelper';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TipoNivel } from '../../../@core/data/models/catalogo/tipo_nivel';
import { NivelHelper as nh } from '../../../@core/utils/niveles.helper';
import {FlatTreeControl} from '@angular/cdk/tree';
import { MatTable } from '@angular/material/table';

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


  @ViewChild(MatTable) table: MatTable<any>;

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSourcex: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandible;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandible;


  data: TreeNode<CatalogoArbol>[];
  data2: TreeNode<CatalogoArbol>[];
  customColumn = 'Codigo';
  defaultColumns: string[];
  allColumns: string[];
  stringBusqueda: any;
  mostrar: boolean = false;

  dataSource: NbTreeGridDataSource<CatalogoArbol>;

  sortColumn: string;
  aux: any;
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  catalogoSeleccionado: number;
  detalle: boolean;
  cuentasContables: Array<CuentasGrupoTransaccion>;
  grupoSeleccionado: Subgrupo;
  nivelSeleccionado: string;

  @Input() catalogoId: number;
  @Input() updateSignal: any;
  @Input() acciones: boolean = false;
  @Input() elementos: boolean = false;
  @Output() fila = new EventEmitter<CatalogoArbol>();
  @Input() subgruposInactivos: boolean = false;
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
    private pUpManager: PopUpManager,
    private dialogService: NbDialogService,
    private database: DynamicDatabase,
    ) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.stringBusqueda = '';
    this.aux = 0;
  }

  ngOnInit() {
    this.dataSourcex = new DynamicDataSource(this.treeControl, this.database, this.subgruposInactivos, this.elementos);
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.construirForm();
    this.catalogoHelper.getTiposMovimientoKronos().subscribe((res: any) => {
      // console.log(res)
      this.Movimientos = res;

    });
    this.catalogoSeleccionado = 0;
    this.detalle = false;
    this.cuentasContables = new Array<CuentasGrupoTransaccion>();

    if (this.updateSignal) {
      this.updateSignal.subscribe((res) => {
        this.dataSourcex.updateNode(res.item, res.parentId);
      });
    }
  }

  construirForm() {
    this.defaultColumns = ['Nombre', 'Descripcion'];
    this.subgruposInactivos ? this.defaultColumns.push('Activo') : null;
    this.acciones ? this.defaultColumns.push('Acciones') : null;

    this.allColumns = [this.customColumn].concat(this.defaultColumns);
    this.customColumn2 = this.translate.instant('GLOBAL.codigo');
    this.defaultColumns2 = [
      this.translate.instant('GLOBAL.Nombre'),
      this.translate.instant('GLOBAL.Descripcion'),
    ];

    this.subgruposInactivos ?
      this.defaultColumns2.push(this.translate.instant('GLOBAL.estado')) : null;
    this.acciones ?
      this.defaultColumns2.push(this.translate.instant('GLOBAL.info')) : null;

    this.allColumns2 = [this.customColumn2].concat(this.defaultColumns2);
  }

  ngOnChanges(changes) {
    if (changes.hasOwnProperty('catalogoId')) {
      this.catalogoSeleccionado = changes.catalogoId.currentValue;
      this.loadTreeCatalogo();
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
    if (this.stringBusqueda.length < this.aux) {
      this.catalogoHelper.getArbolCatalogo(this.catalogoId, this.elementos, this.subgruposInactivos).subscribe((res) => {
        this.mostrar = true;
        if (res !== null) {
          if (res[0].hasOwnProperty('data')) {
            this.data = res;
            this.aux = res;
            this.data2 = this.data;
            this.data2 = this.filter(this.stringBusqueda, this.data2);
            this.dataSource = this.dataSourceBuilder.create(this.data2);
          }
        }
      });
    }
    if (this.stringBusqueda.length >= 4 && this.stringBusqueda.length >= this.aux) {
    this.data2 = this.data;
    this.data2 = this.filter(this.stringBusqueda, this.data2);
    this.dataSource = this.dataSourceBuilder.create(this.data2);
    }
    this.aux = this.stringBusqueda.length;

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

  loadTreeCatalogo() {
    // this.catalogoHelper.getArbolCatalogo(this.catalogoId, this.elementos).subscribe((res) => {
    //   this.mostrar = true;
    //   if (res !== null) {
    //     if (res[0].hasOwnProperty('data')) {
    //       this.data = res;
    //       this.aux = res;
    //       this.dataSource = this.dataSourceBuilder.create(this.data);
    //     } else {
    //       this.dataSource = this.dataSourceBuilder.create([]);
    //     }
    //   }
    // });
    this.database.getNivelSuperior(this.catalogoId, this.subgruposInactivos).subscribe(res => {
      this.dataSourcex.data = res;
      this.mostrar = true;
    });

  }
  array(n: number): any[] {
    return Array(n);
  }

  getSelectedRow(selectedRow) {
    this.fila.emit(selectedRow);
  }

  /**
   * Usar únicamente para depurar!
   * Por ejemplo, dentro de una etiqueta 'pre'
  */
  imprime(t: any): string {
    return JSON.stringify(t, undefined, 2);
  }

  volver() {
    this.detalle = false;
    this.cuentasContables = undefined;
    this.tipos_de_bien = undefined;
    this.elementosSubgrupo = undefined;
  }

  getDetalle(selectedRow, dialog: TemplateRef<any>) {
    this.detalle = false;
    this.dialogService.open(dialog);

    // console.log(selectedRow);
    this.grupoSeleccionado = selectedRow;
    const observable = combineLatest([
      this.catalogoHelper.getCuentasContables(selectedRow.Id),
      this.catalogoHelper.getDetalleSubgrupo(selectedRow.Id),
      this.catalogoHelper.getElementosSubgrupo(selectedRow.Id),
    ]);
    this.nivelSeleccionado = this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(selectedRow.TipoNivelId.Id) + '.nombre');

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
      } else {
        this.tipos_de_bien = undefined;
      }
      if (Object.keys(elementos[0]).length !== 0) {
        this.elementosSubgrupo = elementos;
      } else {
        this.elementosSubgrupo = undefined;
      }
      // this.pUpManager.showErrorAlert('no existen cuentas asociadas a este grupo');
      this.detalle = true;
    });
  }
}
