import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { ElementoSalida } from '../../../@core/data/models/salidas/salida_elementos';
import { combineLatest } from 'rxjs';


@Component({
  selector: 'ngx-consulta-salida-especifica',
  templateUrl: './consulta-salida-especifica.component.html',
  styleUrls: ['./consulta-salida-especifica.component.scss'],
})
export class ConsultaSalidaEspecificaComponent implements OnInit {
  salida_id: number;
  salida: any;
  Proveedores: any;
  Consumo: any;
  Devolutivo: any;
  ConsumoControlado: any;
  Dependencias: any;
  Sedes: any;
  TipoBien: any;
  mode: string = 'determinate';

  @Input('salida_id')
  set name(salida_id: number) {
    this.salida_id = salida_id;
    // console.log(this.subgrupo_id);
    if (this.salida_id !== undefined) {
      this.CargarSalida();
    }
  }

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;

  constructor(
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,

  ) {
    this.source = new LocalDataSource();
    this.detalle = false;
    // this.listService.findProveedores();
    // this.listService.findSedes();
    this.cargarCampos();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      // this.loadTablaSettings();
    });

  }


  CargarSalida() {

    this.salidasHelper.getSalida(this.salida_id).subscribe(res1 => {
      if (Object.keys(res1).length !== 0) {
        res1.Salida.MovimientoPadreId.Detalle =  JSON.parse(res1.Salida.MovimientoPadreId.Detalle).consecutivo;
        this.salida = res1.Salida;
        this.source.load(res1.Elementos);
      }

    });
  }
  cargarCampos() {

    this.settings = {
      hideSubHeader: false,
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        delete: false,
        edit: false,
      },
      columns: {
        Nombre: {
          title: 'Elemento',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        SaldoCantidad: {
          title: 'Cantidad',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Placa: {
          title: 'Placa',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        TipoBienId: {
          title: 'Tipo de Bien',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        SubgrupoCatalogoId: {
          title: 'Subgrupo',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
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
      },
    };
  }

}
