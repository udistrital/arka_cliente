import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ServerDataSource } from 'ng2-smart-table';
import { NavigationEnd, Router } from '@angular/router';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import Swal from 'sweetalert2';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { UserService } from '../../../@core/data/users.service';
import { PermisoUsuario_t as Permiso } from '../../../@core/data/models/roles/rol_usuario';
import { TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import { EstadoActa, EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { CommonActas } from '../shared';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { ListService } from '../../../@core/store/services/list.service';
import { HttpClient } from '@angular/common/http';
import { PopUpManager } from '../../../managers/popUpManager';

const ORDEN_ESTADOS: EstadoActa_t[] = [
  EstadoActa_t.Registrada,
  EstadoActa_t.EnElaboracion,
  EstadoActa_t.EnModificacion,
  EstadoActa_t.EnVerificacion,
  EstadoActa_t.Aceptada,
  EstadoActa_t.AsociadoEntrada,
  EstadoActa_t.Anulada,
];

@Component({
  selector: 'ngx-consulta-acta-recibido',
  templateUrl: './consulta-acta-recibido.component.html',
  styleUrls: ['./consulta-acta-recibido.component.scss'],
})
export class ConsultaActaRecibidoComponent implements OnInit {

  actaSeleccionada: string;
  editarActa: boolean = false;
  verActa: boolean = false;
  validarActa: boolean = false;
  mostrar: boolean = true;

  source: ServerDataSource;
  settings: any;

  navigationSubscription;

  permisos: {
    Acta: Permiso,
    Elementos: Permiso,
  } = {
      Acta: Permiso.Ninguno,
      Elementos: Permiso.Ninguno,
    };

  constructor(
    private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private confService: ConfiguracionService,
    private userService: UserService,
    private tabla: SmartTableService,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private http: HttpClient,
  ) {
    this.listService.findSedes();
    this.listService.findListsActa();
    this.listService.findUnidades();
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.onBack(false);
      }
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.setSettings();
    });

  }

  ngOnInit() {
    this.setSettings();
    const user = this.userService.getUserMail();
    this.source = new ServerDataSource(this.http, {
      endPoint: this.actaRecibidoHelper.getEndpointAllActas(user),
      pagerLimitKey: 'limit',
      pagerPageKey: 'offset',
      filterFieldKey: '#field#',
      sortFieldKey: 'sortby',
      sortDirKey: 'order',
      totalKey: 'x-total-count',
    });
  }

  private setSettings() {
    const f = {
      registrar: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Title'),
      editar: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Title'),
      anular: this.translate.instant('GLOBAL.Acta_Recibido.Anular'),
    };
    this.settings = {
      pager: {
        display: true,
      },
      noDataMessage: 'No se encontraron actas.',
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: !!this.confService.getAccion('anularActaRecibido'),
        add: !!this.confService.getRoute('/pages/acta_recibido/registro_acta_recibido'),
      },
      add: {
        addButtonContent: '<i class="fas" title="' + f.registrar + '" aria-label="' + f.registrar + '">' +
          this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      edit: {
        editButtonContent: '<i class="far fa-edit" title="' + f.editar + '" aria-label="' + f.editar + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-ban" title="' + f.anular + '" aria-label="' + f.anular + '"></i>',
      },
      mode: 'external',
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.ConsecutivoHeader'),
          width: '90px',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaCreacionHeader'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        FechaModificacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaModificacionHeader'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        FechaVistoBueno: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaVistoBuenoHeader'),
          width: '70px',
          ...this.tabla.getSettingsDate_(),
        },
        EstadoActaId: {
          title: this.translate.instant('GLOBAL.estado'),
          valuePrepareFunction: (value) => {
            return this.traducirEstado(value);
          },
          filter: {
            type: 'list',
            config: {
              selectText: this.translate.instant('GLOBAL.seleccione'),
              list: ORDEN_ESTADOS.map((estado: EstadoActa_t) => {
                const value = EstadoActa_t[estado];
                const title = this.traducirEstado(estado);
                return { value, title };
              }),
            },
          },
        },
        Observaciones: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.ObservacionesHeader'),
        },
        PersonaAsignada: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ContratistaAsignado'),
          sort: false,
          filter: false,
        },
        RevisorId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.ModificadaPor'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
          sort: false,
          filter: false,
        },
        AceptadaPor: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.AceptadaPor'),
          sort: false,
          filter: false,
        },
        DependenciaId: {
          title: this.translate.instant('GLOBAL.dependencia'),
          sort: false,
          filter: false,
        },
      },
    };
  }

  anularActa(id: number, obs: string) {
    this.mostrar = false;

    // 1. Traer acta tal cual está
    this.actaRecibidoHelper.getTransaccionActa(id, true).subscribe(acta => {

      // 2. Crear estado "Anulada"

      const Transaccion_Acta = <TransaccionActaRecibido>acta;

      Transaccion_Acta.UltimoEstado.Id = null;
      Transaccion_Acta.UltimoEstado.EstadoActaId = <EstadoActa>{ Id: EstadoActa_t.Anulada };
      Transaccion_Acta.UltimoEstado.Observaciones += ' // Razon de anulación: ' + obs;

      // 3. Anular acta
      this.actaRecibidoHelper.putTransaccionActa(Transaccion_Acta, id)
        .subscribe(res => {
          if (res) {
            this.pUpManager.showAlertWithOptions(this.optionsAnular(id));
            this.source.refresh();
            this.mostrar = true;
          }
        });
    });
  }

  onEdit(event): void {
    // console.log({event})
    let editarActa = false;
    let validarActa: boolean;

    const estId = event.data.EstadoActaId;
    switch (estId) {
      case EstadoActa_t.EnVerificacion:
      case EstadoActa_t.Registrada:
      case EstadoActa_t.EnElaboracion:
      case EstadoActa_t.EnModificacion:
      case EstadoActa_t.Aceptada:
        this.actaSeleccionada = `${event.data.Id}`;
        editarActa = true;
        break;

      default: {
        const options = this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.EdicionBloqueada', {
          NUM: event.data.Id,
          STATE: this.traducirEstado(event.data.EstadoActaId),
        });
        this.pUpManager.showErrorAlert(options);
        break;
      }
    }

    validarActa = event.data.EstadoActaId === EstadoActa_t.EnVerificacion;
    this.editarActa = editarActa && !validarActa;
    this.validarActa = validarActa;
    // console.log({'this.estadoActaSeleccionada':this.estadoActaSeleccionada});
  }

  onCreate(event): void {
    // console.log({'onCreate': event});
    this.router.navigate(['/pages/acta_recibido/registro_acta_recibido']);
  }

  seleccionarActa(event): void {
    // console.log({event});
    this.actaSeleccionada = `${event.data.Id}`;
    this.verActa = true;
    this.router.navigate(['/pages/acta_recibido/consulta_acta_recibido/' + event.data.Id]);
  }

  onDelete(event): void {
    switch (event.data.EstadoActaId) {

      case EstadoActa_t.EnVerificacion:
      case EstadoActa_t.Registrada:
      case EstadoActa_t.EnElaboracion:
      case EstadoActa_t.EnModificacion:
      case EstadoActa_t.Aceptada:
        this.pUpManager.showAlertWithOptions(this.optionsConfrmAnular(event.data))
          .then((result) => {
            if (result.value) {
              (Swal as any).mixin({
                input: 'text',
                confirmButtonText: 'Anular',
                showCancelButton: true,
                progressSteps: ['1'],
              }).queue([
                {
                  title: 'Observaciones',
                  text: 'Inserte la razon de la anulación',
                },
              ]).then((result2) => {
                if (result2.value) {
                  this.anularActa(event.data.Id, result2.value);
                }
              });
            }
          });
        break;

      default:
        const options = this.translate.instant('GLOBAL.Acta_Recibido.ErrorAnularMsg', {
          ACTA: event.data.Id,
          ESTADO: this.traducirEstado(event.data.EstadoActaId),
        });
        this.pUpManager.showErrorAlert(options);
        break;

    }
  }

  onBack(refresh: boolean) {
    if (refresh) {
      this.source.refresh();
    }
    this.actaSeleccionada = '';
    this.editarActa = false;
    this.verActa = false;
    this.validarActa = false;
  }

  traducirEstado(estado: EstadoActa_t): string {
    return this.translate.instant(CommonActas.i18nEstado(estado));
  }

  private optionsConfrmAnular(data: any) {
    return {
      title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.DialogoAnularTitulo', { 'ACTA': data.Id }),
      text: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.DialogoAnularMsg', { 'ACTA': data.Id }),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Anular Acta',
      cancelButtonText: 'Cancelar',
    };
  }

  private optionsAnular(id) {
    const base = 'GLOBAL.Acta_Recibido.AnuladaOk';
    return {
      type: 'success',
      title: this.translate.instant(base + 'Titulo', { ACTA: id }),
      text: this.translate.instant(base + 'Msg', { ACTA: id }),
    };
  }

}
