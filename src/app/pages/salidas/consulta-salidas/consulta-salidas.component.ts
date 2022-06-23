import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ActivatedRoute, Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { EstadoMovimiento, Movimiento } from '../../../@core/data/models/entrada/entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { SmartTableService } from '../../../@core/data/SmartTableService';

@Component({
  selector: 'ngx-consulta-salidas',
  templateUrl: './consulta-salidas.component.html',
  styleUrls: ['./consulta-salidas.component.scss'],
})
export class ConsultaSalidasComponent implements OnInit {
  source: LocalDataSource;
  editarSalida: boolean;
  entradaParametro: string;
  settings: any;
  salidaId: string;
  spinner: string;
  consecutivoSalida: string;
  modo: string = 'consulta';
  estadosMovimiento: Array<EstadoMovimiento>;
  movimiento: Movimiento;
  filaSeleccionada: any;
  transaccionContable: any;
  submitted: boolean;

  constructor(
    private pUpManager: PopUpManager,
    private router: Router,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private entradasHelper: EntradaHelper,
    private confService: ConfiguracionService,
    private tabla: SmartTableService) {
    this.source = new LocalDataSource();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.route.data.subscribe(data => {
      if (data && data.modo) {
        this.modo = data.modo;
      }
    });

    this.route.paramMap.subscribe(params => {
      if (params && +params.get('id')) {
        this.salidaId = this.route.snapshot.paramMap.get('id');
        this.cargarSalida();
        this.loadEstados(false);
      } else {
        this.loadSalidas();
        this.loadEstados(true);
      }
    });

  }

  loadEstados(lista: boolean) {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length) {
        this.estadosMovimiento = res;
        if (lista) {
          this.loadTablaSettings();
        }
      }
    });
  }

  loadSalidas(): void {
    this.spinner = 'Cargando Salidas';
    this.salidasHelper.getSalidas(this.modo === 'revision').subscribe(res => {
      if (res.length) {
        res.forEach(salida => {
          const movimientoPadre = salida.MovimientoPadreId;
          salida.MovimientoPadreId = movimientoPadre ? JSON.parse(movimientoPadre.Detalle).consecutivo : '';
          salida.EstadoMovimientoId = this.estadosMovimiento.find(estado =>
            estado.Id === salida.EstadoMovimientoId).Nombre;
          salida.FechaModificacion = salida.EstadoMovimientoId === 'Salida Aprobada' ? salida.FechaModificacion : '';
        });
        this.source.load(res);
      }
      this.spinner = '';
    });
  }

  onDelete(event) {
    this.router.navigateByUrl('/pages/salidas/consulta_salidas/' + event.data.Id);
  }

  onEdit(event) {
    if (this.modo === 'revision') {
      this.router.navigateByUrl('/pages/salidas/aprobar_salidas/' + event.data.Id);
    } else if (event.data.EstadoMovimientoId === 'Salida Rechazada') {
      this.salidaId = `${event.data.Id}`;
      this.editarSalida = true;
      this.filaSeleccionada = event.data;
      this.cargarSalida();
    } else {
      this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.salidas.errorEditar'));
    }
  }

  onRegister() {
    this.router.navigate(['/pages/salidas/registro_salidas']);
  }

  onVolver() {
    this.editarSalida = false;
    this.salidaId = '';
    this.entradaParametro = '';
    this.filaSeleccionada = undefined;
    this.transaccionContable = undefined;
    this.submitted = false;
    this.router.navigateByUrl('/pages/salidas/' +
      (this.modo === 'consulta' ? 'consulta' : this.modo === 'revision' ? 'aprobar' : '') + '_salidas');
  }

  private cargarSalida() {
    this.entradasHelper.getMovimiento(this.salidaId).toPromise().then((res: any) => {
      this.entradaParametro = res[0].MovimientoPadreId.Id;
      this.movimiento = res[0];
    });
  }

  confirmSubmit(aprobar: boolean) {
    if (this.movimiento.EstadoMovimientoId.Nombre === 'Salida En Trámite') {
      this.pUpManager.showAlertWithOptions(this.getOptionsSubmit(aprobar))
        .then((result) => {
          if (result.value) {
            this.submitted = true;
            this.onSubmitRevision(aprobar);
          }
        });
    }
  }

  private onSubmitRevision(aprobar: boolean) {
    if (aprobar) {
      this.spinner = 'Actualizando salida y generando transacción contable';
      this.salidasHelper.postSalida(this.movimiento.Id).toPromise().then((res: any) => {
        this.spinner = '';
        if (res && res.errorTransaccion === '') {
          const obj = JSON.parse(res.movimientoArka.Detalle);
          this.transaccionContable = res.transaccionContable;
          this.consecutivoSalida = obj.consecutivo;
          this.alertSuccess(true);
        } else if (res && res.errorTransaccion !== '') {
          this.pUpManager.showErrorAlert(res.errorTransaccion);
          this.onVolver();
        }
      });
    } else {
      this.spinner = 'Actualizando salida';
      const estado = this.estadosMovimiento.find(estadoMovimiento => estadoMovimiento.Nombre === 'Salida Rechazada').Id;
      this.movimiento.EstadoMovimientoId = <EstadoMovimiento>{ Id: estado };
      this.entradasHelper.putMovimiento(this.movimiento).toPromise().then((res: any) => {
        this.spinner = '';
        if (res) {
          this.alertSuccess(false);
        }
      });
    }
  }

  private alertSuccess(aprobar: boolean) {
    this.source.remove(this.filaSeleccionada);
    const consecutivo = this.movimiento.Detalle ? JSON.parse(this.movimiento.Detalle).consecutivo : '';
    this.pUpManager.showAlertWithOptions(this.getOptionsSuccess(aprobar, consecutivo));
    if (!aprobar) {
      this.onVolver();
    }
  }

  loadTablaSettings() {
    const t = {
      add: this.translate.instant('GLOBAL.movimientos.salidas.nuevaSalida'),
      delete: this.translate.instant('GLOBAL.verDetalle'),
      edit: this.translate.instant('GLOBAL.' + (this.modo === 'consulta' ? 'salidas.titulo_editar' : 'movimientos.salidas.accionRevision')),
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
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Salida En Trámite').Nombre,
                title: this.translate.instant(estadoSelect + 'Tramite'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Salida Aprobada').Nombre,
                title: this.translate.instant(estadoSelect + 'Aprobado'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Salida Rechazada').Nombre,
                title: this.translate.instant(estadoSelect + 'Rechazo'),
              },
            ],
          },
        },
      },
    } : [];
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.movimientos.salidas.' + (this.modo === 'consulta' ? 'noSalidasView' : 'noSalidasReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: this.modo === 'consulta',
        edit: true,
        add: !!this.confService.getRoute('/pages/salidas/registro_salidas'),
      },
      add: {
        addButtonContent: '<i class="fas" title="' + t.add + '" aria-label="' + t.add + '">' + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      edit: {
        editButtonContent: '<i class="far fa-edit" title="' + t.edit + '" aria-label="' + t.edit + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="far fa-eye" title="' + t.delete + '" aria-label="' + t.delete + '"></i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: 'Consecutivo',
        },
        Observacion: {
          title: 'Observaciones',
        },
        FechaCreacion: {
          title: 'Fecha de Creacion',
          width: '70px',
          valuePrepareFunction: this.tabla.formatDate,
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
          title: this.translate.instant('GLOBAL.fechaAprobacion'),
          width: '70px',
          valuePrepareFunction: this.tabla.formatDate,
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        MovimientoPadreId: {
          title: 'Entrada Asociada',
        },
        Funcionario: {
          title: 'Funcionario',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.NombreCompleto;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
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
        Sede: {
          title: 'Sede',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
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
        Dependencia: {
          title: 'Dependencia',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
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
            // console.log(cell);
            // console.log(search);
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

  private getOptionsSubmit(aprobar: boolean): any {
    return {
      title: this.translate.instant('GLOBAL.movimientos.salidas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTtl'),
      text: this.translate.instant('GLOBAL.movimientos.salidas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTxt'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

  private getOptionsSuccess(aprobar: boolean, consecutivo: string): any {
    return {
      type: 'success',
      title: this.translate.instant('GLOBAL.movimientos.salidas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'TtlOk'),
      text: this.translate.instant('GLOBAL.movimientos.salidas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'TxtOk',
        { CONSECUTIVO: consecutivo }),
    };
  }

}
