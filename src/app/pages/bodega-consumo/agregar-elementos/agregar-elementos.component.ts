import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'ngx-agregar-elementos',
  templateUrl: './agregar-elementos.component.html',
  styleUrls: ['./agregar-elementos.component.scss'],
})
export class AgregarElementosComponent implements OnInit {

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;

  constructor(private router: Router, private salidasHelper: SalidaHelper, private translate: TranslateService,
    private nuxeoService: NuxeoService, private documentoService: DocumentoService) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.detalle = false;
    this.entradaEspecifica = new Entrada;
    this.contrato = new Contrato;
    this.documentoId = false;
    this.loadTablaSettings();
    this.iniciarParametros();
    this.loadEntradas();
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.detalle'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.detalle'),
            title: '<i class="fas fa-eye" title="Ver"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: 'Id',
        },
        ElementoActaId: {
          title: 'Elemento',
        },
        MovimientoId:{
          title: 'Movimiento',
          valuePrepareFunction: (value: any) => {
            return value.Id;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Id.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        FechaCreacion: {
          title: 'Fecha de Creacion',
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        FechaModificacion: {
          title: 'Fecha de Modificacion',
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        SaldoCantidad: {
          title:  'Saldo Cantidad'
        },
        SaldoValor: {
          title: 'Saldo Valor'
        },
        Unidad: {
          title: 'Unidad',
        },
        ValorUnitario: {
          title: 'Valor Unitario',
        },
      },
    };
  }

  loadEntradas(): void {
    this.salidasHelper.getElementos().subscribe(res => {
      if (Object.keys(res).length !== 0) {
        console.log(res);
        this.source.load(res);
      }
    });
  }

  onCustom(event) {
    // this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
    // // this.consecutivoEntrada = `${event.data.Consecutivo}`;
    // this.consecutivoEntrada = `${event.data.Id}`;
    // this.detalle = true;
  }

  onVolver() {
    this.detalle = !this.detalle;
    this.iniciarParametros();
  }

  iniciarParametros() {
    const tipoEntrada = new TipoEntrada;
    const supervisor = new Supervisor;
    const ordenadorGasto = new OrdenadorGasto;
    this.entradaEspecifica.TipoEntradaId = tipoEntrada;
    this.contrato.Supervisor = supervisor;
    this.contrato.OrdenadorGasto = ordenadorGasto;
  }

  onRegister() {
    this.router.navigate(['/pages/entradas/registro']);
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
  }

}
