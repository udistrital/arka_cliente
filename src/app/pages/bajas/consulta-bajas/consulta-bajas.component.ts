import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { EstadoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { BajasHelper } from '../../../helpers/bajas/bajasHelper';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import Swal from 'sweetalert2';
import { SmartTableService } from '../../../@core/data/SmartTableService';

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
  seleccionados: Array<any>;
  title: string;
  subtitle: string;
  resolucion: boolean;

  constructor(
    private confService: ConfiguracionService,
    private entradasHelper: EntradaHelper,
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private bajasHelper: BajasHelper,
    private route: ActivatedRoute,
    private tabla: SmartTableService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data && data.modo !== null && data.modo !== undefined) {
        this.modo = data.modo;
        if (this.modo === 'aprobacion') {
          const query = 'Nombre__in:modificandoCuentas|cierreEnCurso,Valor:true';
          this.confService.getAllParametro(query).subscribe(res => {
            if (res && res.length) {
              if (res[0].Nombre === 'cierreEnCurso') {
                this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
              } else {
                this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.alerta_modificacion'));
              }
            } else {
              this.loadEstados();
            }
          });
        } else {
          this.loadEstados();
        }
      }
    });
    this.source = new LocalDataSource();
    this.title = this.translate.instant('GLOBAL.bajas.' + this.modo + '.title');
    this.subtitle = this.translate.instant('GLOBAL.bajas.' + this.modo + '.subtitle');
  }

  public async onRegister() {
    const cierre = await this.confService.checkCierreEnCurso();
    if (!cierre) {
      this.modoCrud = 'registrar';
      this.bajaId = 0;
    } else {
      this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
    }
  }

  public async onEdit(event) {
    this.filaSeleccionada = event.data;
    if (this.modo === 'consulta') {
      if (event.data.EstadoMovimientoId === 'Baja Rechazada') {
        const cierre = await this.confService.checkCierreEnCurso();
        if (!cierre) {
          this.modoCrud = 'editar';
          this.bajaId = event.data.Id;
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
        }
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.consulta.errorEditar'));
      }
    } else if (this.modo === 'revision') {
      const cierre = await this.confService.checkCierreEnCurso();
      if (!cierre) {
        this.modoCrud = 'revisar';
        this.bajaId = event.data.Id;
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
      }
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
    this.bajasHelper.getAll(this.modo === 'aprobacion', this.modo === 'revision').subscribe((res: any) => {
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
      if (res.length) {
        this.estadosMovimiento = res;
        this.loadTablaSettings();
        this.loadBajas();
      }
    });
  }

  public onUserRowSelect(event) {
    this.seleccionados = event.selected;
  }

  public submitComite(aprobar: boolean, info: any) {
    const RazonRechazo = !aprobar ? info.RazonRechazo : '';
    const FechaRevisionC = aprobar ? new Date(Date.parse(info.fecha)).toLocaleDateString('es-CO') : '';
    const Resolucion = aprobar ? info.numero : '';
    const DependenciaId = aprobar ? info.dependencia.Id : 0;
    const ids = this.seleccionados.map(el => el.Id);
    const data = {
      Bajas: ids,
      Aprobacion: aprobar,
      RazonRechazo,
      FechaRevisionC,
      Resolucion,
      DependenciaId,
    };

    this.bajasHelper.postRevisionComite(data).subscribe((res: any) => {
      if (res.Error) {
        this.pUpManager.showErrorAlert(res.Error);
      } else {
        this.alertSuccess(aprobar);
      }
    });
  }

  private alertSuccess(aprobar: boolean) {
    this.pUpManager.showAlertWithOptions(this.optionsSuccess(aprobar));
    this.seleccionados.forEach(baja => {
      this.source.remove(baja);
    });
    this.seleccionados = [];
  }

  public rechazar() {
    this.pUpManager.showAlertWithOptions(this.optionsRechazo)
      .then((result) => {
        if (result.value) {
          (Swal as any).mixin(this.optionsIngresarRazon)
            .queue(this.optionsConfirmRazon)
            .then((result_) => {
              if (result_.value) {
                const info = {
                  RazonRechazo: result_.value[0],
                };
                this.submitComite(false, info);
              }
            });
        }
      });
  }

  public confirm() {
    this.pUpManager.showAlertWithOptions(this.optionsConfirm)
      .then((result) => {
        if (result.value) {
          this.resolucion = true;
        }
      });
  }

  submitAprobacion(event) {
    this.resolucion = false;
    if (event.fecha && event.numero) {
      this.submitComite(true, event);
    }
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
        width: '200px',
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
      selectMode: this.modo === 'aprobacion' ? 'multi' : false,
      noDataMessage: this.translate.instant('GLOBAL.bajas.consulta.' +
        (this.modo === 'consulta' ? 'noBajasView' : 'noBajasReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: this.modo !== 'revision',
        edit: this.modo !== 'aprobacion',
        add: !!this.confService.getAccion('registrarBaja'),
      },
      add: {
        addButtonContent: '<em class="fas" title="' + t.registrar + '" aria-label="' + t.registrar + '">'
          + this.translate.instant('GLOBAL.crear_nuevo') + '</em>',
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
          width: '100px',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        FechaRevisionA: {
          title: this.translate.instant('GLOBAL.bajas.consulta.fechaRevA'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value ? this.tabla.formatDate(value) : this.translate.instant('GLOBAL.bajas.consulta.espera');
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
        FechaRevisionC: {
          title: this.translate.instant('GLOBAL.bajas.consulta.fechaRevC'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value ? this.tabla.formatDate(value) : this.translate.instant('GLOBAL.bajas.consulta.espera');
            return date === 'Invalid Date' ? value : date;
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
          valuePrepareFunction: this.tabla.prepareFunctionString,
        },
        Revisor: {
          title: this.translate.instant('GLOBAL.bajas.consulta.revisor'),
          valuePrepareFunction: this.tabla.prepareFunctionString,
        },
        TipoBaja: {
          title: this.translate.instant('GLOBAL.bajas.consulta.tipoBaja'),
          width: '100px',
        },
        ...columns,
      },
    };
  }

  private optionsSuccess(aprobar: boolean) {
    const sfx = aprobar ? 'A' : 'R';
    const title = this.translate.instant('GLOBAL.bajas.aprobar.successTtl' + sfx);
    const text = this.translate.instant('GLOBAL.bajas.aprobar.successTxt' + sfx);
    return {
      type: 'success',
      title,
      text,
      showConfirmButton: true,
    };
  }

  get optionsConfirm() {
    return {
      title: this.translate.instant('GLOBAL.bajas.aprobar.confrmTtlA'),
      text: this.translate.instant('GLOBAL.bajas.aprobar.confrmTxtA'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

  get optionsRechazo() {
    return {
      title: this.translate.instant('GLOBAL.bajas.aprobar.confrmTtlR'),
      text: this.translate.instant('GLOBAL.bajas.aprobar.confrmTxtR'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

  get optionsIngresarRazon() {
    return {
      input: 'text',
      confirmButtonText: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Rechazar'),
      showCancelButton: true,
      progressSteps: ['1'],
    };
  }

  get optionsConfirmRazon() {
    return [
      {
        title: this.translate.instant('GLOBAL.bajas.revisar.confrmRechazoTtl'),
        text: this.translate.instant('GLOBAL.bajas.revisar.confrmRechazoTtx'),
      },
    ];
  }

}
