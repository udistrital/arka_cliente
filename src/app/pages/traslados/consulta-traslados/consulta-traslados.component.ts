import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import { EstadoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { TrasladosHelper } from '../../../helpers/movimientos/trasladosHelper';

@Component({
  selector: 'ngx-consulta-traslados',
  templateUrl: './consulta-traslados.component.html',
  styleUrls: ['./consulta-traslados.component.scss'],
})
export class ConsultaTrasladosComponent implements OnInit {

  settings: any;
  modo: string = 'consulta'; // 'revision'
  modoCrud: string; // 'ver' - 'editar'
  source: LocalDataSource;
  estadosMovimiento: Array<EstadoMovimiento>;
  mostrar: boolean;
  filaSeleccionada: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private entradasHelper: EntradaHelper,
    private trasladosHelper: TrasladosHelper,
  ) { }

  ngOnInit() {
    this.source = new LocalDataSource();
    this.loadEstados();
  }

  loadTraslados(): void {
    this.trasladosHelper.getTraslados(this.modo === 'revision').subscribe(res => {
      if (res.length) {
        res.forEach(salida => {
          const detalle = JSON.parse(salida.Detalle);
          salida.FuncionarioOrigen = detalle.FuncionarioOrigen;
          salida.FuncionarioDestino = detalle.FuncionarioDestino;
          salida.Consecutivo = detalle.Consecutivo;
          salida.Ubicacion = detalle.Ubicacion;
          salida.EstadoMovimientoId = this.estadosMovimiento.find(estado =>
            estado.Id === salida.EstadoMovimientoId.Id).Nombre;
        });
        this.source.load(res);
        this.source.setSort([{ field: 'FechaCreacion', direction: 'desc' }]);
        this.mostrar = true;
      }
    });
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
        this.loadTablaSettings();
        this.loadTraslados();
      }
    });
  }

  public onRegister() {
    this.router.navigate(['/pages/traslados/registrar-solicitud']);
  }

  public onEdit(event) {
    this.filaSeleccionada = event.data;
    if (this.modo === 'consulta') {
      this.modoCrud = 'ver';
    } else {
      this.modoCrud = 'editar';
    }
  }

  private loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.traslados.consulta.nuevoTraslado'),
      delete: this.translate.instant('GLOBAL.verDetalle'),
      edit: this.translate.instant('GLOBAL.traslados.consulta.' +
        (this.modo === 'consulta' ? 'accionEdit' : 'accionRevision')),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
    };
    const estadoSelect = 'GLOBAL.movimientos.estado';
    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.traslados.consulta.estadoTraslado'),
        width: '300px',
        // filter: {
        //   type: 'list',
        //   config: {
        //     selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
        //     list: [
        //       { value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado En Trámite').Nombre,
        //         title: this.translate.instant(estadoSelect + 'Tramite') },
        //       { value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Aprobado').Nombre,
        //         title: this.translate.instant(estadoSelect + 'Aprobado') },
        //       { value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Rechazado').Nombre,
        //         title: this.translate.instant(estadoSelect + 'Rechazo') },
        //       { value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Confirmado').Nombre,
        //         title: this.translate.instant(estadoSelect + 'Confirmado') },
        //     ],
        //   },
        // },
      },
    } : [];

    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.traslados.consulta.' +
        (this.modo === 'consulta' ? 'noTrasladosView' : 'noTrasladosReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: this.modo === 'consulta',
        edit: true,
      },
      add: {
        addButtonContent: '<i class="fas fa-plus" title="' + t.registrar + '" aria-label="' + t.registrar + '"></i>',
      },
      edit: {
        editButtonContent: '<i class="fas fa-edit" title="' + t.edit + '" aria-label="' + t.edit + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-eye" title="' + t.delete + '" aria-label="' + t.delete + '"></i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.Acciones'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
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
        FuncionarioDestino: {
          title: this.translate.instant('GLOBAL.funcionarioDestino'),
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value;
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
          title: this.translate.instant('GLOBAL.funcionarioOrigen'),
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value;
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
          title: this.translate.instant('GLOBAL.ubicacion'),
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value;
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
