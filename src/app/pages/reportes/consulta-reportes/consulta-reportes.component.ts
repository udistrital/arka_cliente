import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { UserService } from '../../../@core/data/users.service';
import { PopUpManager } from '../../../managers/popUpManager';
import {
  ArchivoReporte,
  PazYSalvoResponse,
  ReportesHelper,
} from '../../../helpers/reportes/reportesHelper';

@Component({
  selector: 'ngx-consulta-reportes',
  templateUrl: './consulta-reportes.component.html',
  styleUrls: ['./consulta-reportes.component.scss'],
})
export class ConsultaReportesComponent implements OnInit {

  private funcionarios: TerceroCriterioContratista[] = [];
  formReportes: FormGroup;
  formPazYSalvo: FormGroup;
  loading: boolean = false;
  loadingPazYSalvo: boolean = false;
  statusMessage: string = '';
  statusType: string = 'info';
  statusMessagePazYSalvo: string = '';
  statusTypePazYSalvo: string = 'info';
  pazYSalvoGenerado: PazYSalvoResponse = undefined;
  funcionariosFiltrados: Observable<Partial<TerceroCriterioContratista>[]>;
  viewMode: 'consultar' | 'pazysalvo' = 'consultar';

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private reportesHelper: ReportesHelper,
    private listService: ListService,
    private store: Store<IAppState>,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.determineViewMode();
    this.buildForm();
    this.buildPazYSalvoForm();
    this.listService.findFuncionarios();
    this.loadFuncionarios();
    this.formReportes.valueChanges.subscribe(() => {
      this.statusMessage = '';
    });
    this.formPazYSalvo.valueChanges.subscribe(() => {
      this.statusMessagePazYSalvo = '';
    });
  }

  private determineViewMode(): void {
    const updateMode = (url: string) => {
      this.viewMode = url.includes('/pazysalvo') ? 'pazysalvo' : 'consultar';
    };

    updateMode(this.router.url || '');
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe((event: NavigationEnd) => {
      updateMode(event.urlAfterRedirects || event.url || '');
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

  public get controlFuncionario(): AbstractControl {
    return this.formPazYSalvo.get('funcionario');
  }

  public generarPazYSalvo(): void {
    if (this.formPazYSalvo.invalid) {
      this.formPazYSalvo.markAllAsTouched();
      return;
    }

    const payload = {
      usuario: this.getUsuarioSesion(),
      elaboro_tercero_id: this.userService.getPersonaId(),
      numero_documento: this.getNumeroDocumentoSeleccionado(),
    };

    this.loadingPazYSalvo = true;
    this.pazYSalvoGenerado = undefined;
    this.setStatusPazYSalvo('info', this.translate.instant('GLOBAL.reportes.paz_y_salvo.loading'));

    this.reportesHelper.generarPazYSalvo(payload).subscribe({
      next: (response: PazYSalvoResponse) => {
        this.loadingPazYSalvo = false;

        if (!response) {
          this.setStatusPazYSalvo('danger', this.translate.instant('GLOBAL.reportes.error_generacion'));
          return;
        }

        if (response.file === undefined || response.file === null) {
          this.setStatusPazYSalvo('danger', this.translate.instant('GLOBAL.reportes.consulta.error_sin_archivo'));
          return;
        }

        if (!response.file.trim().length) {
          this.setStatusPazYSalvo('danger', this.translate.instant('GLOBAL.reportes.consulta.error_base64_vacio'));
          return;
        }

        this.pazYSalvoGenerado = response;

        try {
          this.reportesHelper.downloadBase64Pdf(
            response.file,
            this.getPdfFileName(response.fileName),
            response.mimeType,
          );

          if (response.puede_generar_paz_y_salvo) {
            this.setStatusPazYSalvo('success', response.mensaje || this.translate.instant('GLOBAL.reportes.paz_y_salvo.success'));
            this.pUpManager.showSuccessAlert(response.mensaje || this.translate.instant('GLOBAL.reportes.paz_y_salvo.success'));
          } else {
            this.setStatusPazYSalvo('warning', response.mensaje || this.translate.instant('GLOBAL.reportes.paz_y_salvo.with_elements'));
            this.pUpManager.showAlert('warning', response.mensaje || this.translate.instant('GLOBAL.reportes.paz_y_salvo.with_elements'),
              this.translate.instant('GLOBAL.reportes.paz_y_salvo.warning_title'));
          }
        } catch (error) {
          this.setStatusPazYSalvo('danger', this.translate.instant('GLOBAL.reportes.paz_y_salvo.error_descarga_pdf'));
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.reportes.paz_y_salvo.error_descarga_pdf'));
        }
      },
      error: () => {
        this.loadingPazYSalvo = false;
        this.setStatusPazYSalvo('danger', this.translate.instant('GLOBAL.reportes.consulta.error_http'));
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.reportes.consulta.error_http'));
      },
    });
  }

  public muestraFuncionario(funcionario: Partial<TerceroCriterioContratista> | string): string {
    if (!funcionario) {
      return '';
    }
    if (typeof funcionario === 'string') {
      return funcionario;
    }
    const nombre = funcionario.Tercero && funcionario.Tercero.NombreCompleto ? funcionario.Tercero.NombreCompleto : '';
    const documento = funcionario.Identificacion && funcionario.Identificacion.Numero ? funcionario.Identificacion.Numero : '';
    return documento ? `${documento} - ${nombre}` : nombre;
  }

  private buildForm(): void {
    this.formReportes = this.fb.group({
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
    }, {
      validators: [this.validarRangoFechas()],
    });
  }

  private buildPazYSalvoForm(): void {
    this.formPazYSalvo = this.fb.group({
      funcionario: ['', [Validators.required, this.validarFuncionario()]],
    });
    this.funcionariosFiltrados = this.cambiosFuncionario(this.formPazYSalvo.get('funcionario'));
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

  private getPdfFileName(fileName: string): string {
    const fallback = 'paz_y_salvo.pdf';
    const value = fileName && fileName.trim().length ? fileName.trim() : fallback;
    return value.toLowerCase().endsWith('.pdf') ? value : `${value}.pdf`;
  }

  private setStatus(type: string, message: string): void {
    this.statusType = type;
    this.statusMessage = message;
  }

  private setStatusPazYSalvo(type: string, message: string): void {
    this.statusTypePazYSalvo = type;
    this.statusMessagePazYSalvo = message;
  }

  public limpiarPazYSalvo(): void {
    this.formPazYSalvo.reset();
    this.statusTypePazYSalvo = 'info';
    this.statusMessagePazYSalvo = '';
    this.pazYSalvoGenerado = undefined;
  }

  private cambiosFuncionario(control: AbstractControl): Observable<Partial<TerceroCriterioContratista>[]> {
    return control.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(value => this.filtroFuncionarios(typeof value === 'string' ? value : this.muestraFuncionario(value))),
    );
  }

  private filtroFuncionarios(nombre: string): TerceroCriterioContratista[] {
    if (nombre.length >= 4 && Array.isArray(this.funcionarios)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.funcionarios.filter(funcionario => this.muestraFuncionario(funcionario).toLowerCase().includes(valorFiltrado));
    }
    return [];
  }

  private validarFuncionario(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof valor === 'string' && valor.length < 4 && valor !== '';
      const checkInvalidString = typeof valor === 'string' && valor !== '';
      const checkInvalidObject = typeof valor === 'object' && valor && (!valor.Tercero || !valor.Identificacion);
      return checkStringLength ? { errorLongitudMinima: true } :
        ((checkInvalidString || checkInvalidObject) ? { funcionarioNoValido: true } : null);
    };
  }

  private loadFuncionarios() {
    this.store.select((state) => state).subscribe((list) => {
      if (list.listFuncionarios && list.listFuncionarios.length && list.listFuncionarios[0]) {
        this.funcionarios = list.listFuncionarios[0];
      }
    });
  }

  private getNumeroDocumentoSeleccionado(): string {
    const value = this.controlFuncionario.value;
    return value && value.Identificacion && value.Identificacion.Numero ? `${value.Identificacion.Numero}`.trim() : '';
  }

  private getUsuarioSesion(): string {
    const tokenData = this.userService.getTokenData();
    return tokenData && tokenData.sub ? tokenData.sub : this.userService.getUserMail();
  }
}
