import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { PopUpManager } from '../../../managers/popUpManager';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { SmartTableService } from '../../../@core/data/SmartTableService';

@Component({
  selector: 'ngx-lista-movimientos',
  templateUrl: './lista-movimientos.component.html',
  styleUrls: ['./lista-movimientos.component.scss'],
})

export class ListaMovimientosComponent implements OnInit {

  spinner: string;
  ajustes: LocalDataSource;
  actas: LocalDataSource;
  actaSeleccionada: string;
  valid: boolean;
  DatosElementos: Array<any>;
  settingsAjustes: any;
  settingsActas: any;
  ajuste: any;
  crear: boolean;
  title: string;
  subtitle: string;

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private translate: TranslateService,
    private salidasHelper: SalidaHelper,
    private pUpManager: PopUpManager,
    private confService: ConfiguracionService,
    private tabla: SmartTableService,
  ) {
    this.ajustes = new LocalDataSource();
    this.actas = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
  }

  ngOnInit() {
    this.title = this.translate.instant('GLOBAL.ajuste-auto.consultaTtl');
    this.subtitle = this.translate.instant('GLOBAL.ajuste-auto.consultaSbttl');
    this.loadTablasSettings();
    this.loadAjustes(true);
  }

  private loadTablasSettings() {
    this.settingsAjustes = this.sttAjustes;
    this.settingsActas = this.sttActas;
  }

  loadActas(): void {
    const query = 'Nombre__in:modificandoCuentas|cierreEnCurso,Valor:true';
    this.confService.getAllParametro(query).subscribe(res => {
      if (res && res.length) {
        if (res[0].Nombre === 'cierreEnCurso') {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.alerta_modificacion'));
        }
      } else {
        this.spinner = 'Cargando Actas';
        this.title = this.translate.instant('GLOBAL.ajustes.registrar.accion');
        this.subtitle = this.translate.instant('GLOBAL.ajuste-auto.sugActa');
        this.actaRecibidoHelper.getAllActasRecibidoByEstado(['AsociadoEntrada'], -1, 0).subscribe(res_ => {
          this.actas.load(res_);
          this.spinner = '';
          this.crear = true;
        });
      }
    });
  }

  private loadAjustes(spinner: boolean): void {
    if (spinner) {
      this.spinner = 'Cargando ajustes';
    }
    this.salidasHelper.getAjustes().subscribe(res => {
      if (res.length) {
        res.forEach(ajuste => {
          const detalle = JSON.parse(ajuste.Detalle);
          ajuste.Consecutivo = detalle.Consecutivo;
          ajuste.Numero = detalle.Elementos.length;
          ajuste.TrContable = detalle.TrContable;
        });
      }
      this.ajustes.load(res);
      this.spinner = '';
    });
  }

  public loadAjuste(event) {
    this.spinner = 'Cargando ajuste';
    this.salidasHelper.getDetalleAjuste(event.data.Id).subscribe(res => {
      if (res.Elementos) {
        this.ajuste = res;
        this.ajuste.TrContable = {
          movimientos: res.TrContable,
          rechazo: '',
        };

        this.title = this.translate.instant('GLOBAL.ajuste-auto.registroTtlS',
          { CONSECUTIVO: JSON.parse(res.Movimiento.Detalle).Consecutivo });
        this.subtitle = this.translate.instant('GLOBAL.ajuste-auto.sbtttlInfo');
      }
      this.spinner = '';
    });
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

  onSubmit() {
    this.spinner = 'Calculando ajuste';
    this.DatosElementos.forEach(el => {
      el.SubgrupoCatalogoId = el.SubgrupoCatalogoId.SubgrupoId.Id;
      el.TipoBienId = +el.TipoBienId.Id;
      el.ValorResidual = el.ValorTotal * el.ValorResidual / 100;
      el.ActaRecibidoId = <ActaRecibido>{ Id: +this.actaSeleccionada };
      el.EstadoElementoId = <ActaRecibido>{ Id: 2 };
    });
    this.actaRecibidoHelper.postAjusteAutomatico(this.DatosElementos).subscribe((res: any) => {
      this.spinner = '';
      if (res.Elementos !== null) {
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
        this.actaSeleccionada = '';
        this.ajuste = res;
        this.ajuste.TrContable = {
          movimientos: res.TrContable,
          rechazo: '',
        };

        this.title = this.translate.instant('GLOBAL.ajuste-auto.registroTtlS',
          { CONSECUTIVO: JSON.parse(res.Movimiento.Detalle).Consecutivo });
        this.subtitle = this.translate.instant('GLOBAL.ajuste-auto.sbtttlInfo');
        this.loadAjustes(false);
      } else {
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

  public loadElementos(event) {
    this.actaSeleccionada = `${event.data.Id}`;
    this.title = this.translate.instant('GLOBAL.ajustes.registrar.accion');
    this.subtitle = this.translate.instant('GLOBAL.ajuste-auto.sugActa');
  }

  onVolver() {
    if (this.actaSeleccionada) {
      this.actaSeleccionada = '';
      this.title = this.translate.instant('GLOBAL.ajustes.registrar.accion');
      this.subtitle = this.translate.instant('GLOBAL.ajuste-auto.sugActa');
    } else {
      this.title = this.translate.instant('GLOBAL.ajuste-auto.consultaTtl');
      this.subtitle = this.translate.instant('GLOBAL.ajuste-auto.consultaSbttl');
      this.crear = false;
      this.ajuste = undefined;
    }
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

  get sttActas() {
    const settings = {
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
            title: '<i class="fa fa-arrow-right" title="Ver movimientos asociados"></i>',
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
          ...this.tabla.getSettingsDate(),
        },
        FechaVistoBueno: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaVistoBuenoHeader'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value ? this.tabla.formatDate(value) :
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

    return settings;
  }

  get sttAjustes() {
    const txt = this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Title');
    const settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_actas_entrada'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: !!this.confService.getAccion('registrarAjusteAuto'),
        edit: false,
        delete: false,
        custom: [
          {
            name: 'detalle',
            title: '<i class="fa fa-eye" title="Ver movimientos asociados"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="fas" title="' + txt + '" aria-label="' + txt +
          '">' + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '30%',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaCreacionHeader'),
          width: '30%',
          ...this.tabla.getSettingsDate(),
        },
        TrContable: {
          title: this.translate.instant('GLOBAL.ajuste-auto.afectacionContable'),
          width: '15%',
          valuePrepareFunction: (value: any) => {
            return value ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');
          },
        },
        Numero: {
          title: this.translate.instant('GLOBAL.ajuste-auto.numeroElementos'),
          width: '15%',
        },
      },
    };

    return settings;

  }

}
