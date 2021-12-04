import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { EstadoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { BajasHelper } from '../../../helpers/bajas/bajasHelper';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-consulta-bajas',
  templateUrl: './consulta-bajas.component.html',
  styleUrls: ['./consulta-bajas.component.scss'],
})
export class ConsultaBajasComponent implements OnInit {

  settings: any;
  modo: string; // consulta | revision | aprobacion
  modoCrud: string; // registrar | ver | editar | revisar | aprobar
  source: LocalDataSource;
  estadosMovimiento: Array<EstadoMovimiento>;
  mostrar: boolean;
  filaSeleccionada: any;
  bajaId: number;

  constructor(
    private confService: ConfiguracionService,
    private entradasHelper: EntradaHelper,
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private bajasHelper: BajasHelper,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data && data.modo !== null && data.modo !== undefined) {
        this.modo = data.modo;
      }
    });
    this.source = new LocalDataSource();
    this.loadEstados();
  }

  public onRegister() {
    this.modoCrud = 'registrar';
    this.bajaId = 0;
  }

  public onEdit(event) {
    this.filaSeleccionada = event.data;
    if (this.modo === 'consulta') {
      if (event.data.EstadoMovimientoId === 'Baja Rechazada') {
        this.modoCrud = 'editar';
        this.bajaId = event.data.Id;
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.consulta.errorEditar'));
      }
    } else if (this.modo === 'revision') {
      this.modoCrud = 'revisar';
      this.bajaId = event.data.Id;
    } else if (this.modo === 'aprobacion') {
      this.modoCrud = 'aprobar';
      this.bajaId = event.data.Id;
    }
  }

  public onDelete(event) {
    this.filaSeleccionada = event.data;
    this.modoCrud = 'ver';
    this.bajaId = event.data.Id;
  }

  public volver() {
    this.modoCrud = '';
    this.filaSeleccionada = null;
  }

  public actualizarVista() {
    if (this.modo !== 'consulta') {
      this.source.remove(this.filaSeleccionada);
    } else {
      this.loadBajas();
    }
    this.volver();
  }

  private loadBajas(): void {
    this.bajasHelper.getSolicitudes(this.modo === 'aprobacion', this.modo === 'revision').subscribe((res: any) => {
      if (res.length) {
        res.forEach(baja => {
          baja.EstadoMovimientoId = this.estadosMovimiento.find(estado =>
            estado.Id === baja.EstadoMovimientoId).Nombre;
        });
      }
      this.source.load(res);
      this.source.setSort([{ field: 'FechaCreacion', direction: 'desc' }]);
      this.mostrar = true;
    });
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
        this.loadTablaSettings();
        this.loadBajas();
      }
    });
  }

  private loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.bajas.consulta.nuevo'),
      delete: this.translate.instant('GLOBAL.verDetalle'),
      edit: this.translate.instant('GLOBAL.bajas.' + (this.modo === 'consulta' ? this.modo : 'revisar') + '.accionEdit'),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
    };
    const estadoSelect = 'GLOBAL.bajas.estados.';
    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.bajas.consulta.estadoBaja'),
        width: '300px',
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Baja En Trámite').Nombre,
                title: this.translate.instant(estadoSelect + 'tramite'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Baja Rechazada').Nombre,
                title: this.translate.instant(estadoSelect + 'rechazado'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Baja En Comité').Nombre,
                title: this.translate.instant(estadoSelect + 'comite'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Baja Aprobada').Nombre,
                title: this.translate.instant(estadoSelect + 'aprobado'),
              },
            ],
          },
        },
      },
    } : [];

    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.bajas.consulta.' +
        (this.modo === 'consulta' ? 'noBajasView' : 'noBajasReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: this.modo === 'consulta',
        edit: true,
        add: this.confService.getAccion('registrarTraslado') !== undefined,
      },
      add: {
        addButtonContent: '<em class="fas fa-plus" title="' + t.registrar + '" aria-label="' + t.registrar + '"></em>',
      },
      edit: {
        editButtonContent: '<em class="fas fa-edit" title="' + t.edit + '" aria-label="' + t.edit + '"></em>',
      },
      delete: {
        deleteButtonContent: '<em class="fas fa-eye" title="' + t.delete + '" aria-label="' + t.delete + '"></em>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '70px',
          valuePrepareFunction: (value) => {
            const date = new Date(Date.parse(value)).toLocaleDateString('es-CO');
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
        FechaRevisionAlmacen: {
          title: this.translate.instant('GLOBAL.bajas.consulta.fechaRevA'),
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
        FechaRevisionComite: {
          title: this.translate.instant('GLOBAL.bajas.consulta.fechaRevC'),
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
          title: this.translate.instant('GLOBAL.bajas.consulta.solicitante'),
          valuePrepareFunction: (value: any) => {
            if (value) {
              return value;
            } else {
              return '';
            }
          },
        },
        Revisor: {
          title: this.translate.instant('GLOBAL.bajas.consulta.revisor'),
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value;
            } else {
              return '';
            }
          },
        },
        ...columns,
      },
    };
  }

}
