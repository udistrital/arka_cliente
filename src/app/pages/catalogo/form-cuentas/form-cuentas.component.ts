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
  @Input() cuentasNuevas: boolean;
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
    this.listService.findPlanCuentas();
  }

  ngOnChanges(changes) {
    if (changes.cuentasInfo && changes.cuentasInfo.currentValue) {
      this.initForms();
    } else if (changes.cuentasNuevas && changes.cuentasNuevas.currentValue) {
      this.formCuentas.markAsPristine();
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

      const sal_ = this.cuentasInfo.filter(cf => (cf.TipoMovimientoId.CodigoAbreviacion.includes('ENT_')))
        .reduce((acc, curr) => {
          const { TipoMovimientoId } = curr;
          acc[TipoMovimientoId.CodigoAbreviacion] =
            acc[TipoMovimientoId.CodigoAbreviacion] ? acc[TipoMovimientoId.CodigoAbreviacion] : [];
          acc[TipoMovimientoId.CodigoAbreviacion].push(curr);
          return acc;
        }, {});

      const ent = Object.values(ent_).map(cf => (this.formArrayCuentasMovimiento(cf)));
      const sal = Object.values(sal_).map(cf => (this.formArrayCuentasMovimiento(cf)));
      const baja = this.formArrayCuentasMovimiento(this.cuentasInfo.filter(cf => (cf.SubtipoMovimientoId.CodigoAbreviacion === 'BJ_HT')));
      const mediciones = this.formArrayCuentasMovimiento(this.cuentasInfo.filter(cf => (cf.SubtipoMovimientoId.CodigoAbreviacion === 'CRR')));

      this.formCuentas = this.fb.group({
        entradas: this.fb.array(ent),
        salidas: this.fb.array(sal),
        baja,
        mediciones,
      });

      resolve();
    });
  }

  private formArrayCuentasMovimiento(cuentas: any): FormGroup {
    if (!cuentas.length) {
      return;
    }

    const form = this.fb.group({
      cuentaEspecifica: this.fb.array(
        cuentas.map(cta =>
          this.formGroupCuentasTipoBienMovimiento(cta.Id,
            cta.TipoMovimientoId, cta.SubtipoMovimientoId, cta.CuentaDebitoId, cta.CuentaCreditoId, cta.TipoBienId))),
    });
    return form;
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
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe(
        list => {
          if (list.listPlanCuentas.length && list.listPlanCuentas[0].length) {
            this.ctas = list.listPlanCuentas[0];
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

  public setGeneral(i: number, j: number, entrada: boolean) {
    if (entrada) {
      const global = ((this.formCuentas.get('entradas') as FormArray).at(i)
        .get('cuentaEspecifica') as FormArray).at(j).value.CuentaDebitoId;
      this.patchGeneral(global);
    } else {
      const global = ((this.formCuentas.get('salidas') as FormArray).at(i)
        .get('cuentaEspecifica') as FormArray).at(j).value.CuentaCreditoId;
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

    (this.formCuentas.get('salidas') as FormArray).controls
      .map((mov_: FormGroup) => (mov_.controls.cuentaEspecifica as FormArray).controls)
      .reduce((acc, curr) => acc.concat(curr), [])
      .forEach(ctr => {
        ctr.patchValue({ CuentaCreditoId: value });
        ctr.markAsDirty();
      });

    return;
  }

  private generarTr() {
    const salidas = this.formToTransaction((this.formCuentas.get('salidas') as FormArray).controls
      .filter(mov => !mov.pristine)
      .map((mov_: FormGroup) => (mov_.controls.cuentaEspecifica as FormArray).controls)
      .reduce((acc, curr) => acc.concat(curr), []));
    const bajas = this.formCuentas.get('baja.cuentaEspecifica') ?
      this.formToTransaction((this.formCuentas.get('baja.cuentaEspecifica') as FormArray).controls) : [];
    const entradas = this.formToTransaction((this.formCuentas.get('entradas') as FormArray).controls
      .filter(mov => !mov.pristine)
      .map((mov_: FormGroup) => (mov_.controls.cuentaEspecifica as FormArray).controls)
      .reduce((acc, curr) => acc.concat(curr), []));
    const mediciones = this.formCuentas.get('mediciones.cuentaEspecifica') ?
      this.formToTransaction((this.formCuentas.get('mediciones.cuentaEspecifica') as FormArray).controls) : [];

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
        TipoMovimientoId: cmtb.TipoMovimientoId.Id,
        SubtipoMovimientoId: cmtb.SubtipoMovimientoId.Id,
        TipoBienId: { Id: cmtb.TipoBienId.Id },
      }));
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
