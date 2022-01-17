import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { EstadoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { AjustesHelper } from '../../../helpers/movimientos/ajustesHelper';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-consulta-ajuste',
  templateUrl: './consulta-ajuste.component.html',
  styleUrls: ['./consulta-ajuste.component.scss'],
})
export class ConsultaAjusteComponent implements OnInit {

  settings: any;
  modo: string; // consulta | revision
  modoCrud: string; // registrar | editar | ver | revisar
  source: LocalDataSource;
  estadosMovimiento: Array<EstadoMovimiento>;
  mostrar: boolean;
  filaSeleccionada: any;
  ajusteId: number;
  title: string;
  subtitle: string;

  constructor(
    private translate: TranslateService,
    private entradasHelper: EntradaHelper,
    private route: ActivatedRoute,
    private pUpManager: PopUpManager,
    private confService: ConfiguracionService,
    private ajustesHelper: AjustesHelper,
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data && data.modo !== null && data.modo !== undefined) {
        this.modo = data.modo;
      }
    });
    this.source = new LocalDataSource();
    this.loadEstados();
    this.title = this.translate.instant('GLOBAL.ajustes.' + this.modo + '.title');
    this.subtitle = this.translate.instant('GLOBAL.ajustes.' + this.modo + '.subtitle');
  }

  loadAjustes(): void {
    const rol = this.confService.getAccion('aprobarAjusteContabilidad') !== undefined ? 'Almacén' :
      this.confService.getAccion('aprobarAjusteAlmacen') !== undefined ? 'Contabilidad' : '';
    this.ajustesHelper.getAll(this.modo === 'revision', rol).subscribe(res => {
      if (res.length) {
        res.forEach(mov => {
          mov.Detalle = JSON.parse((mov.Detalle));
          mov.Consecutivo = mov.Detalle.Consecutivo;
          mov.EstadoMovimientoId = mov.EstadoMovimientoId.Nombre;
          mov.FechaAprobacion = mov.EstadoMovimientoId === 'Ajuste Aprobado' ?
            mov.FechaModificacion : '';
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
        this.loadAjustes();
      }
    });
  }

  public actualizarVista() {
    if (this.modo === 'revision') {
      this.source.remove(this.filaSeleccionada);
    } else {
      this.loadAjustes();
    }
    this.volver();
  }

  public onRegister() {
    this.modoCrud = 'registrar';
    this.ajusteId = 0;
  }

  public onEdit(event) {
    this.filaSeleccionada = event.data;
    if (this.modo === 'consulta') {
      if (event.data.EstadoMovimientoId === 'Ajuste Rechazado') {
        this.modoCrud = 'editar';
        this.ajusteId = event.data.Id;
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.ajustes.consulta.errorEditar'));
      }
    } else if (this.modo === 'revision') {
      this.modoCrud = 'revisar';
      this.ajusteId = event.data.Id;
    }
  }

  public onDelete(event) {
    this.filaSeleccionada = event.data;
    this.modoCrud = 'ver';
    this.ajusteId = event.data.Id;
  }

  volver() {
    this.modoCrud = '';
    this.filaSeleccionada = null;
  }

  private loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.ajustes.consulta.nuevo'),
      delete: this.translate.instant('GLOBAL.verDetalle'),
      edit: this.translate.instant('GLOBAL.ajustes.' + (this.modo === 'consulta' ? this.modo : 'revisar') + '.accionEdit'),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
    };
    const estadoSelect = 'GLOBAL.ajustes.estados.';

    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.ajustes.consulta.' +
        (this.modo === 'consulta' ? 'noView' : 'noReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: this.modo === 'consulta',
        edit: true,
        add: this.confService.getAccion('registrarAjuste') !== undefined,
      },
      add: {
        addButtonContent: '<i class="fas" title="' + t.registrar + '" aria-label="' + t.registrar + '">'
        + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
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
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '150px',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '15%',
          valuePrepareFunction: (value) => {
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
        FechaAprobacion: {
          title: this.translate.instant('GLOBAL.fechaAprobacion'),
          width: '15%',
          valuePrepareFunction: (value) => {
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
        EstadoMovimientoId: {
          title: this.translate.instant('GLOBAL.ajustes.consulta.estado'),
          width: '300px',
          filter: {
            type: 'list',
            config: {
              selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
              list: [
                {
                  value: this.estadosMovimiento.find(status => status.Nombre === 'Ajuste En Trámite').Nombre,
                  title: this.translate.instant(estadoSelect + 'tramite'),
                },
                {
                  value: this.estadosMovimiento.find(status => status.Nombre === 'Ajuste Aprobado por Contabilidad').Nombre,
                  title: this.translate.instant(estadoSelect + 'contabilidad'),
                },
                {
                  value: this.estadosMovimiento.find(status => status.Nombre === 'Ajuste Aprobado por Almacén').Nombre,
                  title: this.translate.instant(estadoSelect + 'almacen'),
                },
                {
                  value: this.estadosMovimiento.find(status => status.Nombre === 'Ajuste Aprobado').Nombre,
                  title: this.translate.instant(estadoSelect + 'aprobado'),
                },
                {
                  value: this.estadosMovimiento.find(status => status.Nombre === 'Ajuste Rechazado').Nombre,
                  title: this.translate.instant(estadoSelect + 'rechazado'),
                },
              ],
            },
          },
        },
      },
    };
  }

  private formatDate(value) {
    const date = new Date(value);
    date.setUTCMinutes(date.getTimezoneOffset());
    return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
  }
}
