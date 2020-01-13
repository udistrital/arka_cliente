import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import { NavigationEnd, Router } from '@angular/router';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { ConsultaActaRecibido } from '../../../@core/data/models/acta_recibido/consulta_actas';
import { stringify } from '@angular/compiler/src/util';
import { Ubicacion } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Subscription, combineLatest, empty } from 'rxjs';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';

@Component({
  selector: 'ngx-consulta-acta-recibido',
  templateUrl: './consulta-acta-recibido.component.html',
  styleUrls: ['./consulta-acta-recibido.component.scss'],
})
export class ConsultaActaRecibidoComponent implements OnInit {

  actaSeleccionada: string;
  estadoActaSeleccionada: string;
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
    private listService: ListService,
    private pUpManager: PopUpManager) {
    this.listService.findUbicaciones();
    this.Ubicaciones = {};
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
    this.loadLists();

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
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Ubicaciones = list.listUbicaciones[0];
        if (this.Ubicaciones !== undefined) {
          this.actaRecibidoHelper.getActasRecibido2().subscribe(res => {
            this.loadActas(res);
          });
        }
      },
    );

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
    // console.log(event.data)
    switch (event.data.Estado.toString()) {
      case 'Registrada': {

        this.actaSeleccionada = `${event.data.Id}`;
        this.estadoActaSeleccionada = `${event.data.Estado}`;
        this.accion = '';
        break;
      }
      case 'En Elaboracion': {
        this.actaSeleccionada = `${event.data.Id}`;
        this.estadoActaSeleccionada = `${event.data.Estado}`;
        this.accion = '';
        break;
      }
      case 'En Modificacion': {
        this.actaSeleccionada = `${event.data.Id}`;
        this.estadoActaSeleccionada = `${event.data.Estado}`;
        this.accion = '';
        break;
      }
      case 'En verificacion': {
        this.actaSeleccionada = `${event.data.Id}`;
        this.estadoActaSeleccionada = `${event.data.Estado}`;
        this.accion = '';
        break;
      }

      default: {
        (Swal as any).fire({
          type: 'warning',
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.OpcionNoValida'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.OpcionNoValida2'),
        });
        break;
      }
    }
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
    // console.log('1')
  }

  onBack() {
    this.actaSeleccionada = '';
    this.estadoActaSeleccionada = '';
    this.accion = '';
    // console.log('1')
  }

  loadActas(res: any): void {
    this.actas = new Array<ConsultaActaRecibido>();
    this.mostrar = true;
    if (res !== undefined && res !== []) {
      for (const index in res) {
        if (res.hasOwnProperty(index)) {
          const acta = new ConsultaActaRecibido;
          const ubicacion = this.Ubicaciones.find(ubicacion_ => ubicacion_.Id === res[index].ActaRecibidoId.UbicacionId);
          if (ubicacion == null) {
            acta.UbicacionId = 'Ubicacion no Especificada';
          } else {
            acta.UbicacionId = ubicacion.EspacioFisicoId.Nombre;
          }
          acta.Activo = res[index].ActaRecibidoId.Activo;
          acta.FechaCreacion = res[index].ActaRecibidoId.FechaCreacion;
          acta.FechaModificacion = res[index].ActaRecibidoId.FechaModificacion;
          acta.FechaVistoBueno = res[index].ActaRecibidoId.FechaVistoBueno;
          acta.Id = res[index].ActaRecibidoId.Id;
          acta.Observaciones = res[index].ActaRecibidoId.Observaciones;
          acta.RevisorId = res[index].ActaRecibidoId.RevisorId;
          acta.Estado = res[index].EstadoActaId.Nombre;
          this.actas.push(acta);
        }
      }
      this.source.load(this.actas);
      // console.log('1')
    } else {
      this.source.load([]);
      // console.log('1')
    }
  }
}
