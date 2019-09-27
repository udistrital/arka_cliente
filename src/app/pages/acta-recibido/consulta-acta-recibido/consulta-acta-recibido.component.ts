import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import { Router } from '@angular/router';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { ConsultaActaRecibido } from '../../../@core/data/models/acta_recibido/consulta_actas';
import { stringify } from '@angular/compiler/src/util';
import { Ubicacion } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Subscription, combineLatest, empty } from 'rxjs';
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
  Ubicaciones: Array<Ubicacion>;

  settings = {
    noDataMessage: 'No se encontraron elementos asociados.',
    actions: {
      columnTitle: 'Acciones',
      custom: [
        {
          name: 'Ver',
          title: '<i class="fas fa-eye"></i>',
        },
        {
          name: 'Editar',
          title: '<i class="fas fa-pencil-alt"></i>',
        },
      ],
      position: 'right',
      add: false,
      edit: false,
      delete: false,
    },
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
  accion: string;
  actas2: any;
  mostrar: boolean;
  constructor(private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.cargarCampos();
    });
    this.source = new LocalDataSource(); // create the source
    this.actas = new Array<ConsultaActaRecibido>();
  }
  ngOnInit() {
    const observable = combineLatest([
      this.actaRecibidoHelper.getParametrosSoporte(),
      this.actaRecibidoHelper.getActasRecibido2(),
    ]);
    observable.subscribe(([parametros, actas]) => {
      this.Traer_Ubicaciones(parametros[0].Ubicaciones);
      this.loadActas(actas);
    });


  }
  Traer_Ubicaciones(res: any) {
    this.Ubicaciones = new Array<Ubicacion>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const ubicacion = new Ubicacion;
        ubicacion.Id = res[index].Id;
        ubicacion.Codigo = res[index].Codigo;
        ubicacion.Estado = res[index].Estado;
        ubicacion.Nombre = res[index].Nombre;
        this.Ubicaciones.push(ubicacion);
      }
    }
  }
  cargarCampos() {

    this.settings = {
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        custom: [
          {
            name: 'Ver',
            title: '<i class="fas fa-eye"></i>',
          },
          {
            name: 'Editar',
            title: '<i class="fas fa-pencil-alt"></i>',
          },
        ],
        position: 'right',
        add: false,
        edit: false,
        delete: false,
      },
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
  onCustom(event: any) {

    this.actaSeleccionada = `${event.data.Id}`;
    this.estadoActaSeleccionada = `${event.data.Estado}`;
    this.accion = `${event.action}`;
  }
  onRegister() {
    this.router.navigate(['/pages/acta_recibido/registro_acta_recibido']);
  }

  loadActas(res: any): void {
    this.mostrar = true;
    if (res !== undefined && res !== []) {
      for (const index in res) {
        if (res.hasOwnProperty(index)) {
          const acta = new ConsultaActaRecibido;
          const ubicacion = this.Ubicaciones.find(ubicacion_ => ubicacion_.Id === res[index].ActaRecibidoId.UbicacionId);
          if (ubicacion == null) {
            acta.UbicacionId = 'Ubicacion no Especificada';
          } else {
            acta.UbicacionId = ubicacion.Nombre;
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
      this.actaSeleccionada = '';
    } else {
      this.source.load([]);
      this.actaSeleccionada = '';
    }
  }
}
