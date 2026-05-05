import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { ArchivoReporte, ReportesHelper, TipoReporte } from '../../../helpers/reportes/reportesHelper';

const TIPOS_REPORTE: TipoReporte[] = ['entradas', 'salidas', 'consolidado_inventario'];

@Component({
  selector: 'ngx-consulta-reportes',
  templateUrl: './consulta-reportes.component.html',
  styleUrls: ['./consulta-reportes.component.scss'],
})
export class ConsultaReportesComponent implements OnInit {

  formReportes: FormGroup;
  loading: boolean = false;
  statusMessage: string = '';
  statusType: string = 'info';
  tiposReporte = TIPOS_REPORTE;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private reportesHelper: ReportesHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
  }

  ngOnInit() {
    this.buildForm();
    this.formReportes.valueChanges.subscribe(() => {
      this.statusMessage = '';
    });
  }

  public generarReporte(): void {
    if (this.formReportes.invalid) {
      this.formReportes.markAllAsTouched();
      return;
    }

    const payload = {
      tipo_reporte: this.controlTipoReporte.value,
      fecha_inicio: this.toApiDate(this.controlFechaInicio.value),
      fecha_fin: this.toApiDate(this.controlFechaFin.value),
    };

    this.loading = true;
    this.setStatus('info', this.translate.instant('GLOBAL.reportes.consulta.loading'));

    this.reportesHelper.generarReporte(payload).subscribe({
      next: (response: ArchivoReporte) => {
        this.loading = false;

        if (!response) {
          this.setStatus('danger', this.translate.instant('GLOBAL.reportes.error_generacion'));
          return;
        }

        if (response.file === undefined || response.file === null) {
          this.setStatus('danger', this.translate.instant('GLOBAL.reportes.consulta.error_sin_archivo'));
          return;
        }

        if (!response.file.trim().length) {
          this.setStatus('danger', this.translate.instant('GLOBAL.reportes.consulta.error_base64_vacio'));
          return;
        }

        try {
          this.reportesHelper.downloadBase64Excel(
            response.file,
            this.getFileName(response.fileName, payload.tipo_reporte),
            response.mimeType,
          );
          this.setStatus('success', this.translate.instant('GLOBAL.reportes.consulta.success'));
          this.pUpManager.showSuccessAlert(this.translate.instant('GLOBAL.reportes.consulta.success'));
        } catch (error) {
          this.setStatus('danger', this.translate.instant('GLOBAL.reportes.consulta.error_descarga'));
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.reportes.consulta.error_descarga'));
        }
      },
      error: () => {
        this.loading = false;
        this.setStatus('danger', this.translate.instant('GLOBAL.reportes.consulta.error_http'));
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.reportes.consulta.error_http'));
      },
    });
  }

  public get controlTipoReporte(): AbstractControl {
    return this.formReportes.get('tipo_reporte');
  }

  public get controlFechaInicio(): AbstractControl {
    return this.formReportes.get('fecha_inicio');
  }

  public get controlFechaFin(): AbstractControl {
    return this.formReportes.get('fecha_fin');
  }

  private buildForm(): void {
    this.formReportes = this.fb.group({
      tipo_reporte: ['', [Validators.required, this.validarTipoReporte()]],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
    }, {
      validators: [this.validarRangoFechas()],
    });
  }

  private validarTipoReporte(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      return this.tiposReporte.includes(value) ? null : { invalidReportType: true };
    };
  }

  private validarRangoFechas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fechaInicio = control.get('fecha_inicio') && control.get('fecha_inicio').value;
      const fechaFin = control.get('fecha_fin') && control.get('fecha_fin').value;

      if (!fechaInicio || !fechaFin) {
        return null;
      }

      return this.toApiDate(fechaInicio) > this.toApiDate(fechaFin) ? { invalidDateRange: true } : null;
    };
  }

  private toApiDate(date: Date): string {
    const value = new Date(date);
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${value.getFullYear()}-${month}-${day}`;
  }

  private getFileName(fileName: string, tipoReporte: TipoReporte): string {
    const fallback = `reporte_${tipoReporte}.xlsx`;
    const value = fileName && fileName.trim().length ? fileName.trim() : fallback;
    return value.toLowerCase().endsWith('.xlsx') ? value : `${value}.xlsx`;
  }

  private setStatus(type: string, message: string): void {
    this.statusType = type;
    this.statusMessage = message;
  }
}
