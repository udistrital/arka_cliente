import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
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
      const ent = this.cuentasInfo.filter(cf => (cf.SubtipoMovimientoId.CodigoAbreviacion.includes('ENT_') &&
        cf.SubtipoMovimientoId.CodigoAbreviacion !== 'ENT_KDX'))
        .map((elem) => (elem = this.cuentasMov(elem.Id, elem.SubtipoMovimientoId, elem.CuentaDebitoId, elem.CuentaCreditoId)));

      const sal = this.cuentasInfo.filter(cf => cf.SubtipoMovimientoId.CodigoAbreviacion === 'SAL')
        .map((elem) => (elem = this.cuentasMov(elem.Id, elem.SubtipoMovimientoId, elem.CuentaDebitoId, elem.CuentaCreditoId)));

      const bj = this.cuentasInfo.filter(cf => cf.SubtipoMovimientoId.CodigoAbreviacion === 'BJ_HT')
        .map((elem) => (elem = this.cuentasMov(elem.Id, elem.SubtipoMovimientoId, elem.CuentaDebitoId, elem.CuentaCreditoId)));

      const depr = this.cuentasInfo.filter(cf => cf.SubtipoMovimientoId.CodigoAbreviacion === 'DEP')
        .map((elem) => (elem = this.cuentasMov(elem.Id, elem.SubtipoMovimientoId, elem.CuentaDebitoId, elem.CuentaCreditoId)));
      this.formCuentas = this.fb.group({
        entradas: this.fb.array(ent),
        salida: sal[0],
        baja: bj[0],
        depreciacion: depr.length ? depr[0] : [],
      });
      resolve();
    });
  }

  private cuentasMov(id: number, movId: any, db: any, cr: any): FormGroup {
    const disabled = !this.escritura;
    const form = this.fb.group({
      id: [id],
      tipoMovimientoId: [movId],
      debito: [
        {
          value: db,
          disabled,
        },
        {
          validators: [Validators.required, this.validarCompleter('Id')],
        },
      ],
      credito: [
        {
          value: cr,
          disabled,
        },
        {
          validators: [Validators.required, this.validarCompleter('Id')],
        },
      ],
    });
    // form.get('credito').markAsTouched();
    // form.get('debito').markAsTouched();
    this.cambiosCuenta(form.get('debito'));
    this.cambiosCuenta(form.get('credito'));
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
      .debounceTime(250)
      .subscribe(() => {
        this.valid.emit(this.formCuentas.valid);
        if (this.formCuentas.valid) {
          this.cuentasPendientes.emit(this.generarTr());
        }
      });
  }

  public setGeneral(index: number, salida: boolean) {
    if (index !== null && !salida) {
      const global = (this.formCuentas.get('entradas') as FormArray).at(index).value.debito;
      (this.formCuentas.get('entradas') as FormArray).controls
        .forEach(ctr => {
          ctr.patchValue({ debito: global });
          ctr.markAsDirty();
        });
      this.formCuentas.get('salida').patchValue({ credito: global });
      this.formCuentas.get('salida').markAsDirty();
    } else if (salida && index === null) {
      const global = this.formCuentas.get('salida').value.credito;
      (this.formCuentas.get('entradas') as FormArray).controls
        .forEach(ctr => {
          ctr.patchValue({ debito: global });
          ctr.markAsDirty();
        });
    }
  }

  private generarTr() {
    const changed = (this.formCuentas.get('entradas') as FormArray).controls
      .filter((elem) => !elem.pristine)
      .map((elem) => ({
        CuentaDebitoId: elem.value.debito.Id,
        CuentaCreditoId: elem.value.credito.Id,
        SubtipoMovimientoId: elem.value.tipoMovimientoId.Id,
        Id: elem.value.id,
      }));

    if (!this.formCuentas.get('salida').pristine) {
      const value = {
        CuentaDebitoId: this.formCuentas.get('salida').value.debito.Id,
        CuentaCreditoId: this.formCuentas.get('salida').value.credito.Id,
        SubtipoMovimientoId: this.formCuentas.get('salida').value.tipoMovimientoId.Id,
        Id: this.formCuentas.get('salida').value.id,
      };
      changed.push(value);
    }

    if (!this.formCuentas.get('baja').pristine) {
      const value = {
        CuentaDebitoId: this.formCuentas.get('baja').value.debito.Id,
        CuentaCreditoId: this.formCuentas.get('baja').value.credito.Id,
        SubtipoMovimientoId: this.formCuentas.get('baja').value.tipoMovimientoId.Id,
        Id: this.formCuentas.get('baja').value.id,
      };
      changed.push(value);
    }

    if (!this.formCuentas.get('depreciacion').pristine) {
      const value = {
        CuentaDebitoId: this.formCuentas.get('depreciacion').value.debito.Id,
        CuentaCreditoId: this.formCuentas.get('depreciacion').value.credito.Id,
        SubtipoMovimientoId: this.formCuentas.get('depreciacion').value.tipoMovimientoId.Id,
        Id: this.formCuentas.get('depreciacion').value.id,
      };
      changed.push(value);
    }

    return changed;
  }

  private updateForm() {
    this.cuentasNuevas.forEach(cta => {
      const index = (this.formCuentas.get('entradas') as FormArray).controls
        .map((elem) => ({ SubtipoMovimientoId: elem.value.tipoMovimientoId.Id }))
        .findIndex(ct => ct.SubtipoMovimientoId === cta.SubtipoMovimientoId);
      if (index > -1) {
        (this.formCuentas.get('entradas') as FormArray).at(index).patchValue({ id: cta.Id });
        (this.formCuentas.get('entradas') as FormArray).at(index).markAsPristine();
      } else if (this.formCuentas.get('depreciacion').value &&
        this.formCuentas.get('depreciacion').value.tipoMovimientoId.Id === cta.SubtipoMovimientoId) {
        this.formCuentas.get('depreciacion').patchValue({ id: cta.Id });
        this.formCuentas.get('depreciacion').markAsPristine();
      } else if (this.formCuentas.get('salida').value.tipoMovimientoId.Id === cta.SubtipoMovimientoId) {
        this.formCuentas.get('salida').patchValue({ id: cta.Id });
        this.formCuentas.get('salida').markAsPristine();
      } else if (this.formCuentas.get('baja').value.tipoMovimientoId.Id === cta.SubtipoMovimientoId) {
        this.formCuentas.get('baja').patchValue({ id: cta.Id });
        this.formCuentas.get('baja').markAsPristine();
      }
    });
  }

  private cambiosCuenta(control: AbstractControl) {
    control.valueChanges
      .pipe(
        startWith(''),
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
