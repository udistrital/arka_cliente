import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';

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
  title: string;

  @Input() ActaParaEditar: any;
  @Input() EntradaId: number;
  @Output() volver: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private entradasHelper: EntradaHelper,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    this.source = new LocalDataSource();
    this.actaSeleccionada = '';
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
  }

  ngOnInit() {
    if (this.EntradaId && this.ActaParaEditar) {
      this.cargarTiposDeEntradas();
      this.title = this.translate.instant('GLOBAL.movimientos.fff');
    } else {
      this.loadTablaSettings();
      this.loadActas();
      this.title = this.translate.instant('GLOBAL.registrar_entrada');
    }
    this.actaSeleccionada = this.EntradaId && this.ActaParaEditar ? this.ActaParaEditar : '';
    this.movimientoId = this.EntradaId ? this.EntradaId : 0;
  }

  onVolver() {
    const update = this.EntradaId && this.ActaParaEditar;
    if (update && !this.opcionEntrada) {
      this.volver.emit(true);
    } else if (update) {
      this.opcionEntrada = '';
    } else if (!update && this.opcionEntrada) {
      this.opcionEntrada = '';
    } else if (!update && this.actaSeleccionada) {
      this.actaSeleccionada = '';
    } else {
      this.volver.emit(true);
    }
  }

  onSubmit(entrada: TransaccionEntrada) {
    if (entrada.Detalle) {
      this.mostrar = false;
      if (this.EntradaId) {
        entrada.Id = this.EntradaId;
      }
      this.entradasHelper.postEntrada(entrada).subscribe((res: any) => {
        this.mostrar = true;
        if (res.Detalle) {
          const consecutivo = JSON.parse(res.Detalle).consecutivo;
          this.pUpManager.showAlertWithOptions(this.getOptionsRegistro(consecutivo));
          // volver
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.registroFail'));
        }
      });
    }

  }

  private getOptionsRegistro(consecutivo: string) {
    return {
      type: 'success',
      title: this.translate.instant('GLOBAL.movimientos.entradas.registroTtlOk', { CONSECUTIVO: consecutivo }),
      text: this.translate.instant('GLOBAL.movimientos.entradas.registroTxtOk', { CONSECUTIVO: consecutivo }),
    }
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
      if (res && res.length) {
        this.source.load(res);
        this.mostrar = true;
      }
    });
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
      this.mostrar = true;
      // this.actaSeleccionada = this.ActaParaEditar;
    });
  }
}
