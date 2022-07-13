import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-consulta-solicitud',
  templateUrl: './consulta-solicitud.component.html',
  styleUrls: ['./consulta-solicitud.component.scss'],
})

export class ConsultaSolicitudComponent implements OnInit {

  settings: any;
  source: LocalDataSource;
  salidaId: any;
  mostrar: boolean;
  Editar: boolean = false;

  constructor(
    private translate: TranslateService,
    private bodegaHelper: BodegaConsumoHelper,
    private route: ActivatedRoute,
  ) {
    this.source = new LocalDataSource();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.route.data.subscribe(data => {
      if (data && data.Editar !== null && data.Editar !== undefined) {
        this.Editar = data.Editar;
      }
      this.loadTablaSettings();
      this.loadSalidas();
    });
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.seleccionar'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.seleccionar'),
            title: '<span class="fas fas fa-arrow-right" title="' + this.translate.instant('GLOBAL.seleccionar') + '"></span>',
          },
        ],
      },
      columns: this.columnas,
    };
  }

  loadSalidas(): void {
    this.bodegaHelper.getSolicitudesBodega(this.Editar).subscribe(res => {
      if (res.length) {
        this.source.load(res);
      }
      this.mostrar = true;
    });
  }

  onCustom(event) {
    this.salidaId = {
      Id: event.data.Id,
      Cedula: event.data.Solicitante.Numero,
      Funcionario: event.data.Solicitante.NombreCompleto,
      data: event.data,
    };
  }

  onVolver() {
    this.salidaId = undefined;
  }

  onResponder() {
    this.source.remove(this.salidaId.data);
  }

  get columnas() {
    return {
      Detalle: {
        title: this.translate.instant('GLOBAL.consecutivo'),
        width: '15%',
        valuePrepareFunction: (value: any) => {
          return value ? JSON.parse(value).Consecutivo : '';
        },
        filterFunction: (cell?: any, search?: string): boolean => {
          if (cell && search.length) {
            const consecutivo = JSON.parse(cell).Consecutivo;
            if (consecutivo) {
              if (consecutivo.indexOf(search) > -1) {
                return true;
              }
            }
          }
          return false;
        },
      },
      FechaCreacion: {
        title: this.translate.instant('GLOBAL.fecha_creacion'),
        width: '15%',
        valuePrepareFunction: (value: any) => {
          return this.formatDate(value);
        },
      },
      FechaModificacion: {
        title: this.translate.instant('GLOBAL.fechaRevision'),
        width: '15%',
        valuePrepareFunction: (value: any) => {
          return this.formatDate(value);
        },
      },
      Solicitante: {
        title: this.translate.instant('GLOBAL.solicitante'),
        width: '25%',
        valuePrepareFunction: (value: any) => {
          return !value ? '' :
            value.Numero ? value.Numero + ' - ' + value.NombreCompleto :
              value.NombreCompleto;
        },
        filterFunction: (cell?: any, search?: string): boolean => {
          if (cell && search.length) {
            if (cell.NombreCompleto && cell.Numero) {
              if ((cell.Numero + ' - ' + cell.NombreCompleto.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
                return true;
              } else {
                return false;
              }
            } else if (cell.Nombre) {
              if ((cell.NombreCompleto.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
                return true;
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        },
      },
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.estado'),
        width: '15%',
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              { value: 'Solicitud Pendiente', title: this.translate.instant('GLOBAL.movimientos.estadoPendiente') },
              { value: 'Solicitud Rechazada', title: this.translate.instant('GLOBAL.movimientos.estadoRechazo') },
              { value: 'Solicitud Aprobada', title: this.translate.instant('GLOBAL.movimientos.estadoAprobado') },
            ],
          },
        },
        valuePrepareFunction: (value: any) => {
          return value ? value.Nombre : '';
        },
        filterFunction: (cell?: any, search?: string): boolean => {
          if (cell && search.length) {
            if (cell.Nombre) {
              if ((cell.Nombre).indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        },
      },
    };
  }

  private formatDate(value: Date) {
    const date = new Date(value);
    date.setUTCMinutes(date.getTimezoneOffset());
    return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
  }

}
