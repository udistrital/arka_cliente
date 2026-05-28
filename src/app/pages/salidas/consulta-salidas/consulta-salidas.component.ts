import { Component, OnInit } from '@angular/core';
import { ServerDataSource } from 'ng2-smart-table';
import { ActivatedRoute, Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { EstadoMovimiento, Movimiento } from '../../../@core/data/models/entrada/entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-consulta-salidas',
  templateUrl: './consulta-salidas.component.html',
  styleUrls: ['./consulta-salidas.component.scss'],
})
export class ConsultaSalidasComponent implements OnInit {
  source: ServerDataSource;
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
  trContable: any;
  submitted: boolean;
  title: string;
  subtitle: string;
  puedeAnularSalida: boolean = false;
  detalleRefreshVersion: number = 0;

  constructor(
    private pUpManager: PopUpManager,
    private router: Router,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private entradasHelper: EntradaHelper,
    private confService: ConfiguracionService,
    private tabla: SmartTableService,
    private http: HttpClient,
    private location: Location,
  ) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });

    this.loadEstados();

    this.route.data.subscribe(data => {
      if (data && data.modo) {
        this.title = 'GLOBAL.movimientos.salidas.' + data.modo + 'Ttl';
        this.subtitle = 'GLOBAL.movimientos.salidas.' + data.modo + 'Stl';
        this.modo = data.modo;
        this.loadTablaSettings();
      }
    });

    this.route.paramMap.subscribe(params => {
      if (params && +params.get('id')) {
        this.salidaId = this.route.snapshot.paramMap.get('id');
        this.cargarSalida();
      } else {
        this.setSource();
        const filterString = params.get('filter');
        const filterArray = filterString ? filterString.split('&') : [];
        if (params && filterString && filterArray) {
          const filtros = [];
          filterArray.forEach(f => {
            const filtro = f.split('=');
            if (filtro.length === 2) {
              filtros.push({
                field: filtro[0],
                search: filtro[1],
              });
            }
          });
          this.source.setFilter(filtros, true, false);
        }
      }
    });

  }

  setSource() {
    const estado = this.modo === 'revision' ? 'Salida En Trámite' : '';
    const config = {
      endPoint: this.salidasHelper.getEndpointAllSalidas(estado),
      sortFieldKey: 'sortby',
      sortDirKey: 'order',
      filterFieldKey: '#field#',
      pagerLimitKey: 'limit',
      pagerPageKey: 'page',
      totalKey: 'x-total-count',
    };
    this.source = new ServerDataSource(this.http, config);
    this.onChangesFilter();
  }

  onChangesFilter() {
    this.source.onChanged()
      .pipe(
        filter(event => event.action === 'filter'),
        distinctUntilChanged(),
        debounceTime(200),
      ).subscribe((s: any) => {
        const filtro = [];
        s.filter.filters.forEach(f => {
          if (f.field && f.search) {
            filtro.push(f.field + '=' + f.search);
          }
        });
        this.router.navigate(['/pages/salidas/' + this.getUrlSegment() + '_salidas/q', filtro.join('&')]);
      });
  }

  loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length) {
        this.estadosMovimiento = res;
      }
    });
  }

  onDelete(event) {
    this.router.navigateByUrl('/pages/salidas/consulta_salidas/' + event.data.Id);
  }

  onEdit(event) {
    if (this.modo === 'revision') {
      const query = 'Nombre__in:modificandoCuentas|cierreEnCurso,Valor:true';
      this.confService.getAllParametro(query).subscribe(res => {
        if (res && res.length) {
          if (res[0].Nombre === 'cierreEnCurso') {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
          } else {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.alerta_modificacion'));
          }
        } else {
          this.router.navigateByUrl('/pages/salidas/aprobar_salidas/' + event.data.Id);
        }
      });
    } else {
      if (event.data.EstadoMovimientoId.Nombre === 'Salida Rechazada') {
        const query = 'Nombre__in:cierreEnCurso,Valor:true';
        this.confService.getAllParametro(query).subscribe(res => {
          if (res && res.length) {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
          } else {
            this.salidaId = `${event.data.Id}`;
            this.editarSalida = true;
            this.filaSeleccionada = event.data;
            this.cargarSalida();
          }
        });
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.salidas.errorEditar'));
      }
    }
  }

  onRegister() {
    const query = 'Nombre__in:cierreEnCurso,Valor:true';
    this.confService.getAllParametro(query).subscribe(res => {
      if (res && res.length) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
      } else {
        this.router.navigate(['/pages/salidas/registro_salidas']);
      }
    });
  }

  getUrlSegment() {
    return this.modo === 'consulta' ? 'consulta' : this.modo === 'revision' ? 'aprobar' : '';
  }

  onVolver() {
    this.editarSalida = false;
    this.salidaId = '';
    this.entradaParametro = '';
    this.filaSeleccionada = undefined;
    this.trContable = undefined;
    this.submitted = false;
    this.puedeAnularSalida = false;
    this.location.back();
  }

  private cargarSalida() {
    this.entradasHelper.getMovimiento(this.salidaId).toPromise().then((res: any) => {
      this.entradaParametro = res[0].MovimientoPadreId.Id;
      this.movimiento = res[0];
      this.updateAnularAvailability();
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
      this.salidasHelper.registrarSalida([], this.movimiento.Id).toPromise().then((res: any) => {
        this.spinner = '';
        if (res && !res.Error) {
          if (res.TransaccionContable) {
            const fecha = new Date(res.TransaccionContable.Fecha).toLocaleString();
            this.trContable = {
              rechazo: '',
              movimientos: res.TransaccionContable.movimientos,
              concepto: res.TransaccionContable.Concepto,
              fecha,
            };
          }
          this.consecutivoSalida = res.Movimiento.Consecutivo;
          this.alertSuccess(true);
        } else if (res && res.Error) {
          this.pUpManager.showErrorAlert(res.Error);
          this.onVolver();
        }
      });
    } else {
      this.spinner = 'Actualizando salida';
      this.salidasHelper.editarSalida({}, +this.salidaId, true).subscribe((res: any) => {
        this.spinner = '';
        if (res && res.EstadoMovimientoId && res.EstadoMovimientoId.Id) {
          this.alertSuccess(false);
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.salidas.errorEditar'));
        }
      });
    }
  }

  private alertSuccess(aprobar: boolean) {
    this.source.remove(this.filaSeleccionada);
    this.pUpManager.showAlertWithOptions(this.getOptionsSuccess(aprobar, this.movimiento.Consecutivo));
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
    const consulta = this.modo === 'consulta';
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.movimientos.salidas.' + (consulta ? 'noSalidasView' : 'noSalidasReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: consulta,
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
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        MovimientoPadreId: {
          title: this.translate.instant('GLOBAL.entradaAsociada'),
          ...this.tabla.getSettingsObject('Consecutivo'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        FechaCorte: {
          title: this.translate.instant('GLOBAL.fechaAprobacion'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        EstadoMovimientoId: {
          title: this.translate.instant('GLOBAL.estadoSalida'),
          hide: !consulta,
          width: '300px',
          ...this.tabla.getSettingsObject('Nombre'),
          filter: {
            type: 'list',
            config: {
              selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
              list: [
                {
                  value: 'Salida En Trámite',
                  title: this.translate.instant(estadoSelect + 'Tramite'),
                },
                {
                  value: 'Salida Aprobada',
                  title: this.translate.instant(estadoSelect + 'Aprobado'),
                },
                {
                  value: 'Salida Rechazada',
                  title: this.translate.instant(estadoSelect + 'Rechazo'),
                },
                {
                  value: 'Salida Anulada',
                  title: this.translate.instant(estadoSelect + 'Anulado'),
                },
              ],
            },
          },
        },
        Funcionario: {
          title: this.translate.instant('GLOBAL.funcionario'),
          ...this.tabla.getSettingsObject('NombreCompleto'),
          sort: false,
          filter: false,
        },
        Sede: {
          title: this.translate.instant('GLOBAL.sede'),
          ...this.tabla.getSettingsObject('Nombre'),
          sort: false,
          filter: false,
        },
        Dependencia: {
          title: this.translate.instant('GLOBAL.dependencia'),
          ...this.tabla.getSettingsObject('Nombre'),
          sort: false,
          filter: false,
        },
        Ubicacion: {
          title: this.translate.instant('GLOBAL.ubicacion'),
          ...this.tabla.getSettingsObject_('EspacioFisicoId', 'Nombre'),
          sort: false,
          filter: false,
        },
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

  confirmAnular() {
    if (!this.puedeAnularSalida || this.submitted) {
      return;
    }

    this.pUpManager.showAlertWithOptions(this.getOptionsAnulacionConfirm())
      .then((result) => {
        if (result.value) {
          (Swal as any).mixin({
            input: 'text',
            confirmButtonText: this.translate.instant('GLOBAL.movimientos.salidas.anularBtn'),
            showCancelButton: true,
            progressSteps: ['1'],
          }).queue([
            {
              title: this.translate.instant('GLOBAL.movimientos.salidas.anulacionObsTtl'),
              text: this.translate.instant('GLOBAL.movimientos.salidas.anulacionObsTxt'),
            },
          ]).then((result2) => {
            if (result2.value) {
              this.onAnularSalida(result2.value[0]);
            }
          });
        }
      });
  }

  private onAnularSalida(observacion: string) {
    this.submitted = true;
    this.spinner = 'Anulando salida y generando transacción contable';
    this.salidasHelper.anularSalida(+this.salidaId, observacion).subscribe((res: any) => {
      this.spinner = '';
      this.submitted = false;
      if (res && !res.Error) {
        if (res.TransaccionContable) {
          const fecha = new Date(res.TransaccionContable.Fecha).toLocaleString();
          this.trContable = {
            rechazo: '',
            movimientos: res.TransaccionContable.movimientos,
            concepto: res.TransaccionContable.Concepto,
            fecha,
          };
        }
        this.consecutivoSalida = res.Salida && res.Salida.Consecutivo ? res.Salida.Consecutivo : this.movimiento.Consecutivo;
        this.pUpManager.showAlertWithOptions(this.getOptionsAnulacionSuccess(this.consecutivoSalida));
        this.cargarSalida();
        this.detalleRefreshVersion += 1;
      } else if (res && res.Error) {
        this.pUpManager.showErrorAlert(res.Error);
      }
    }, (error: any) => {
      this.spinner = '';
      this.submitted = false;
      this.pUpManager.showErrorAlert(this.parseAnulacionError(error));
    });
  }

  private updateAnularAvailability() {
    this.puedeAnularSalida = this.modo === 'consulta' &&
      !this.editarSalida &&
      this.movimiento &&
      this.movimiento.EstadoMovimientoId &&
      this.movimiento.EstadoMovimientoId.Nombre === 'Salida Aprobada';
  }

  private parseAnulacionError(error: any): string {
    if (error && typeof error.Data === 'string' && error.Data.length) {
      return error.Data;
    }
    if (error && typeof error.Message === 'string' && error.Message.length) {
      return error.Message;
    }
    return this.translate.instant('GLOBAL.movimientos.salidas.errorAnulacionSalida');
  }

  private getOptionsAnulacionConfirm(): any {
    return {
      title: this.translate.instant('GLOBAL.movimientos.salidas.anulacionConfrmTtl'),
      text: this.translate.instant('GLOBAL.movimientos.salidas.anulacionConfrmTxt'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

  private getOptionsAnulacionSuccess(consecutivo: string): any {
    return {
      type: 'success',
      title: this.translate.instant('GLOBAL.movimientos.salidas.anulacionTtlOk'),
      text: this.translate.instant('GLOBAL.movimientos.salidas.anulacionTxtOk', { CONSECUTIVO: consecutivo }),
    };
  }

}
