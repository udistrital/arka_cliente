import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { EstadoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { DepreciacionHelper } from '../../../helpers/movimientos/depreciacionHelper';

@Component({
  selector: 'ngx-consulta-depreciacion',
  templateUrl: './consulta-depreciacion.component.html',
  styleUrls: ['./consulta-depreciacion.component.scss'],
})
export class ConsultaDepreciacionComponent implements OnInit {

  settings: any;
  modo: string; // 'consulta' | 'revision'
  modoCrud: string; // create | get | review | update
  source: LocalDataSource;
  estadosMovimiento: Array<EstadoMovimiento>;
  mostrar: boolean;
  filaSeleccionada: any;
  depreciacionId: number;
  title: string;
  subtitle: string;
  depreciaciones: Array<any>;
  continuar: boolean;
  fechaMin: Date;
  tipo: string = 'cierres';

  constructor(
    private translate: TranslateService,
    private entradasHelper: EntradaHelper,
    private route: ActivatedRoute,
    private depreciacionHelper: DepreciacionHelper,
    private pUpManager: PopUpManager,
    private confService: ConfiguracionService,
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data && data.modo !== null && data.modo !== undefined) {
        this.modo = data.modo;
      }
    });
    this.source = new LocalDataSource();
    this.loadEstados();
    this.title = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modo + '.title');
    this.subtitle = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modo + '.subtitle');
  }

  loadMediciones(): void {
    this.depreciacionHelper.getDepreciaciones(this.modo === 'revision').subscribe(res => {
      if (res.length) {
        res.forEach(dep => {
          const detalle = JSON.parse(dep.Detalle);
          dep.FechaCorte = detalle.FechaCorte;
          dep.EstadoMovimientoId = dep.EstadoMovimientoId.Nombre;
          dep.FechaAprobacion = dep.EstadoMovimientoId === 'Cierre Aprobado' ?
            dep.FechaModificacion : '';
        });
      }
      this.source.load(res);
      this.mostrar = true;
      this.depreciaciones = res;
      const pendiente = this.depreciaciones.some(dp => dp.EstadoMovimientoId !== 'Cierre Aprobado');
      const aprobada = this.depreciaciones.some(dp => dp.EstadoMovimientoId === 'Cierre Aprobado');
      const date = (!this.depreciaciones.length || !aprobada) ? -1 :
        (!pendiente) ? this.depreciaciones[0].FechaCorte : this.depreciaciones[1].FechaCorte;
      this.fechaMin = new Date(date);
    });
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
        this.loadTablaSettings();
        this.loadMediciones();
      }
    });
  }

  public actualizarVista(event) {
    if (this.modo === 'revision' && event === true) {
      this.source.remove(this.filaSeleccionada);
    } else if (this.modo === 'consulta' && event === true) {
      this.loadMediciones();
    }
  }

  public onRegister() {
    const allowed = this.depreciaciones.some(d => d.EstadoMovimientoId !== 'Cierre Aprobado');
    if (!allowed) {
      const query = 'Nombre__in:modificandoCuentas,Valor:true';
      this.confService.getAllParametro(query).subscribe(res => {
        if (res && res.length) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.alerta_modificacion'));
        } else {
          this.depreciacionId = 0;
          this.continuar = true;
          this.modoCrud = 'create';
        }
      });
    } else {
      this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.' + this.tipo + '.errorEnCurso'));
    }
  }

  public onEdit(event) {
    this.filaSeleccionada = event.data;
    if (this.modo === 'consulta') {
      if (event.data.EstadoMovimientoId === 'Cierre Rechazado') {
        const query = 'Nombre__in:modificandoCuentas,Valor:true';
        this.confService.getAllParametro(query).subscribe(res => {
          if (res && res.length) {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.alerta_modificacion'));
          } else {
            this.modoCrud = 'update';
            this.continuar = true;
            this.depreciacionId = event.data.Id;
          }
        });
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.' + this.tipo + '.consulta.errorEditar'));
      }
    } else if (this.modo === 'revision') {
      this.modoCrud = 'review';
      this.continuar = true;
      this.depreciacionId = event.data.Id;
    }
  }

  public onView(event) {
    this.modoCrud = 'get';
    this.continuar = true;
    this.depreciacionId = event.data.Id;
  }

  volver() {
    this.modoCrud = '';
    this.filaSeleccionada = null;
    this.continuar = false;
  }

  private loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.' + this.tipo + '.consulta.nuevo'),
      delete: this.translate.instant('GLOBAL.verDetalle'),
      edit: this.translate.instant('GLOBAL.traslados.' + (this.modo === 'consulta' ? this.modo : 'revisar') + '.accionEdit'),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
    };
    const estadoSelect = 'GLOBAL.cierres.estados.';
    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.cierres.consulta.estado'),
        width: '35%',
        valuePrepareFunction: (value) => {
          return value.replace('Cierre ', '');
        },
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Cierre En Curso').Nombre,
                title: this.translate.instant(estadoSelect + 'tramite'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Cierre Aprobado').Nombre,
                title: this.translate.instant(estadoSelect + 'aprobado'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Cierre Rechazado').Nombre,
                title: this.translate.instant(estadoSelect + 'rechazado'),
              },
            ],
          },
        },
      },
    } : [];

    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.' + this.tipo + '.consulta.' +
        (this.modo === 'consulta' ? 'noView' : 'noReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: this.modo === 'consulta',
        edit: true,
        add: this.modo === 'consulta' && !!this.confService.getAccion('registrarCierre'),
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
          width: '20%',
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
        FechaCorte: {
          title: this.translate.instant('GLOBAL.fechaCorte'),
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
        Observacion: {
          title: this.translate.instant('GLOBAL.observaciones'),
          width: '25%',
        },
        ...columns,
      },
    };
  }

  private formatDate(value) {
    const date = new Date(value);
    date.setUTCMinutes(date.getTimezoneOffset());
    return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
  }

}
