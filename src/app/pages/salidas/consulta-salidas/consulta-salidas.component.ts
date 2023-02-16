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
  trContable: any;
  submitted: boolean;
  title: string;
  subtitle: string;

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
        this.title = 'GLOBAL.movimientos.salidas.' + data.modo + 'Ttl';
        this.subtitle = 'GLOBAL.movimientos.salidas.' + data.modo + 'Stl';
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
      const estado = this.estadosMovimiento.find(st => st.Nombre === 'Salida Rechazada').Id;
      if (event.data.EstadoMovimientoId === estado) {
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

  onVolver() {
    this.editarSalida = false;
    this.salidaId = '';
    this.entradaParametro = '';
    this.filaSeleccionada = undefined;
    this.trContable = undefined;
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
    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.estadoSalida'),
        valuePrepareFunction: (value: any) => {
          return this.estadosMovimiento.find(estado => estado.Id === value).Nombre;
        },
        width: '300px',
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Salida En Trámite').Id,
                title: this.translate.instant(estadoSelect + 'Tramite'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Salida Aprobada').Id,
                title: this.translate.instant(estadoSelect + 'Aprobado'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Salida Rechazada').Id,
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
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        Observacion: {
          title: this.translate.instant('GLOBAL.observaciones'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        FechaModificacion: {
          title: this.translate.instant('GLOBAL.ultimaModificacion'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        MovimientoPadreId: {
          title: this.translate.instant('GLOBAL.entradaAsociada'),
          ...this.tabla.getSettingsObject('Consecutivo'),
        },
        Funcionario: {
          title: this.translate.instant('GLOBAL.funcionario'),
          ...this.tabla.getSettingsObject('NombreCompleto'),
        },
        Sede: {
          title: this.translate.instant('GLOBAL.sede'),
          ...this.tabla.getSettingsObject('Nombre'),

        },
        Dependencia: {
          title: this.translate.instant('GLOBAL.dependencia'),
          ...this.tabla.getSettingsObject('Nombre'),
        },
        Ubicacion: {
          title: this.translate.instant('GLOBAL.ubicacion'),
          ...this.tabla.getSettingsObject_('EspacioFisicoId', 'Nombre'),
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
