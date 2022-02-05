import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ActaRecibido, ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Tercero } from '../../../@core/data/models/terceros';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';

@Component({
  selector: 'ngx-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {

  mostrar: boolean = false;

  // Datos Tabla
  source: LocalDataSource;
  tiposDeEntradas: any;
  // Acta de recibido
  actaSeleccionada: string;
  settings: any;
  opcionEntrada: string = '';
  movimientoId: number;

  @Input() ActaParaEditar: any;
  @Input() entradaId: any;
  @Input() EntradaEdit: any;

  private terceros: Partial<Tercero>[];
  private actas: any[];

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private entradasHelper: EntradaHelper,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
    private listService: ListService,
    private store: Store<IAppState>,
    private tercerosHelper: TercerosHelper,

  ) {
    this.source = new LocalDataSource();
    this.actaSeleccionada = '';
  }

  ngOnInit() {
    if (this.EntradaEdit === true) {
       this.cargarTiposDeEntradas();
    }
    this.loadTablaSettings();
    this.loadActas();
    this.listService.findClases();
    this.listService.findImpuestoIVA();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.loadTerceros();
    this.actaSeleccionada = this.EntradaEdit ? this.EntradaEdit.ActaRecibidoId : '';
    this.movimientoId = this.EntradaEdit ? this.EntradaEdit.Id : '';
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_actas_entrada'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'detalle',
            title: '<i class="fas fa-arrow-right" title="Seleccionar"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '70',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaCreacionHeader'),
          width: '70',
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        FechaVistoBueno: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaVistoBuenoHeader'),
          width: '70',
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        RevisorId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.ModificadaPor'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        UbicacionId: {
          title: this.translate.instant('GLOBAL.dependencia'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        PersonaAsignada: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.AceptadaPor'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Observaciones: {
          title: this.translate.instant('GLOBAL.observaciones'),
          valuePrepareFunction: (value: any) => {
            return value.toUpperCase();
          },
        },
      },
    };
  }

  loadActas(): void {
    this.actaRecibidoHelper.getAllActasRecibidoByEstado(['Aceptada']).subscribe(res => {
      if (Array.isArray(res) && res.length !== 0) {
        const data = <Array<any>>res;
        this.actas = data;
        this.source.load(res);
        this.mostrar = true;
      }
    });
  }

  private loadTerceros(): void {
    this.tercerosHelper.getTerceros().subscribe(terceros => {
      this.terceros = terceros;
      this.mostrarData();
      // console.log({terceros: this.terceros});
    });
  }

  private mostrarData(): void {
    if (!this.mostrar
      && this.actas && this.actas.length
      && this.terceros && this.terceros.length) {
      this.source.load(this.actas.map(acta => {
        const buscar = (tercero: Tercero) => tercero.Id === acta.RevisorId;
        let nombre = '';
        if (this.terceros.some(buscar)) {
          nombre = this.terceros.find(buscar).NombreCompleto;
        }
        acta.RevisorId = nombre;
        return acta;
      }));
      this.mostrar = true;
    }
  }

  onCustom(event) {
    this.actaRecibidoHelper.getTransaccionActa(event.data.Id, true).subscribe(res => {
      res.ActaRecibido.TipoActaId.Id === 1 ?
        this.entradasHelper.getTiposEntradaByOrden(1).subscribe(res_ => {
          this.tiposDeEntradas = res_;
        }) : this.entradasHelper.getTiposEntradaByOrden(2).subscribe(res__ => {
          this.tiposDeEntradas = res__;
        });
      this.actaSeleccionada = `${event.data.Id}`;
    });
  }

  cargarTiposDeEntradas() {
    this.actaRecibidoHelper.getTransaccionActa(this.ActaParaEditar, true).subscribe(res => {
      res.ActaRecibido.TipoActaId.Id === 1 ?
        this.entradasHelper.getTiposEntradaByOrden(1).subscribe(res_ => {
          this.tiposDeEntradas = res_;
        }) : this.entradasHelper.getTiposEntradaByOrden(2).subscribe(res__ => {
          this.tiposDeEntradas = res__;
        });
      this.actaSeleccionada = this.ActaParaEditar;
    });
  }
}
