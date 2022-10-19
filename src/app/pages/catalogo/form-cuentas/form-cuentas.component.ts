import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngx-form-cuentas',
  templateUrl: './form-cuentas.component.html',
  styleUrls: ['./form-cuentas.component.scss'],
})
export class FormCuentasComponent implements OnInit, OnChanges {

  @Input() escritura: boolean;
  @Input() cuentasInfo: any[];
  @Input() cuentasNuevas: any[];
  @Output() cuentasPendientes: EventEmitter<any> = new EventEmitter<any>();
  @Output() valid = new EventEmitter<boolean>();

  formCuentas: FormGroup;
  ctas: any[];
  ctasFiltradas: any[];

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
    this.listService.findPlanCuentasDebito();
    this.listService.findPlanCuentasCredito();
  }

  ngOnChanges(changes) {
    if (changes.cuentasInfo && changes.cuentasInfo.currentValue) {
      this.initForms();
    } else if (changes.cuentasNuevas && changes.cuentasNuevas.currentValue) {
      this.updateForm();
    } else if (changes.escritura) {
      if (changes.escritura.currentValue) {
        this.formCuentas.enable();
      } else {
        this.formCuentas.disable();
      }
    }
  }

  private async initForms() {
    const form = this.builForm();
    await form;
    const ctas = this.loadLists();
    await ctas;
    this.submitForm(this.formCuentas.valueChanges);
    this.valid.emit(this.formCuentas.valid);
  }

  private builForm(): Promise<void> {
    return new Promise<void>(resolve => {

      const ent_ = this.cuentasInfo.filter(cf => (cf.SubtipoMovimientoId.CodigoAbreviacion.includes('ENT_')))
        .reduce((acc, curr) => {
          const { SubtipoMovimientoId } = curr;
          acc[SubtipoMovimientoId.CodigoAbreviacion] =
            acc[SubtipoMovimientoId.CodigoAbreviacion] ? acc[SubtipoMovimientoId.CodigoAbreviacion] : [];
          acc[SubtipoMovimientoId.CodigoAbreviacion].push(curr);
          return acc;
        }, {});

      const ent = Object.values(ent_).map(cf => (this.formArrayCuentasMovimiento(cf)));
      const salida = this.formArrayCuentasMovimiento(this.cuentasInfo.filter(cf => (cf.SubtipoMovimientoId.CodigoAbreviacion.includes('SAL'))));
      const baja = this.formArrayCuentasMovimiento(this.cuentasInfo.filter(cf => (cf.SubtipoMovimientoId.CodigoAbreviacion.includes('BJ_HT'))));
      const depreciacion = this.formArrayCuentasMovimiento(this.cuentasInfo.filter(cf => (cf.SubtipoMovimientoId.CodigoAbreviacion.includes('DEP'))));
      const amortizacion = this.formArrayCuentasMovimiento(this.cuentasInfo.filter(cf => (cf.SubtipoMovimientoId.CodigoAbreviacion.includes('AMT'))));

      this.formCuentas = this.fb.group({
        entradas: this.fb.array(ent),
        salida,
        baja,
        mediciones: depreciacion ? depreciacion : amortizacion ? amortizacion : [],
      });

      resolve();
    });
  }

  private formArrayCuentasMovimiento(cuentas: any): FormGroup {
    const form = this.fb.group({
      cuentaEspecifica: this.fb.array(
        cuentas.map(cta =>
          this.formGroupCuentasTipoBienMovimiento(cta.Id, cta.SubtipoMovimientoId, cta.CuentaDebitoId, cta.CuentaCreditoId, cta.TipoBienId))),
    });
    return form;
  }

  private formGroupCuentasTipoBienMovimiento(id: number, movId: any, db: any, cr: any, tb: any): FormGroup {
    const disabled = !this.escritura;
    const form = this.fb.group({
      Id: [id],
      SubtipoMovimientoId: [movId],
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
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe(
        list => {
          if (list.listPlanCuentasCredito.length && list.listPlanCuentasDebito.length &&
            list.listPlanCuentasCredito[0].length && list.listPlanCuentasDebito[0].length) {
            this.ctas = list.listPlanCuentasCredito[0].concat(list.listPlanCuentasDebito[0]);
            resolve();
          }
        });
    });
  }

  private submitForm(valueChanges: Observable<any>) {
    valueChanges
      .pipe(debounceTime(250))
      .subscribe(() => {
        this.cuentasPendientes.emit(this.generarTr());
      });
  }

  public setGeneral(i: number, j: number) {
    if (i !== null && j !== null) {
      const global = ((this.formCuentas.get('entradas') as FormArray).at(i)
        .get('cuentaEspecifica') as FormArray).at(j).value.CuentaDebitoId;
      this.patchGeneral(global);
    } else if (i !== null && j === null) {
      const global = (this.formCuentas.get('salida.cuentaEspecifica') as FormArray).at(i).value.CuentaCreditoId;
      this.patchGeneral(global);
    }
    return;
  }

  private patchGeneral(value: any) {
    (this.formCuentas.get('entradas') as FormArray).controls
      .map((mov_: FormGroup) => (mov_.controls.cuentaEspecifica as FormArray).controls)
      .reduce((acc, curr) => acc.concat(curr), [])
      .forEach(ctr => {
        ctr.patchValue({ CuentaDebitoId: value });
        ctr.markAsDirty();
      });

    (this.formCuentas.get('salida.cuentaEspecifica') as FormArray).controls
      .reduce((acc, curr) => acc.concat(curr), [])
      .forEach(ctr => {
        ctr.patchValue({ CuentaCreditoId: value });
        ctr.markAsDirty();
      });
    return;
  }

  private generarTr() {
    const salidas = this.formToTransaction((this.formCuentas.get('salida.cuentaEspecifica') as FormArray).controls);
    const bajas = this.formToTransaction((this.formCuentas.get('baja.cuentaEspecifica') as FormArray).controls);
    const mediciones = this.formToTransaction((this.formCuentas.get('mediciones.cuentaEspecifica') as FormArray).controls);
    const entradas = this.formToTransaction((this.formCuentas.get('entradas') as FormArray).controls
      .filter(mov => !mov.pristine)
      .map((mov_: FormGroup) => (mov_.controls.cuentaEspecifica as FormArray).controls)
      .reduce((acc, curr) => acc.concat(curr), []));

    return entradas.concat(salidas).concat(bajas).concat(mediciones);
  }

  private formToTransaction(form: any) {
    return form
      .filter(mbc => !mbc.pristine && mbc.valid && mbc.get('CuentaCreditoId').value && mbc.get('CuentaDebitoId').value)
      .map(s => s.value)
      .map((cmtb) => ({
        Id: cmtb.Id,
        CuentaDebitoId: cmtb.CuentaDebitoId.Id,
        CuentaCreditoId: cmtb.CuentaCreditoId.Id,
        SubtipoMovimientoId: cmtb.SubtipoMovimientoId.Id,
        TipoBienId: { Id: cmtb.TipoBienId.Id },
      }));
  }

  private updateForm() {
    this.cuentasNuevas.forEach(cta => {

      const salida_ = this.findForm((this.formCuentas.get('salida.cuentaEspecifica') as FormArray).controls, cta);
      if (salida_) {
        this.patchForm(salida_, cta.Id);
        return;
      }

      const mediciones_ = this.findForm((this.formCuentas.get('mediciones.cuentaEspecifica') as FormArray).controls, cta);
      if (mediciones_) {
        this.patchForm(mediciones_, cta.Id);
        return;
      }

      const baja_ = this.findForm((this.formCuentas.get('baja.cuentaEspecifica') as FormArray).controls, cta);
      if (baja_) {
        this.patchForm(baja_, cta.Id);
        return;
      }

      const entrada_ = this.findForm((this.formCuentas.get('entradas') as FormArray).controls
        .map((mov_: FormGroup) => (mov_.controls.cuentaEspecifica as FormArray).controls), cta);
      if (entrada_) {
        this.patchForm(entrada_, cta.Id);
        return;
      }

    });
  }

  private patchForm(form: any, Id: number) {
    form.patchValue({ Id });
    form.markAsPristine();
  }

  private findForm(controls: any, cuenta: any): any {
    return controls
      .reduce((acc, curr) => acc.concat(curr), [])
      .find(c_ => c_.value.SubtipoMovimientoId.Id === cuenta.SubtipoMovimientoId && c_.value.TipoBienId.Id === cuenta.TipoBienId.Id);
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

  private filtroCuentas(nombre): any[] {
    if (this.ctas && nombre.length > 3) {
      return this.ctas.filter(contr => this.muestraCuenta(contr).toLowerCase().includes(nombre.toLowerCase()));
    } else {
      return [];
    }
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
