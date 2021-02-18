import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import { NavigationEnd, Router } from '@angular/router';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { ConsultaActaRecibido } from '../../../@core/data/models/acta_recibido/consulta_actas';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { UserService } from '../../../@core/data/users.service';
import { RolUsuario_t as Rol, PermisoUsuario_t as Permiso } from '../../../@core/data/models/roles/rol_usuario';
import { TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { permisosSeccionesActas } from '../../acta-recibido/edicion-acta-recibido/reglas';

@Component({
  selector: 'ngx-consulta-acta-recibido',
  templateUrl: './consulta-acta-recibido.component.html',
  styleUrls: ['./consulta-acta-recibido.component.scss'],
})
export class ConsultaActaRecibidoComponent implements OnInit {

  actaSeleccionada: string;
  estadoActaSeleccionada: string;

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
  constructor(private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private store: Store<IAppState>,

    private terceroshelper: TercerosHelper,
    private pUpManager: PopUpManager,
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
    this.estadoActaSeleccionada = '';
    this.accion = '';
    // console.log('1')
  }

  ngOnInit() {
    // const estados = ['Registrada', 'Anulada'];
    const usuario = this.userService.getUsuario();

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

    const estadosAceptada = ['Aceptada', 'Asociada a Entrada'];

    const data = actas.map(acta => {
      let aceptada = '';
      if (estadosAceptada.some(est => acta.Estado === est)) {
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
        delete: this.userService.tieneAlgunRol([Rol.Admin, Rol.Revisor]),
        add: this.userService.tieneAlgunRol([Rol.Secretaria, Rol.Admin, Rol.Revisor]),
      },
      add: {
        addButtonContent: '<i class="fas fa-plus" title="' + f.registrar + '" aria-label="' + f.registrar + '"></i>',
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
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaModificacionHeader'),
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
        Estado: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.EstadoHeader'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
          filter: {
            type: 'list',
            config: {
              selectText: 'Select...',
              list: [
                { value: 'Registrada', title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.Registrada') },
                { value: 'En Elaboracion', title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.Elaboracion') },
                { value: 'En Modificacion', title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.Modificacion') },
                { value: 'En Verificacion', title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.Verificacion') },
                { value: 'Aceptada', title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.Aceptada') },
                { value: 'Asociada a Entrada', title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.Asociada') },
                { value: 'Anulada', title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.Anulada') },
              ],
            },
          },
        },
        UbicacionId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.UbicacionHeader'),
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
    // console.log({'idActa': id});

    // 1. Traer acta tal cual está
    this.actaRecibidoHelper.getTransaccionActa(id).subscribe(acta => {
      // console.log({'actaHelper': acta});
      // 2. Crear estado "Anulada"

      const Transaccion_Acta = <TransaccionActaRecibido>acta[0];
      const nuevoEstado = <HistoricoActa>{
        Id: null,
        ActaRecibidoId: Transaccion_Acta.ActaRecibido,
        Activo: true,
        EstadoActaId: { Id: EstadoActa_t.Anulada },
        FechaCreacion: new Date(),
        FechaModificacion: new Date(),
      };
      Transaccion_Acta.UltimoEstado = nuevoEstado;
      Transaccion_Acta.ActaRecibido.Observaciones += ' // Razon de anulación: ' + obs;

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
            });

            // Se usa una redirección "dummy", intermedia. Ver
            // https://stackoverflow.com/a/49509706/3180052
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigateByUrl('/pages/acta_recibido/consulta_acta_recibido');
            });
          }
        });
    });
  }

  onEdit(event): void {
    // console.log({'event.data': event.data});
    let editarActa = false;
    let validarActa: boolean;

    switch (event.data.Estado.toString()) {
      case 'En verificacion':
      case 'Registrada':
      case 'En Elaboracion':
      case 'En Modificacion':
      case 'Aceptada':
        this.actaSeleccionada = `${event.data.Id}`;
        this.estadoActaSeleccionada = `${event.data.Estado}`;
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

    validarActa = event.data.Estado.toString() === 'En verificacion';
    this.editarActa = editarActa && !validarActa;
    this.validarActa = validarActa;
    // console.log({'this.estadoActaSeleccionada':this.estadoActaSeleccionada});
  }

  onCreate(event): void {
    // console.log({'onCreate': event});
    this.router.navigate(['/pages/acta_recibido/registro_acta_recibido']);
  }

  seleccionarActa(event): void {
    // console.log(event.data.Estado)
    this.actaSeleccionada = `${event.data.Id}`;
    this.estadoActaSeleccionada = 'Ver';
    this.accion = 'Ver';
    this.verActa = true;
    // console.log('1')
  }

  onDelete(event): void {
    switch (event.data.Estado) {

      case 'Registrada':
      case 'En Elaboracion':
      case 'En Modificacion':
      case 'En Verificacion':
      case 'Aceptada':
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
          text: this.translate.instant('GLOBAL.Acta_Recibido.ErrorAnularMsg',
            { ACTA: event.data.Id, ESTADO: event.data.Estado }),
          type: 'error',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Ok',
        });
        break;

    }
  }

  onBack() {
    this.actaSeleccionada = '';
    this.estadoActaSeleccionada = '';
    this.accion = '';
    this.editarActa = false;
    this.verActa = false;
    this.validarActa = false;
    // console.log('1')
  }

}
