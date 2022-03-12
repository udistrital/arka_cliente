import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ActaRecibido, ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-crear-auto',
  templateUrl: './crear-auto.component.html',
  styleUrls: ['./crear-auto.component.scss'],
})
export class CrearAutoComponent implements OnInit {

  mostrar: boolean = false;
  textoCargando: string;
  consecutivo: string;
  // Datos Tabla

  ActasAsociadas: LocalDataSource;
  // Acta de recibido
  actaSeleccionada: string;
  settingsListaActas: any;

  valid: boolean;
  DatosElementos: Array<any>;
  submited: boolean;
  resultado: any;

  private actas: any[];

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private translate: TranslateService,
    private pUpManager: PopUpManager,

  ) {
    this.ActasAsociadas = new LocalDataSource();
    this.actaSeleccionada = '';
  }

  ngOnInit() {
    this.textoCargando = 'Cargando actas';
    this.loadTablasSettings();
    this.loadActas();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  loadTablasSettings() {
    this.settingsListaActas = {
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
            title: '<i class="fa fa-location-arrow" title="Ver movimientos asociados"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '70px',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaCreacionHeader'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            return this.formatDate(value);
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
        FechaVistoBueno: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaVistoBuenoHeader'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value ? this.formatDate(value) :
              this.translate.instant('GLOBAL.bajas.consulta.espera');
              return date;
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
        RevisorId: {
          title: this.translate.instant('GLOBAL.revisor'),
        },
        UbicacionId: {
          title: this.translate.instant('GLOBAL.ubicacion'),
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
    this.actaRecibidoHelper.getAllActasRecibidoByEstado(['Asociada a Entrada']).subscribe(res => {
      if (Array.isArray(res) && res.length !== 0) {
        const data = <Array<ActaRecibidoUbicacion>>res;
        this.actas = data;
        this.ActasAsociadas.load(this.actas);
        this.mostrar = true;
      }
    });
  }

  CargarMovimientosAsociados(event) {
    this.actaSeleccionada = `${event.data.Id}`;
  }

  eventoListaElementos(event: any) {
    this.DatosElementos = event;
  }

  setElementosValidos(event: any): void {
    this.valid = event;
  }

  public generarAjuste() {
    const alert = this.alerta;
    alert.title = this.translate.instant('GLOBAL.ajuste-auto.alerta-pre-txt');
    alert.text = this.translate.instant('GLOBAL.ajuste-auto.alerta-pre-ttl');

    this.pUpManager.showAlertWithOptions(alert).then((result) => {
      if (result.value) {
        this.onSubmit();
      }
    });

  }

  onVolver() {
    this.actaSeleccionada = '';
    this.resultado = undefined;
    this.submited = false;
  }

  onSubmit() {
    this.textoCargando = 'Calculando ajuste';
    this.mostrar = false;
    this.DatosElementos.forEach(el => {
      el.SubgrupoCatalogoId = el.SubgrupoCatalogoId.SubgrupoId.Id;
      el.ValorResidual = el.ValorTotal * el.ValorResidual / 100;
      el.ActaRecibidoId = <ActaRecibido>{ Id: +this.actaSeleccionada };
      el.EstadoElementoId = <ActaRecibido>{ Id: 2 };
    });
    this.actaRecibidoHelper.postAjusteAutomatico(this.DatosElementos).subscribe((res: any) => {
      if (res.Elementos !== null) {

        this.consecutivo = JSON.parse(res.Movimiento.Detalle).Consecutivo;
        const alert = this.alerta;
        alert.type = 'success';
        alert.showCancelButton = false;
        alert.title = this.translate.instant('GLOBAL.ajuste-auto.alerta-success-ttl');
        if (res.TrContable) {
          alert.text = this.translate.instant('GLOBAL.ajuste-auto.alerta-success-cont-txt');
        } else {
          alert.text = this.translate.instant('GLOBAL.ajuste-auto.alerta-success-inv-txt');
        }

        this.pUpManager.showAlertWithOptions(alert);

        this.mostrar = true;
        this.submited = true;
        this.resultado = res;
        this.resultado.TrContable = {
          movimientos: res.TrContable,
          rechazo: '',
        };

      } else {
        this.mostrar = true;
        this.valid = false;
        const alert = this.alerta;
        alert.title = this.translate.instant('GLOBAL.ajuste-auto.no-necesario-ttl');
        alert.text = this.translate.instant('GLOBAL.ajuste-auto.no-necesario-txt');
        alert.confirmButtonText = this.translate.instant('GLOBAL.aceptar');
        alert.showCancelButton = false;
        this.pUpManager.showAlertWithOptions(alert);
      }
    });
  }

  private formatDate(value) {
    const date = new Date(value);
    date.setUTCMinutes(date.getTimezoneOffset());
    return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
  }

  get alerta() {
    return {
      type: 'warning',
      title: '',
      text: '',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

}
