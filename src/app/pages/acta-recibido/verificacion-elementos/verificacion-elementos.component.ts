import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as XLSX from 'xlsx';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';
import { Impuesto, ElementoActa, Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Store } from '@ngrx/store';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { IAppState } from '../../../@core/store/app.state';
import { Router, NavigationEnd } from '@angular/router';
import { LocalDataSource } from 'ngx-smart-table';
import { ElementoSalida } from '../../../@core/data/models/salidas/salida_elementos';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';

@Component({
  selector: 'ngx-verificacion-elementos',
  templateUrl: './verificacion-elementos.component.html',
  styleUrls: ['./verificacion-elementos.component.scss'],
})
export class VerificacionElementosComponent implements OnInit {
  selectMode: string;

  @Input('DatosRecibidos')
  set name(data: any[]) {
    // console.log(data)
    this.AjustarDatos(data);
  }

  @Input('mode')
  set name2(w: any) {
    // console.log(w);
    this.selectMode = w;
    this.cargarCampos();
  }
  @Output() DatosEnviados = new EventEmitter();

  source: any;
  elementos: Elemento[];
  Consumo: any;
  ConsumoControlado: any;
  Devolutivo: any;
  settings: any;
  Datos: Elemento[];

  constructor(private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private salidasHelper: SalidaHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager) {
    this.listService.findSubgruposConsumo();
    this.listService.findSubgruposConsumoControlado();
    this.listService.findSubgruposDevolutivo();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.cargarCampos();
    });
    this.source = new LocalDataSource(); // create the source
    this.elementos = new Array<Elemento>();
    this.cargarCampos();
    this.loadLists();

  }
  ngOnInit() {

  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Consumo = list.listConsumo[0];
        this.ConsumoControlado = list.listConsumoControlado[0];
        this.Devolutivo = list.listDevolutivo[0];

      },
    );

  }
  onRowSelect(event) {

    if (event.source.data.length === event.selected.length) {
      this.DatosEnviados.emit(true);
    } else {
      this.DatosEnviados.emit(false);
    }
  }
  cargarCampos() {
    this.settings = {
      hideSubHeader: true,
      selectMode: this.selectMode,
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        delete: false,
        edit: false,
      },
      mode: 'external',
      columns: {
        TipoBienId: {
          title: 'Tipo de Bien',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        SubgrupoCatalogoId: {
          title: 'Subgrupo',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Nombre: {
          title: 'Nombre',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Cantidad: {
          title: 'Cantidad',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Marca: {
          title: 'Marca',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Serie: {
          title: 'Serie',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        UnidadMedida: {
          title: 'Unidad de Medida',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        ValorUnitario: {
          title: 'Valor Unitario',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Subtotal: {
          title: 'Subtotal',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Descuento: {
          title: 'Descuento',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        PorcentajeIvaId: {
          title: 'IVA',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        ValorIva: {
          title: 'Valor IVA',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        ValorTotal: {
          title: 'Valor Total',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
      },
    };
  }

  AjustarDatos(datos: any[]) {
    // console.log(datos);
    this.Datos = new Array<Elemento>();
    for (const index in datos) {
      if (true) {
        // console.log(datos[index])
        const elemento = new Elemento;
        elemento.ValorUnitario = datos[index].ValorUnitario;
        elemento.ValorTotal = datos[index].ValorTotal;
        elemento.Id = datos[index].Id;
        elemento.Nombre = datos[index].Nombre;
        elemento.Cantidad = datos[index].Cantidad;
        elemento.Marca = datos[index].Marca;
        elemento.Serie = datos[index].Serie;
        elemento.TipoBienId = datos[index].TipoBienId;
        elemento.Subtotal = datos[index].Subtotal;
        elemento.Descuento = datos[index].Descuento;
        elemento.UnidadMedida = datos[index].UnidadMedida;
        elemento.ValorIva = datos[index].ValorIva;
        elemento.PorcentajeIvaId = datos[index].PorcentajeIvaId;

        if (datos[index].TipoBienId.Id === 1 && Object.keys(this.Consumo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        if (datos[index].TipoBienId.Id === 2 && Object.keys(this.ConsumoControlado[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        if (datos[index].TipoBienId.Id === 3 && Object.keys(this.Devolutivo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        this.Datos.push(elemento);
      }
    }
    if (this.Datos !== undefined) {
      this.source.load(this.Datos);
    }
  }

  onEdit(event): void {
  }

  itemselec(event): void {

  }
  onCreate(event): void {

  }

  onDelete(event): void {

  }

  onBack() {

  }


}
