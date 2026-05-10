import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { ArchivoReporte, ReportesHelper } from '../../../helpers/reportes/reportesHelper';

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

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private reportesHelper: ReportesHelper,
  ) { }

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
      fecha_inicial: this.toApiDate(this.controlFechaInicio.value),
      fecha_final: this.toApiDate(this.controlFechaFin.value),
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
            this.getFileName(response.fileName),
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

  public get controlFechaInicio(): AbstractControl {
    return this.formReportes.get('fecha_inicio');
  }

  public get controlFechaFin(): AbstractControl {
    return this.formReportes.get('fecha_fin');
  }

  private buildForm(): void {
    this.formReportes = this.fb.group({
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
    }, {
      validators: [this.validarRangoFechas()],
    });
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

  private getFileName(fileName: string): string {
    const fallback = 'reporte_elementos.xlsx';
    const value = fileName && fileName.trim().length ? fileName.trim() : fallback;
    return value.toLowerCase().endsWith('.xlsx') ? value : `${value}.xlsx`;
  }

  private setStatus(type: string, message: string): void {
    this.statusType = type;
    this.statusMessage = message;
  }
}
