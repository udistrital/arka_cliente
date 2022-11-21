import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ActivatedRoute, Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada, EstadoMovimiento, Movimiento } from '../../../@core/data/models/entrada/entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { SmartTableService } from '../../../@core/data/SmartTableService';

@Component({
  selector: 'ngx-consulta-entrada',
  templateUrl: './consulta-entrada.component.html',
  styleUrls: ['./consulta-entrada.component.scss'],
})
export class ConsultaEntradaComponent implements OnInit {
  source: LocalDataSource;
  actaRecibidoId: number;
  entradaId: number;
  entradaEspecifica: Entrada;
  settings: any;
  mostrar: boolean = false;
  spinner: string;
  estadosMovimiento: Array<EstadoMovimiento>;
  movimiento: Movimiento;
  modo: string = 'consulta';
  filaSeleccionada: any;
  updateEntrada: boolean = false;
  trContable: any;
  submitted: boolean;

  constructor(
    private pUpManager: PopUpManager,
    private router: Router,
    private entradasHelper: EntradaHelper,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private confService: ConfiguracionService,
    private tabla: SmartTableService) {
    this.source = new LocalDataSource();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.loadEstados();

    this.route.data.subscribe(data => {
      if (data && data.modo) {
        this.modo = data.modo;
      }
    });

    this.route.paramMap.subscribe(params => {
      if (params && +params.get('id')) {
        this.entradaId = +this.route.snapshot.paramMap.get('id');
        this.loadEntradaEspecifica();
      } else {
        this.loadEntradas();
        this.loadTablaSettings();
      }
    });

  }

  loadEntradas(): void {
    this.spinner = 'Cargando Entradas';
    this.entradasHelper.getEntradas(this.modo === 'revision').subscribe(res => {
      if (res.length) {
        res.forEach(entrada => {
          entrada.Detalle = JSON.parse((entrada.Detalle));
          entrada.ActaRecibidoId = entrada.Detalle.acta_recibido_id;
          entrada.Consecutivo = entrada.Detalle.consecutivo;
          entrada.FormatoTipoMovimientoId = entrada.FormatoTipoMovimientoId.Nombre;
          entrada.EstadoMovimientoId = entrada.EstadoMovimientoId.Nombre;
        });
        this.source.load(res);
      }
      this.spinner = '';
      this.mostrar = true;
    });
  }

  loadEntradaEspecifica(): void {
    this.spinner = 'Cargando detalle de la entrada';
    this.entradasHelper.getEntrada(this.entradaId).subscribe(res => {
      if (res.movimiento) {
        this.entradaEspecifica = res;
        this.movimiento = res.movimiento;
        const detalle = JSON.parse(this.movimiento.Detalle);
        this.entradaEspecifica.Consecutivo = detalle.consecutivo;
        this.actaRecibidoId = detalle.acta_recibido_id;
        if (res.TransaccionContable) {
          this.transaccionContable(res.TransaccionContable);
        }
      }
      this.spinner = '';
    });
  }

  confirmSubmit(aprobar: boolean) {
    if (!this.submitted && this.movimiento && this.movimiento.EstadoMovimientoId &&
      this.movimiento.EstadoMovimientoId.Nombre === 'Entrada En Trámite') {
      this.pUpManager.showAlertWithOptions(this.getOptionsRevision(aprobar))
        .then((result) => {
          if (result.value) {
            this.onSubmitRevision(aprobar);
          }
        });
    }
  }

  private transaccionContable(tr) {
    const fecha = new Date(tr.Fecha).toLocaleString();
    this.trContable = {
      rechazo: '',
      movimientos: tr.movimientos,
      concepto: tr.Concepto,
      fecha,
    };
  }

  private onSubmitRevision(aprobar: boolean) {
    this.submitted = true;
    if (aprobar) {
      this.spinner = 'Aprobando entrada y generando transacción contable';
      this.entradasHelper.postEntrada({}, +this.entradaId, true).toPromise().then((res: any) => {
        this.spinner = '';
        if (res && !res.Error) {
          if (res.TransaccionContable) {
            this.transaccionContable(res.TransaccionContable);
          }
          this.alertSuccess(true);
          this.source.remove(this.filaSeleccionada);
        } else if (res && res.Error) {
          this.pUpManager.showErrorAlert(res.Error);
        }
      });
    } else {
      this.spinner = 'Actualizando entrada';
      const estado = this.estadosMovimiento.find(estadoMovimiento => estadoMovimiento.Nombre === 'Entrada Rechazada').Id;
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
    const consecutivo = JSON.parse(this.movimiento.Detalle).consecutivo;
    this.pUpManager.showAlertWithOptions(this.getOptionsSubmit(aprobar, consecutivo));
    this.source.remove(this.filaSeleccionada);
    if (!aprobar) {
      this.onVolver();
      this.mostrar = true;
    }
  }

  loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
      }
    });
  }

  onDelete(event) {
    this.router.navigateByUrl('/pages/entradas/consulta_entrada/' + event.data.Id);
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
          this.router.navigateByUrl('/pages/entradas/aprobar_entrada/' + event.data.Id);
        }
      });
    } else if (event.data.EstadoMovimientoId === 'Entrada Rechazada') {
      const query = 'Nombre__in:cierreEnCurso,Valor:true';
      this.confService.getAllParametro(query).subscribe(res => {
        if (res && res.length) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
        } else {
          this.mostrar = false;
          this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
          this.filaSeleccionada = event.data;
          this.entradaId = event.data.Id;
          this.updateEntrada = true;
        }
      });
    } else {
      this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errorEditar'));
    }
  }

  onVolver($event: boolean = false) {
    if ($event) {
      this.loadEntradas();
    }
    this.mostrar = true;
    this.submitted = false;
    this.updateEntrada = false;
    this.entradaEspecifica = undefined;
    this.filaSeleccionada = undefined;
    this.entradaId = undefined;
    this.trContable = undefined;
    this.router.navigateByUrl('/pages/entradas/' +
      (this.modo === 'consulta' ? 'consulta' : this.modo === 'revision' ? 'aprobar' : '') + '_entrada');
  }

  onRegister() {
    const query = 'Nombre__in:cierreEnCurso,Valor:true';
    this.confService.getAllParametro(query).subscribe(res => {
      if (res && res.length) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
      } else {
        this.updateEntrada = true;
        this.mostrar = false;
      }
    });
  }

  loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.registrar_nueva_entrada'),
      accion: this.translate.instant('GLOBAL.' +
        (this.modo === 'consulta' ? 'verDetalle' : 'movimientos.entradas.accionRevision')),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
      edit: this.translate.instant('GLOBAL.movimientos.entradas.editar'),
    };

    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.estado_entrada'),
        width: '300px',
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              { value: 'Entrada En Trámite', title: 'En Trámite' },
              { value: 'Entrada Rechazada', title: 'Rechazada' },
              { value: 'Entrada Aprobada', title: 'Aprobada' },
              { value: 'Entrada Con Salida', title: 'Con Salida' },
            ],
          },
        },
      },
    } : [];

    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.movimientos.entradas.' +
        (this.modo === 'consulta' ? 'noEntradasView' : 'noEntradasReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: this.modo === 'consulta',
        edit: true,
        add: !!this.confService.getRoute('/pages/entradas/registro'),
      },
      add: {
        addButtonContent: '<i class="fas" title="' + t.registrar + '" aria-label="' + t.registrar + '">'
          + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      delete: {
        deleteButtonContent: '<i class="far fa-eye" title="' + 'Editar entrada' + '" aria-label="' + 'Editar entrada' + '"></i>',
      },
      edit: {
        editButtonContent: '<i class="far fa-edit" title="' + t.edit + '" aria-label="' + t.edit + '"></i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '150px',
        },
        ActaRecibidoId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.una'),
          width: '140px',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
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
        FormatoTipoMovimientoId: {
          title: this.translate.instant('GLOBAL.tipo_entrada'),
          width: '300px',
          filter: {
            type: 'list',
            config: {
              selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
              list: [
                { value: 'Adiciones y Mejoras', title: 'Adiciones y Mejoras' },
                { value: 'Adquisición', title: 'Adquisición' },
                { value: 'Caja Menor', title: 'Caja Menor' },
                { value: 'Compra en el Extranjero', title: 'Compra en el Extranjero' },
                { value: 'Donación', title: 'Donación' },
                { value: 'Elaboración Propia', title: 'Elaboración Propia' },
                { value: 'Intangibles adquiridos', title: 'Intangibles adquiridos' },
                { value: 'Intangibles desarrollados', title: 'Intangibles desarrollados' },
                { value: 'Partes por Aprovechamientos', title: 'Partes por Aprovechamientos' },
                { value: 'Provisional', title: 'Provisional' },
                { value: 'Reposición', title: 'Reposición' },
                { value: 'Sobrante', title: 'Sobrante' },
                { value: 'Terceros', title: 'Terceros' },
              ],
            },
          },
        },
        ...columns,
      },
    };
  }

  private getOptionsRevision(aprobar: boolean) {
    const base = 'GLOBAL.movimientos.entradas.';
    return {
      title: this.translate.instant(base + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTtl'),
      text: this.translate.instant(base + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTxt'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

  private getOptionsSubmit(aprobar: boolean, consecutivo: string) {
    const base = 'GLOBAL.movimientos.entradas.';
    return {
      type: 'success',
      title: this.translate.instant(base + (aprobar ? 'aprobacion' : 'rechazo') + 'TtlOk'),
      text: this.translate.instant(base + (aprobar ? 'aprobacion' : 'rechazo') + 'TxtOk', { CONSECUTIVO: consecutivo }),
    };
  }

}
