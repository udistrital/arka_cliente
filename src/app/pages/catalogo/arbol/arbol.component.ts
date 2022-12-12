import { Component, OnInit, Input, EventEmitter, Output, OnChanges, TemplateRef } from '@angular/core';
import { NbDialogService } from '@nebular/theme';
import { combineLatest } from 'rxjs';
import { CuentasGrupoTransaccion } from '../../../@core/data/models/catalogo/cuentas_subgrupo';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { DynamicDatabase, DynamicDataSource, DynamicFlatNode } from '../../../helpers/catalogo-elementos/arbolHelper';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TipoNivel } from '../../../@core/data/models/catalogo/tipo_nivel';
import { NivelHelper as nh } from '../../../@core/utils/niveles.helper';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Elemento } from '../../../@core/data/models/catalogo/elemento';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { LocalDataSource } from 'ng2-smart-table';

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

  getLevel = (node: DynamicFlatNode) => node.level;
  isExpandable = (node: DynamicFlatNode) => node.expandible;
  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandible;

  treeControl: FlatTreeControl<DynamicFlatNode>;
  dataSourcex: DynamicDataSource;
  mostrar: boolean = false;
  catalogoSeleccionado: number;
  detalle: boolean;
  cuentasContables: Array<CuentasGrupoTransaccion>;
  grupoSeleccionado: Subgrupo;
  nivelSeleccionado: string;
  tipos_de_bien: TipoBien;
  elementosSubgrupo: Elemento;
  settings: any;
  source: LocalDataSource;

  @Input() catalogoId: number;
  @Input() updateSignal: any;
  @Input() acciones: boolean = false;
  @Input() elementos: boolean = false;
  @Output() fila = new EventEmitter<CatalogoArbol>();
  @Input() subgruposInactivos: boolean = false;

  constructor(
    private catalogoHelper: CatalogoElementosHelper,
    private translate: TranslateService,
    private dialogService: NbDialogService,
    private database: DynamicDatabase,
    private tabla: SmartTableService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
  }

  ngOnInit() {
    this.dataSourcex = new DynamicDataSource(this.treeControl, this.database, this.subgruposInactivos, this.elementos);
    this.catalogoSeleccionado = 0;
    this.detalle = false;
    this.cuentasContables = new Array<CuentasGrupoTransaccion>();
    this.loadTablaSettings();

    if (this.updateSignal) {
      this.updateSignal.subscribe((res) => {
        this.dataSourcex.updateNode(res.item, res.parentId);
      });
    }
  }

  ngOnChanges(changes) {
    if (changes && changes.catalogoId) {
      this.catalogoSeleccionado = changes.catalogoId.currentValue;
      this.loadTreeCatalogo();
    }
  }

  loadTreeCatalogo() {
    this.database.getNivelSuperior(this.catalogoId, this.subgruposInactivos).subscribe(res => {
      this.dataSourcex.data = res;
      this.mostrar = true;
    });
  }

  getSelectedRow(selectedRow) {
    this.fila.emit(selectedRow);
  }

  volver() {
    this.detalle = false;
    this.cuentasContables = undefined;
    this.tipos_de_bien = undefined;
    this.elementosSubgrupo = undefined;
  }

  array(n: number): any[] {
    return Array(n);
  }

  getDetalle(selectedRow, dialog: TemplateRef<any>) {
    this.detalle = false;
    this.dialogService.open(dialog);
    this.source.empty();

    this.grupoSeleccionado = selectedRow;
    const observable = combineLatest([
      this.catalogoHelper.getCuentasContables(selectedRow.Id),
      this.catalogoHelper.getDetalleSubgrupo(selectedRow.Id),
      this.catalogoHelper.getElementosSubgrupo(selectedRow.Id),
    ]);
    this.nivelSeleccionado = this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(selectedRow.TipoNivelId.Id) + '.nombre');

    observable.subscribe(([cuentas, detalle, elementos]: any[]) => {
      if (cuentas.length) {
        this.source.load(cuentas.filter(cta => cta.CuentaCreditoId && cta.CuentaDebitoId));

        this.cuentasContables = <Array<CuentasGrupoTransaccion>>
          cuentas.filter(cta => cta.CuentaCreditoId && cta.CuentaDebitoId);
      }
      if (detalle.length) {
        this.tipos_de_bien = <TipoBien>detalle[0].TipoBienId;
      } else {
        this.tipos_de_bien = undefined;
      }
      if (elementos.length) {
        this.elementosSubgrupo = elementos;
      } else {
        this.elementosSubgrupo = undefined;
      }
      this.detalle = true;
    });
  }

  loadTablaSettings() {
    this.source = new LocalDataSource();
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        add: false,
        edit: false,
        delete: false,
      },
      columns: {
        SubtipoMovimientoId: {
          title: this.translate.instant('GLOBAL.tipo_movimiento'),
          ...this.tabla.getSettingsObject('Nombre'),
        },
        TipoBienId: {
          title: this.translate.instant('GLOBAL.tipo_bien'),
          ...this.tabla.getSettingsObject('Nombre'),
        },
        CuentaCreditoId: {
          title: this.translate.instant('GLOBAL.cuenta_debito'),
          ...this.tabla.getSettingsObject('Codigo'),
        },
        CuentaDebitoId: {
          title: this.translate.instant('GLOBAL.cuenta_credito'),
          ...this.tabla.getSettingsObject('Codigo'),
        },
      },
    };
  }

}
