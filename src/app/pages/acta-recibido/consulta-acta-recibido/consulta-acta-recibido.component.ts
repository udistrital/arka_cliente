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
    // TODO: Si es posible, filtrar desde la API cuando sea necesario
    // (agregar parámetros al request enviado al ARKA_SERVICE)
    this.actaRecibidoHelper.getActasRecibido3().subscribe((res: any) => {
      // console.log(res);
      this.mostrar = true;
      if (res.length !== 0) {
        const resFiltrado = this.actasSegunRol(res);
        this.source.load(resFiltrado);
      }
    });
  }

  private actasSegunRol(actas): any {

    // Los roles que se configuren en este objeto, podrán ver TODAS
    // las actas en ese estado
    const filtroActas = [
      {est: 'Registrada', roles: [Rol.Admin, Rol.Revisor, Rol.Secretaria]},
      {est: 'En Elaboracion', roles: [Rol.Admin, Rol.Revisor]},
      {est: 'En Modificacion', roles: [Rol.Admin, Rol.Revisor]},
      {est: 'En verificacion', roles: [Rol.Admin, Rol.Revisor]},
      {est: 'Aceptada', roles: [Rol.Admin, Rol.Revisor]},
      {est: 'Asociada a Entrada', roles: [Rol.Admin]},
      {est: 'Anulada', roles: [Rol.Admin]},
    ];
    // const uid = this.userService.getPersonaId();
    const uid = 2; // solo para pruebas
    return actas
      // TODO: Comentar/Eliminar el siguiente mapeo (y este comentario)
      // cuando el ARKA_MID retorne en cada objeto los parámetros
      // ContratistaId y ProveedorId (Este mapeo es SOLO para pruebas)
      // Ver https://github.com/udistrital/arka_cliente/issues/363#issuecomment-749920165
      .map((acta, idx) => {

        // Opcion 1 de mapeo de prueba:
        // módulo 4 para "reducir a una cuarta parte" las actas visibles
        // acta.ContratistaId = idx % 4;
        // acta.ProveedorId = (idx + 1) % 4;

        // Opcion 2 de mapeo de prueba:
        // "Asignando" el mismo uid, no se filtrará ningun acta
        // si el(los) rol(es) actual solo permite actas asignadas
        acta.ContratistaId = uid;
        acta.ProveedorId = uid;
        return acta;
      })
      .filter(acta => filtroActas.some(cond =>
        (cond.est === acta.Estado)
        && (
          ((acta.Estado === 'En Elaboracion' || acta.Estado === 'En Modificacion')
            && uid === acta.ContratistaId && this.userService.tieneAlgunRol([Rol.Contratista]))
          || ((acta.Estado === 'En Elaboracion')
            && uid === acta.ProveedorId && this.userService.tieneAlgunRol([Rol.Proveedor]))
          || this.userService.tieneAlgunRol(cond.roles) ) ));
  }

  cargarCampos() {
    this.settings = {
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        delete: false,
        add: false,
      },
      edit: {
        editButtonContent: '<i class="far fa-edit" title="Editar Acta" aria-label="Editar Acta"></i>',
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
        RevisorId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.RevisorHeader'),
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

    if (this.userService.tieneAlgunRol([Rol.Secretaria, Rol.Admin, Rol.Revisor])) {
      this.settings.add = {
        addButtonContent: '<i class="nb-plus" title="Registrar Acta Nueva" aria-label="Registrar Acta Nueva"></i>',
      };
      this.settings.actions.add = true;
    }

    if (this.userService.tieneAlgunRol([Rol.Admin, Rol.Revisor])) {
      this.settings.delete = {
        deleteButtonContent: '<i class="fas fa-ban" title="Anular Acta" aria-label="Anular Acta"></i>',
      };
      this.settings.actions.delete = true;
    }
  }

  anularActa(id: number) {
    // console.log({'idActa': id});

    // 1. Traer acta tal cual está
    this.actaRecibidoHelper.getTransaccionActa(id).subscribe(acta => {
      // console.log({'actaHelper': acta});

      // 2. Crear estado "Anulada"
      // const Transaccion_Acta = new TransaccionActaRecibido();
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
      // console.log({Transaccion_Acta});

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
          type: 'warning',
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.OpcionNoValida'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.OpcionNoValida2'),
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
    // console.log({'Anular': event});
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
            this.anularActa(event.data.Id);
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
