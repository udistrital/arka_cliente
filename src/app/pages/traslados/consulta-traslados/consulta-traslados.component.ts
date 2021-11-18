import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import { EstadoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';

@Component({
  selector: 'ngx-consulta-traslados',
  templateUrl: './consulta-traslados.component.html',
  styleUrls: ['./consulta-traslados.component.scss'],
})
export class ConsultaTrasladosComponent implements OnInit {

  settings: any;
  modo: string = 'consulta';
  source: LocalDataSource;
  estadosMovimiento: Array<EstadoMovimiento>;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private entradasHelper: EntradaHelper,
  ) { }

  ngOnInit() {
    this.loadEstados();
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
        this.loadTablaSettings();
      }
    });
  }
  public onRegister() {
    this.router.navigate(['/pages/traslados/registrar-solicitud']);
  }

  private loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.movimientos.traslados.nuevoTraslado'),
      accion: this.translate.instant('GLOBAL.' +
        (this.modo === 'consulta' ? 'verDetalle' : 'movimientos.traslados.accionRevision')),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
    };
    const estadoSelect = 'GLOBAL.movimientos.estado';
    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.tipo_entrada'),
        width: '300px',
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              { value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado En Trámite').Nombre,
                title: this.translate.instant(estadoSelect + 'Tramite') },
              { value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Aprobado').Nombre,
                title: this.translate.instant(estadoSelect + 'Aprobado') },
              { value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Rechazado').Nombre,
                title: this.translate.instant(estadoSelect + 'Rechazo') },
              { value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Confirmado').Nombre,
                title: this.translate.instant(estadoSelect + 'Confirmado') },
            ],
          },
        },
      },
    } : [];

    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.movimientos.traslados.' +
        (this.modo === 'consulta' ? 'noTrasladosView' : 'noTrasladosReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: false,
        edit: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.detalle'),
            title: '<i class="fas fa-' + t.icon + '" title="' + t.accion + '" aria-label="' + t.accion + '"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="fas fa-plus" title="' + t.registrar + '" aria-label="' + t.registrar + '"></i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: 'Consecutivo',
        },
        FechaCreacion: {
          title: 'Fecha de Creacion',
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
        Funcionario: {
          title: 'Funcionario Destino',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.NombreCompleto;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            if (Object.keys(cell).length !== 0) {
              if (cell.NombreCompleto.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        FuncionarioOrigen: {
          title: 'Funcionario Origen',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.NombreCompleto;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            if (Object.keys(cell).length !== 0) {
              if (cell.NombreCompleto.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Ubicacion: {
          title: 'Ubicacion',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        ...columns,
      },
    };
  }
}
