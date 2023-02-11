import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { EstadoMovimiento, FormatoTipoMovimiento, Movimiento } from '../../../@core/data/models/entrada/entrada';
import { DetalleTraslado } from '../../../@core/data/models/movimientos_arka/movimientos_arka';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { TrasladosHelper } from '../../../helpers/movimientos/trasladosHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';

@Component({
  selector: 'ngx-crud-traslado',
  templateUrl: './crud-traslado.component.html',
  styleUrls: ['./crud-traslado.component.scss'],
})
export class CrudTrasladoComponent implements OnInit {

  trasladoData: any;
  valid: boolean;
  formatoTraslado: FormatoTipoMovimiento;
  estadosMovimiento: Array<EstadoMovimiento>;
  showForm: boolean;
  modoForm: string; // 'create' || 'get' || 'put'
  title: string;
  subtitle: string;
  boton: string;
  botonR: string;
  consecutivo: string = '';
  loading: boolean;
  submitted: boolean;
  rechazo: string = '';
  trContable: any;
  movimiento: Movimiento;
  @Input() modoCrud: string = 'registrar' || 'ver' || 'editar' || 'confirmar' || 'revisar';
  @Input() trasladoId: number = 0;
  @Output() accion: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private movimientosHelper: MovimientosHelper,
    private trasladosHelper: TrasladosHelper,
    private entradasHelper: EntradaHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  ngOnInit() {
    this.getFormatoTraslado();
    this.loadEstados();
    if (this.modoCrud === 'registrar') {
      this.modoForm = 'create';
      this.showForm = true;
    } else if (this.modoCrud !== 'editar' && this.trasladoId) {
      this.getTraslado(this.trasladoId);
      this.modoForm = 'get';
    } else if (this.trasladoId) {
      this.boton = 'Actualizar Solicitud de Traslado';
      this.getTraslado(this.trasladoId);
      this.modoForm = 'put';
    }
    this.title = this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.title');
    this.subtitle = this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.subtitle');
    this.boton = this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.accion');
    this.botonR = this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.accionR');
  }

  getTraslado(trasladoId: number) {
    this.trasladosHelper.getTraslado(trasladoId).subscribe(res => {
      if (res) {
        this.trasladoData = {};
        this.movimiento = res.Movimiento;
        const detalle = res.Movimiento && res.Movimiento.Detalle ? JSON.parse(res.Movimiento.Detalle) : '';
        const rechazo = detalle ? detalle.RazonRechazo : '';
        this.consecutivo = res.Movimiento.Consecutivo;
        if (res.TrContable) {
          this.trasladoData.trContable = res.TrContable;
          this.trasladoData.trContable.consecutivo = this.consecutivo;
        }
        this.trasladoData.origen = res.FuncionarioOrigen;
        this.trasladoData.destino = res.FuncionarioDestino;
        this.trasladoData.ubicacion = res.Ubicacion;
        this.trasladoData.elementos = res.Elementos;
        this.trasladoData.observaciones = res.Observaciones;
        this.trasladoData.rechazo = rechazo;
        this.showForm = true;
      }
    });
  }

  public rechazar() {
    this.pUpManager.showAlertWithOptions(this.optionsRechazo)
      .then((result) => {
        if (result.value) {
          (Swal as any).mixin({
            input: 'text',
            confirmButtonText: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Rechazar'),
            showCancelButton: true,
            progressSteps: ['1'],
            inputValidator: (value) => {
              return new Promise<string>((resolve) => {
                if (!value.length) {
                  resolve(this.translate.instant('GLOBAL.traslados.revisar.confrmRechazoTtx'));
                } else {
                  resolve('');
                }
              });
            },
          }).queue([
            {
              title: this.translate.instant('GLOBAL.traslados.revisar.confrmRechazoTtl'),
              text: this.translate.instant('GLOBAL.traslados.revisar.confrmRechazoTtx'),
            },
          ]).then((result2) => {
            if (result2.value) {
              this.rechazo = result2.value[0];
              this.buildMovimiento(true);
            }
          });

        }
      });
  }

  private getFormatoTraslado() {
    this.movimientosHelper.getFormatoByNombre('Traslado').subscribe(res => {
      if (res.length) {
        this.formatoTraslado = res[0];
      }
    });
  }

  public setValidness(event) {
    this.valid = event;
  }

  public confirm(rechazar: boolean = false) {
    this.pUpManager.showAlertWithOptions(this.optionsConfirm(rechazar))
      .then((result) => {
        if (result.value) {
          this.buildMovimiento(rechazar);
        }
      });
  }

  private buildMovimiento(rechazar: boolean) {

    if (!this.submitted) {
      this.loading = true;
      this.submitted = true;
      const Consecutivo = this.movimiento ? this.movimiento.Consecutivo : '';
      const ConsecutivoId = this.movimiento ? this.movimiento.ConsecutivoId : 0;
      const val = this.trasladoData;
      const Elementos = val.controls.elementos.value.map(element => element.id);
      const FuncionarioOrigen = val.controls.origen.value.tercero.Tercero.Id;
      const FuncionarioDestino = val.controls.destino.value.tercero.Tercero.Id;
      const Ubicacion = val.controls.ubicacion.value.ubicacion;
      const Observacion = val.controls.observaciones.value.observaciones;
      const estadoId =
        (this.modoCrud === 'registrar' || (this.modoCrud === 'editar' && !rechazar)) ? 'Traslado Por Confirmar' :
          (this.modoCrud === 'editar' && rechazar) ? 'Traslado Anulado' :
            (rechazar) ? 'Traslado Rechazado' :
              (this.modoCrud === 'confirmar') ? 'Traslado Confirmado' :
                (this.modoCrud === 'revisar') ? 'Traslado Aprobado' : '';
      const RazonRechazo = (this.rechazo) ? this.rechazo :
        estadoId === 'Traslado Por Confirmar' ? val.controls.rechazo.value.razon : '';

      const detalle = <DetalleTraslado>{
        FuncionarioOrigen,
        FuncionarioDestino,
        Ubicacion,
        Elementos,
        RazonRechazo,
      };

      const movimiento = <Movimiento>{
        Id: this.trasladoId,
        Consecutivo,
        ConsecutivoId,
        Detalle: JSON.stringify(detalle),
        Observacion,
        Activo: true,
        FormatoTipoMovimientoId: {
          Id: this.formatoTraslado.Id,
        },
        EstadoMovimientoId: {
          Id: this.estadosMovimiento.find(st => st.Nombre === estadoId).Id,
        },
      };
      if (this.modoCrud === 'registrar') {
        this.postTraslado(movimiento);
      } else if (this.modoCrud !== 'revisar' || rechazar) {
        this.updateTraslado(movimiento, rechazar);
      } else {
        this.aprobarTraslado(movimiento);
      }
    }

  }

  private updateTraslado(movimiento, rechazar: boolean) {
    this.entradasHelper.putMovimiento(movimiento).toPromise().then((res: any) => {
      this.alertSuccess(rechazar, res.Consecutivo);
    });
  }

  private postTraslado(movimiento) {
    this.trasladosHelper.postTraslado(movimiento).subscribe((res: any) => {
      this.alertSuccess(false, res.Consecutivo);
    });
  }

  private aprobarTraslado(movimiento) {
    this.trasladosHelper.aprobarTraslado(movimiento).subscribe((res: any) => {
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
        this.alertSuccess(false, res.Movimiento.Consecutivo);
      } else if (res && res.Error) {
        this.loading = false;
        this.pUpManager.showErrorAlert(res.Error);
      }
    });
  }

  private alertSuccess(rechazar: boolean, consecutivo: string) {
    const sfx = (this.modoCrud !== 'editar' && this.modoCrud !== 'confirmar' && this.modoCrud !== 'revisar') ? '' : rechazar ? 'R' : 'A';
    const title = this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.successTtl' + sfx);
    const text = this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.successTxt' + sfx, { CONSECUTIVO: consecutivo });
    const options = {
      type: 'success',
      title,
      text,
      showConfirmButton: true,
    };
    this.accion.emit(true);
    this.loading = false;
    this.pUpManager.showAlertWithOptions(options);
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
      }
    });
  }

  private optionsConfirm(rechazar: boolean) {
    const sfx = (this.modoCrud !== 'editar' && this.modoCrud !== 'confirmar' && this.modoCrud !== 'revisar') ? '' : rechazar ? 'R' : 'A';
    const title = this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.confrmTtl' + sfx);
    const text = this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.confrmTxt' + sfx);
    return {
      title,
      text,
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
      title: this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.confrmTtlR'),
      text: this.translate.instant('GLOBAL.traslados.' + this.modoCrud + '.confrmTxtR'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

}
