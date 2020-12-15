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
import { RolUsuario_t as Rol } from '../../../@core/data/models/roles/rol_usuario';

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
        let resFiltrado;

        // TODO: Agregar más complejidad a esta parte, la implementación
        // fue corta para efectos del Issue #347 ...
        // ... Pero podría llegarse a algo similar a lo realizado
        // en el componente edicion-acta-recibido
        if (this.userService.tieneAlgunRol([Rol.Secretaria])) {
          resFiltrado = res.filter(acta => acta.Estado === 'Registrada');
        } else {
          resFiltrado = res;
        }

        this.source.load(resFiltrado);
      }
    });
  }

  cargarCampos() {

    this.settings = {
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="fas fa-pencil-alt"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-eye"></i>',
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
  itemselec(event): void {
    // console.log('afssaf');
  }
  onCreate(event): void {
    this.router.navigate(['/pages/acta_recibido/registro_acta_recibido']);
  }

  onDelete(event): void {
    // console.log(event.data.Estado)
    this.actaSeleccionada = `${event.data.Id}`;
    this.estadoActaSeleccionada = 'Ver';
    this.accion = 'Ver';
    this.verActa = true;
    // console.log('1')
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
