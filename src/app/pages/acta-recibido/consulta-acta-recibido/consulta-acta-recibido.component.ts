import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { NavigationEnd, Router } from '@angular/router';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { ConsultaActaRecibido } from '../../../@core/data/models/acta_recibido/consulta_actas';
import Swal from 'sweetalert2';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { UserService } from '../../../@core/data/users.service';
import { PermisoUsuario_t as Permiso } from '../../../@core/data/models/roles/rol_usuario';
import { TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import { EstadoActa, EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { CommonActas } from '../shared';

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

  source: LocalDataSource;
  actas: Array<ConsultaActaRecibido>;
  Ubicaciones: any;
  navigationSubscription;

  settings: any;
  accion: string;
  actas2: any;
  mostrar: boolean;
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
  ) {

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseInvites();
      }
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.cargarCampos();
    });

    this.cargarCampos();
    this.source = new LocalDataSource(); // create the source
    this.actas = new Array<ConsultaActaRecibido>();

  }
  initialiseInvites() {
    // Set default values and re-fetch any data you need.
    // this.ngOnInit();
    this.actaSeleccionada = '';
    this.accion = '';
    // console.log('1')
  }

  ngOnInit() {
    // const estados = ['Registrada', 'Anulada'];
    const usuario = this.userService.getUserMail();

    // this.actaRecibidoHelper.getActasRecibidoPorEstados(estados).subscribe((res: any) => {
    this.actaRecibidoHelper.getActasRecibidoUsuario(usuario).subscribe((res: any) => {
      // console.log(res);
      if (Array.isArray(res) && res.length !== 0) {
        res = this.calculaRevisores(res);
        this.source.load(res);
      }
      this.mostrar = true;
    });
  }

  // TODO: Lo ideal sería que el MID, así como retorna 'FechaVistoBueno'
  // de una vez retorne la persona que dió dicho visto bueno
  // (Si se llega a implementar, esta función sería innecesaria y se podría eliminar)
  private calculaRevisores(actas) {

    const estadosAceptada: EstadoActa_t[] = [
      EstadoActa_t.Aceptada,
      EstadoActa_t.AsociadoEntrada,
    ];

    const data = actas.map(acta => {
      let aceptada = '';
      if (estadosAceptada.some(est => acta.EstadoActaId.Id === est)) {
        aceptada = acta.RevisorId;
      }
      acta.AceptadaPor = aceptada;
      return acta;
    });
    return data;
  }

  cargarCampos() {
    const f = {
      registrar: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Title'),
      editar: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Title'),
      anular: this.translate.instant('GLOBAL.Acta_Recibido.Anular'),
    };
    this.settings = {
      noDataMessage: 'No se encontraron elementos asociados.',
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
        FechaModificacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaModificacionHeader'),
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
        RevisorId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.ModificadaPor'),
          valuePrepareFunction: (value: any) => {
            return value;
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
        AceptadaPor: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.AceptadaPor'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        PersonaAsignada: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ContratistaAsignado'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        EstadoActaId: {
          title: this.translate.instant('GLOBAL.estado'),
          valuePrepareFunction: (value: EstadoActa) => {
            return this.traducirEstado(value.Id);
          },
          filterFunction: (actual: EstadoActa, requerido: string) => {
            return actual.CodigoAbreviacion === requerido;
          },
          filter: {
            type: 'list',
            config: {
              selectText: this.translate.instant('GLOBAL.seleccione'),
              list: ORDEN_ESTADOS.map((estado: EstadoActa_t) => {
                const value = EstadoActa_t[estado];
                const title = this.traducirEstado(estado);
                return {value, title};
              }),
            },
          },
        },
        UbicacionId: {
          title: this.translate.instant('GLOBAL.dependencia'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Observaciones: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.ObservacionesHeader'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
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
          if (res !== null) {
            (Swal as any).fire({
              type: 'success',
              title: this.translate.instant('GLOBAL.Acta_Recibido.AnuladaOkTitulo',
                { ACTA: id }),
              text: this.translate.instant('GLOBAL.Acta_Recibido.AnuladaOkMsg',
                { ACTA: id }),
                showConfirmButton: false,
                timer: 2000,
            });

            // Se usa una redirección "dummy", intermedia. Ver
            // https://stackoverflow.com/a/49509706/3180052
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigateByUrl('/pages/acta_recibido/consulta_acta_recibido');
            });
            this.mostrar = true;
          }
        });
    });
  }

  onEdit(event): void {
    // console.log({event})
    let editarActa = false;
    let validarActa: boolean;

    const estId = event.data.EstadoActaId.Id;
    switch (estId) {
      case EstadoActa_t.EnVerificacion:
      case EstadoActa_t.Registrada:
      case EstadoActa_t.EnElaboracion:
      case EstadoActa_t.EnModificacion:
      case EstadoActa_t.Aceptada:
        this.actaSeleccionada = `${event.data.Id}`;
        this.accion = '';
        editarActa = true;
        break;

      default: {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.error'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.EdicionBloqueada', {
            NUM: event.data.Id,
            STATE: event.data.Estado,
          }),
        });
        break;
      }
    }

    validarActa = event.data.EstadoActaId.Id === EstadoActa_t.EnVerificacion;
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
    this.accion = 'Ver';
    this.verActa = true;
  }

  onDelete(event): void {
    switch (event.data.EstadoActaId.Id) {

      case EstadoActa_t.EnVerificacion:
      case EstadoActa_t.Registrada:
      case EstadoActa_t.EnElaboracion:
      case EstadoActa_t.EnModificacion:
      case EstadoActa_t.Aceptada:
        (Swal as any).fire({
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.DialogoAnularTitulo', { 'ACTA': event.data.Id }),
          text: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.DialogoAnularMsg', { 'ACTA': event.data.Id }),
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Anular Acta',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
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
        this.ngOnInit();
        break;

      default:
        (Swal as any).fire({
          title: this.translate.instant('GLOBAL.error'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.ErrorAnularMsg', {
            ACTA: event.data.Id,
            ESTADO: this.traducirEstado(event.data.EstadoActaId.Id),
          }),
          type: 'error',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ok',
        });
        break;

    }
  }

  onBack() {
    this.initialiseInvites();
    this.editarActa = false;
    this.verActa = false;
    this.validarActa = false;
    // console.log('1')
  }

  private formatDate(value) {
    const date = new Date(value);
    date.setUTCMinutes(date.getTimezoneOffset());
    return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
  }

  traducirEstado(estado: EstadoActa_t): string {
    return this.translate.instant(CommonActas.i18nEstado(estado));
  }
}
