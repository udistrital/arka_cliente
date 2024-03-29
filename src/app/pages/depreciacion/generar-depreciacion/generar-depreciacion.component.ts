import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { DepreciacionHelper } from '../../../helpers/movimientos/depreciacionHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-generar-depreciacion',
  templateUrl: './generar-depreciacion.component.html',
  styleUrls: ['./generar-depreciacion.component.scss'],
})
export class GenerarDepreciacionComponent implements OnInit {

  formDepreciacion: FormGroup;
  trContable: any;
  maxDate: Date;
  title: string;
  subtitle: string;
  loading: boolean;
  showForm: boolean;
  action: string;
  rechazo: string = '';
  submitted: boolean;
  consecutivo: string = '';
  @Output() accion: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() modoCrud: string; // create | get | review | update
  @Input() depreciacionId: number = 0;
  @Input() refDate: Date;
  tipo: string = 'cierres';

  constructor(
    private pUpManager: PopUpManager,
    private translate: TranslateService,
    private fb: FormBuilder,
    private depreciacionHelper: DepreciacionHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.maxDate = new Date();
  }

  ngOnInit() {
    if (this.modoCrud === 'create' || this.modoCrud === 'update') {
      this.refDate.setUTCMinutes(this.refDate.getTimezoneOffset());
      this.refDate.setDate(this.refDate.getDate() + 1);
    }
    this.buildForm();
    this.title = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.title');
    this.subtitle = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.subtitle');
    this.action = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.accion');
    if (this.modoCrud === 'create') {
      this.showForm = true;
    } else {
      this.getDepreciacion(this.depreciacionId);
    }
  }

  private getDepreciacion(depreciacionId: number) {
    this.depreciacionHelper.getDepreciacion(depreciacionId).subscribe(res => {
      if (res) {
        this.consecutivo = res.Movimiento.Consecutivo;
        this.fillForm(res.Movimiento);
        const fecha = new Date(res.TransaccionContable.Fecha).toLocaleString();
        this.trContable = {
          rechazo: '',
          movimientos: res.TransaccionContable.movimientos,
          concepto: res.TransaccionContable.Concepto,
          fecha,
        };
      }
    });
  }

  private fillForm(data: any) {
    const detalle = JSON.parse(data.Detalle);
    const observaciones = data.Observacion;
    const fecha = new Date(data.FechaCorte);
    fecha.setUTCMinutes(fecha.getTimezoneOffset());
    const razon = detalle.RazonRechazo;

    this.formDepreciacion.patchValue({ fecha });
    this.formDepreciacion.patchValue({ observaciones });
    this.formDepreciacion.patchValue({ razon });
    if (this.modoCrud === 'get' || this.modoCrud === 'review') {
      this.formDepreciacion.disable();
    }

    this.showForm = true;
  }

  private buildForm(): void {
    this.formDepreciacion = this.fb.group({
      fecha: ['', Validators.required],
      razon: [
        {
          value: '',
          disabled: true,
        },
      ],
      observaciones: [''],
    });
  }

  public rechazar() {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.confrmTtlR'),
      text: this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.confrmTxtR'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    }).then((result) => {
      if (result.value) {
        (Swal as any).mixin({
          input: 'text',
          confirmButtonText: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Rechazar'),
          showCancelButton: true,
          progressSteps: ['1'],
          inputValidator: (value) => {
            return new Promise<string>((resolve) => {
              if (!value.length) {
                resolve(this.translate.instant('GLOBAL.' + this.tipo + '.review.confrmRechazoTtx'));
              } else {
                resolve('');
              }
            });
          },
        }).queue([
          {
            title: this.translate.instant('GLOBAL.' + this.tipo + '.review.confrmRechazoTtl'),
            text: this.translate.instant('GLOBAL.' + this.tipo + '.review.confrmRechazoTtx'),
          },
        ]).then((result2) => {
          if (result2.value && result2.value.length && result2.value[0].length) {
            const rechazo = result2.value[0];
            this.formDepreciacion.get('razon').setValue(rechazo);
            this.submitForm(true);
          }
        });

      }
    });
  }

  public confirm(rechazar: boolean = false) {
    const sfx = this.modoCrud !== 'review' ? '' : rechazar ? 'R' : 'A';
    const title = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.confrmTtl' + sfx);
    const text = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.confrmTxt' + sfx);
    (Swal as any).fire({
      title,
      text,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    }).then((result) => {
      if (result.value) {
        this.submitForm(false);
      }
    });
  }

  public submitForm(Rechazar: boolean) {
    this.trContable = undefined;
    this.loading = true;
    const date = new Date(this.formDepreciacion.controls.fecha.value);
    const obs = this.formDepreciacion.controls.observaciones.value;
    const FechaCorte = new Date(date.setUTCHours(0)).toISOString();

    const data = {
      Id: this.depreciacionId,
      FechaCorte,
      Observaciones: obs,
      RazonRechazo: this.formDepreciacion.controls.razon.value,
      Rechazar,
    };

    if (this.modoCrud === 'create' || this.modoCrud === 'update' || Rechazar) {
      this.depreciacionHelper.postSolicitud(data).subscribe((res: any) => {
        this.loading = false;
        if (res.Error !== '') {
          this.pUpManager.showErrorAlert(res.Error);
        } else if (Rechazar && res.Movimiento.Id) {
          this.loading = false;
          this.submitted = true;
          this.accion.emit(true);
          this.alertSuccess(this.trContable, true);
        } else if (res.TransaccionContable && !res.TransaccionContable.movimientos) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.' + this.tipo + '.errorVacio'));
        } else {
          this.trContable = {
            rechazo: '',
            movimientos: res.TransaccionContable.movimientos,
            concepto: res.TransaccionContable.Concepto,
          };
          this.formDepreciacion.disable();
          this.submitted = true;
          this.accion.emit(true);
          this.consecutivo = res.Movimiento.Consecutivo;
          this.alertSuccess(res.TransaccionContable, false);
        }
      });
    } else if (this.modoCrud === 'review') {
      this.depreciacionHelper.putAprobacion(this.depreciacionId).subscribe((res: any) => {
        this.loading = false;
        if (!res.Error && res.TransaccionContable && !res.TransaccionContable.movimientos) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.' + this.tipo + '.errorVacio'));
        } else if (res.Error !== '') {
          this.submitted = true;
          this.showForm = false;
          this.pUpManager.showErrorAlert(res.Error);
        } else {
          this.trContable = {
            rechazo: '',
            movimientos: res.TransaccionContable.movimientos,
            concepto: res.TransaccionContable.Concepto,
          };
          this.formDepreciacion.disable();
          this.submitted = true;
          this.accion.emit(true);
          this.consecutivo = res.Movimiento.Consecutivo;


          this.submitted = true;
          this.accion.emit(true);
          this.alertSuccess(res.TransaccionContable, false);
        }
      });
    }
  }

  private alertSuccess(trContable, rechazar) {
    const sfx = this.modoCrud !== 'review' ? '' : rechazar ? 'R' : 'A';
    const title = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.successTtl' + sfx);
    const text = this.translate.instant('GLOBAL.' + this.tipo + '.' + this.modoCrud + '.successTxt' + sfx);
    const options = {
      type: 'success',
      title,
      text,
      showConfirmButton: true,
    };
    this.pUpManager.showAlertWithOptions(options);
    if (this.modoCrud !== 'get') {
      this.trContable = trContable;
    }
  }

}
