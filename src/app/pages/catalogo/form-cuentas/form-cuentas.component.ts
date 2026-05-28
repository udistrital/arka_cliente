import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'ngx-form-cuentas',
  templateUrl: './form-cuentas.component.html',
  styleUrls: ['./form-cuentas.component.scss'],
})
export class FormCuentasComponent implements OnInit, OnChanges, OnDestroy {

  @Input() escritura: boolean;
  @Input() cuentasInfo: any[];
  @Input() cuentasNuevas: boolean;
  @Output() cuentasPendientes: EventEmitter<any> = new EventEmitter<any>();
  @Output() valid = new EventEmitter<boolean>();

  formCuentas: FormGroup;
  ctas: any[];
  ctasFiltradas: any[];
  private formChangesSub: Subscription;

  constructor(
    private translate: TranslateService,
    private store: Store<IAppState>,
    private listService: ListService,
    private fb: FormBuilder,
  ) {
    this.escritura = false;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
  }

  ngOnInit() {
    this.listService.findPlanCuentas();
  }

  ngOnChanges(changes) {
    if (changes.cuentasInfo && changes.cuentasInfo.currentValue) {
      this.initForms();
    } else if (changes.cuentasNuevas && changes.cuentasNuevas.currentValue && this.formCuentas) {
      this.formCuentas.markAsPristine();
    } else if (changes.escritura && this.formCuentas) {
      if (changes.escritura.currentValue) {
        this.formCuentas.enable();
      } else {
        this.formCuentas.disable();
      }
    }
  }

  ngOnDestroy() {
    if (this.formChangesSub) {
      this.formChangesSub.unsubscribe();
    }
  }

  private async initForms() {
    const form = this.buildForm();
    await form;
    const ctas = this.loadLists();
    await ctas;
    this.hydrateConfiguredAccounts();
    this.submitForm(this.formCuentas.valueChanges);
    this.valid.emit(this.formCuentas.valid);
  }

  get movimientos(): FormArray {
    return this.formCuentas.get('movimientos') as FormArray;
  }

  private buildForm(): Promise<void> {
    return new Promise<void>(resolve => {
      this.formCuentas = this.fb.group({
        movimientos: this.fb.array(
          this.cuentasInfo.map(cta =>
            this.formGroupCuentasTipoBienMovimiento(
              cta.Id,
              cta.TipoMovimientoId,
              cta.SubtipoMovimientoId,
              cta.CuentaDebitoId,
              cta.CuentaCreditoId,
              cta.TipoBienId,
            )),
        ),
      });

      if (!this.escritura) {
        this.formCuentas.disable({ emitEvent: false });
      }

      resolve();
    });
  }

  private formGroupCuentasTipoBienMovimiento(id: number, movId, sMovId: any, db: any, cr: any, tb: any): FormGroup {
    const disabled = !this.escritura;
    const form = this.fb.group({
      Id: [id],
      TipoMovimientoId: [movId],
      SubtipoMovimientoId: [sMovId],
      TipoBienId: [tb],
      CuentaDebitoId: [
        {
          value: db,
          disabled,
        },
        {
          validators: [this.validarCompleter('Id')],
        },
      ],
      CuentaCreditoId: [
        {
          value: cr,
          disabled,
        },
        {
          validators: [this.validarCompleter('Id')],
        },
      ],
    });
    // form.get('credito').markAsTouched();
    // form.get('debito').markAsTouched();
    this.cambiosCuenta(form.get('CuentaDebitoId'));
    this.cambiosCuenta(form.get('CuentaCreditoId'));
    return form;
  }

  public loadLists(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.store.select((state) => state).pipe(
        map(list => list.listPlanCuentas),
        filter(list => !!list.length && !!list[0] && !!list[0].length),
        take(1),
      ).subscribe((list) => {
        this.ctas = list[0];
        resolve();
      });
    });
  }

  private hydrateConfiguredAccounts() {
    if (!this.formCuentas || !this.movimientos || !this.ctas || !this.ctas.length) {
      return;
    }

    this.movimientos.controls.forEach((control: FormGroup) => {
      const cuentaDebito = this.findCuentaInPlan(control.get('CuentaDebitoId').value);
      const cuentaCredito = this.findCuentaInPlan(control.get('CuentaCreditoId').value);

      control.patchValue({
        CuentaDebitoId: cuentaDebito,
        CuentaCreditoId: cuentaCredito,
      }, { emitEvent: false });

      control.markAsPristine();
      control.markAsUntouched();
    });

    this.formCuentas.markAsPristine();
    this.cuentasPendientes.emit([]);
  }

  private submitForm(valueChanges: Observable<any>) {
    if (this.formChangesSub) {
      this.formChangesSub.unsubscribe();
    }

    this.formChangesSub = valueChanges
      .pipe(debounceTime(250))
      .subscribe(() => {
        this.cuentasPendientes.emit(this.generarTr());
        this.valid.emit(this.formCuentas.valid);
      });
  }

  public getMovimientoNombre(control: AbstractControl): string {
    const tipo = control.get('TipoMovimientoId').value;
    const subtipo = control.get('SubtipoMovimientoId').value;
    const tipoNombre = this.getTranslatedMovementName(tipo);
    const subtipoNombre = this.getTranslatedMovementName(subtipo);
    const entrada = this.translate.instant('GLOBAL.Entrada');
    const salida = this.translate.instant('GLOBAL.Salida');

    if (subtipo && subtipo.CodigoAbreviacion === 'SAL' && tipoNombre) {
      return `${salida}: ${tipoNombre}`;
    }

    return `${entrada}: ${subtipoNombre || tipoNombre}`;
  }

  public onCuentaSelected(index: number, controlName: 'CuentaDebitoId' | 'CuentaCreditoId') {
    const movimiento = this.movimientos.at(index) as FormGroup;
    const value = movimiento.get(controlName).value;

    if (!value) {
      return;
    }

    if (controlName === 'CuentaDebitoId' && this.isEntradaRow(movimiento)) {
      this.patchMatchingRows(controlName, value, (ctr) => this.isEntradaRow(ctr));
    }

    if (controlName === 'CuentaCreditoId' && this.isSalidaAsociadaRow(movimiento)) {
      this.patchMatchingRows(controlName, value, (ctr) => this.isSalidaAsociadaRow(ctr));
    }
  }

  private generarTr() {
    return this.formToTransaction(this.movimientos ? this.movimientos.controls : []);
  }

  private formToTransaction(form: any) {
    return form
      .filter(mbc => !mbc.pristine && mbc.valid && mbc.get('CuentaCreditoId').value && mbc.get('CuentaDebitoId').value)
      .map(s => s.value)
      .map((cmtb) => ({
        Id: cmtb.Id,
        CuentaDebitoId: cmtb.CuentaDebitoId.Id,
        CuentaCreditoId: cmtb.CuentaCreditoId.Id,
        TipoMovimientoId: cmtb.TipoMovimientoId.Id,
        SubtipoMovimientoId: cmtb.SubtipoMovimientoId.Id,
        TipoBienId: { Id: cmtb.TipoBienId.Id },
      }));
  }

  private patchMatchingRows(
    controlName: 'CuentaDebitoId' | 'CuentaCreditoId',
    value: any,
    matcher: (control: AbstractControl) => boolean,
  ) {
    this.movimientos.controls
      .filter(matcher)
      .forEach((control: FormGroup) => {
        control.patchValue({ [controlName]: value });
        control.markAsDirty();
      });
  }

  private cambiosCuenta(control: AbstractControl) {
    control.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        map(val => typeof val === 'string' ? val : this.muestraCuenta(val)),
      ).subscribe((response: any) => {
        this.ctasFiltradas = this.filtroCuentas(response);
      });
  }

  public muestraCuenta(contr): string {
    return contr && contr.Codigo ? contr.Codigo + ' - ' + contr.Nombre : '';
  }

  private findCuentaInPlan(cuenta: any): any {
    if (!cuenta || !this.ctas || !this.ctas.length) {
      return cuenta;
    }

    if (cuenta.Codigo && cuenta.Nombre) {
      return cuenta;
    }

    const cuentaId = cuenta.Id || cuenta;
    return this.ctas.find(cta => cta && cta.Id === cuentaId)
      || this.ctas.find(cta => cta && cuenta.Codigo && cta.Codigo === cuenta.Codigo)
      || cuenta;
  }

  private filtroCuentas(nombre): any[] {
    if (this.ctas && typeof nombre === 'string' && nombre.length > 3) {
      return this.ctas.filter(contr => this.muestraCuenta(contr).toLowerCase().includes(nombre.toLowerCase()));
    } else {
      return [];
    }
  }

  private getTranslatedMovementName(movimiento: any): string {
    if (!movimiento) {
      return '';
    }

    const codigo = movimiento.CodigoAbreviacion;

    if (!codigo) {
      return movimiento.Nombre || '';
    }

    const key = 'GLOBAL.movimientos.tipo.' + codigo + '.nombre';
    const translation = this.translate.instant(key);

    return translation !== key ? translation : movimiento.Nombre || codigo;
  }

  private isEntradaRow(control: AbstractControl): boolean {
    return this.getCodigoAbreviacion(control.get('SubtipoMovimientoId').value).startsWith('ENT_');
  }

  private isSalidaAsociadaRow(control: AbstractControl): boolean {
    return this.getCodigoAbreviacion(control.get('SubtipoMovimientoId').value) === 'SAL'
      && this.getCodigoAbreviacion(control.get('TipoMovimientoId').value).startsWith('ENT_');
  }

  private getCodigoAbreviacion(movimiento: any): string {
    return movimiento && movimiento.CodigoAbreviacion ? movimiento.CodigoAbreviacion : '';
  }

  private validarCompleter(key: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkMinLength = typeof (valor) === 'string' && valor.length && valor.length < 4;
      const checkInvalidTercero = (typeof (valor) === 'object' && valor && !valor[key]) ||
        (typeof (valor) === 'string' && valor.length >= 4);
      return checkMinLength ? { errMinLength: true } : checkInvalidTercero ? { errSelected: true } : null;
    };
  }

}
