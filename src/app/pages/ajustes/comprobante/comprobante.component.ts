import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';

@Component({
  selector: 'ngx-comprobante',
  templateUrl: './comprobante.component.html',
  styleUrls: ['./comprobante.component.scss'],
})
export class ComprobanteComponent implements OnInit {
  formComprobante: FormGroup;
  displayedColumns: string[] = ['acciones', 'secuencia', 'cuenta', 'tercero', 'descripcion', 'debito', 'credito'];
  dataSource: MatTableDataSource<any>;
  cuentas: any[];
  cuentasFiltradas: any[];
  terceros: any[];
  totalCreditos: any;
  totalDebitos: any;

  @ViewChild('paginator', {static: true}) paginator: MatPaginator;
  @Input() modo: string; // create | get | update
  @Input() ajusteInfo: any;
  @Input() consecutivo: string;
  @Input() fecha: Date;
  @Input() concepto: string;
  @Output() valid = new EventEmitter<boolean>();
  @Output() ajusteInfoChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private store: Store<IAppState>,
    private listService: ListService,
    private tercerosHelper: TercerosHelper,
  ) { }

  ngOnInit() {
    this.buildForm();
    if (this.modo !== 'get') {
      this.listService.findPlanCuentas();
    }
  }

  public loadLists() {
    this.store.select((stte) => stte).subscribe(
      (list) => {
        if (list.listPlanCuentas.length && list.listPlanCuentas[0].length) {
          this.cuentas = list.listPlanCuentas[0];
        }
      },
    );
    this.modo !== 'create' ? this.loadValues() : null;
  }

  private buildForm(): void {
    this.formComprobante = this.fb.group({
      _: [],
      elementos: this.fb.array([], [this.sumasIguales()]),
    });
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.submitForm(this.formComprobante.statusChanges);
    if (this.modo !== 'get') {
      this.loadLists();
    } else {
      this.loadValues();
    }
  }

  private submitForm(statusChanges: Observable<any>) {
    statusChanges
      .pipe(debounceTime(250))
      .subscribe(() => {
        this.valid.emit(this.formComprobante.valid);
        if (this.formComprobante.valid) {
          this.ajusteInfoChange.emit(this.formComprobante);
        }
      });
  }

  public addElemento() {
    (this.formComprobante.get('elementos') as FormArray).push(this.elemento);
    this.dataSource.data = this.dataSource.data.concat(this.elemento.value);
  }

  public fillElemento(index) {
    const tercero = (this.formComprobante.get('elementos') as FormArray).at(index).get('cuenta').value.RequiereTercero;
    if (tercero) {
      (this.formComprobante.get('elementos') as FormArray).at(index).get('tercero')
        .setValidators([Validators.required, this.validarCompleter('Numero')]);
      (this.formComprobante.get('elementos') as FormArray).at(index).get('tercero').enable();
    } else {
      (this.formComprobante.get('elementos') as FormArray).at(index).patchValue({ tercero: '' });
      (this.formComprobante.get('elementos') as FormArray).at(index).get('tercero').setValidators([]);
      (this.formComprobante.get('elementos') as FormArray).at(index).get('tercero').disable();
    }
  }

  public getErrors(index: number, control: string, error: string) {
    const err = (this.formComprobante.get('elementos') as FormArray).at(index);
    return err.get(control).errors && err.get(control).errors[error];
  }

  public removeElemento(index: number) {
    index = this.paginator.pageIndex > 0 ? index + (this.paginator.pageIndex * this.paginator.pageSize) : index;
    (this.formComprobante.get('elementos') as FormArray).removeAt(index);
    const data = this.dataSource.data;
    data.splice(index, 1);
    this.dataSource.data = data;
  }

  get elemento(): FormGroup {
    const disabled = this.modo === 'get';
    const form = this.fb.group({
      cuenta: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, this.validarCompleter('Codigo')],
        },
      ],
      tercero: [
        {
          value: '',
          disabled: true,
        },
      ],
      descripcion: [
        {
          value: '',
          disabled,
        },
      ],
      debito: [
        {
          value: 0,
          disabled,
        },
        {
          validators: [this.validarMin('credito')],
        },
      ],
      credito: [
        {
          value: 0,
          disabled,
        },
        {
          validators: [this.validarMin('debito')],
        },
      ],
    });
    this.cambiosCuenta(form.get('cuenta'));
    this.cambiosTercero(form.get('tercero'));
    return form;
  }

  private cambiosTercero(control: AbstractControl) {
    control.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((val: any) => this.loadTerceros(val)),
      ).subscribe((response: any) => {
        this.terceros = response.queryOptions &&
          response.queryOptions.length &&
          response.queryOptions[0].Numero ? response.queryOptions : [];
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
        this.cuentasFiltradas = this.filtroCuentas(response);
      });
  }

  private loadTerceros(text: string) {
    const query = 'limit=-1&fields=Numero,TerceroId&sortby=Numero&order=desc' +
      '&query=Activo%3Atrue,Numero__icontains:';
    const queryOptions$ = text.length > 3 ?
      this.tercerosHelper.getAllDatosIdentificacion(query + text) :
      new Observable((obs) => { obs.next([{}]); });
    return combineLatest([queryOptions$]).pipe(
      map(([queryOptions_$]) => ({
        queryOptions: queryOptions_$,
      })),
    );
  }

  private loadValues() {
    const disabled = this.modo === 'get';

    this.ajusteInfo.movimientos.forEach(mov => {
      const formEl = this.fb.group({
        cuenta: [
          {
            value: mov.Cuenta,
            disabled,
          },
          {
            validators: [Validators.required],
          },
        ],
        tercero: [
          {
            value: mov.TerceroId ? mov.TerceroId : '',
            disabled: disabled || !mov.Cuenta.RequiereTercero,
          },
          {
            validators: mov.Cuenta.RequiereTercero ? [Validators.required, this.validarCompleter('Numero')] : [],
          },
        ],
        descripcion: [
          {
            value: mov.Descripcion,
            disabled,
          },
        ],
        credito: [
          {
            value: mov.Credito,
            disabled,
          },
          {
            validators: [this.validarMin('debito')],
          },
        ],
        debito: [
          {
            value: mov.Debito,
            disabled,
          },
          {
            validators: [this.validarMin('credito')],
          },
        ],
      });
      formEl.get('cuenta').markAsTouched();
      formEl.get('debito').markAsTouched();
      formEl.get('credito').markAsTouched();
      formEl.get('tercero').markAsTouched();
      this.cambiosCuenta(formEl.get('cuenta'));
      this.cambiosTercero(formEl.get('tercero'));
      this.dataSource.data = this.dataSource.data.concat(formEl.value);
      (this.formComprobante.get('elementos') as FormArray).push(formEl);
    });
    this.calcular(this.formComprobante);
  }

  public muestraCuenta(contr): string {
    return contr.Codigo ? contr.Codigo + ' - ' + contr.Nombre : '';
  }

  public muestraTercero(contr): string {
    return contr.Numero ? contr.Numero : '';
  }

  private filtroCuentas(nombre): any[] {
    if (this.cuentas && nombre.length > 3) {
      return this.cuentas.filter(contr => this.muestraCuenta(contr).toLowerCase().includes(nombre.toLowerCase()));
    } else {
      return [];
    }
  }

  getActualIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  private validarMin(control_: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const dbt = control.parent ? (control.parent.controls as any).debito.value : null;
      const cdt = control.parent ? (control.parent.controls as any).credito.value : null;

      const errNone = dbt === 0 && cdt === 0;
      const errBoth = dbt > 0 && cdt > 0;

      if (!errBoth && !errNone && control.parent) {
        (control.parent.controls as any)[control_].setErrors(null);
      }
      return errNone ? { errNone: true } : errBoth ? { errBoth: true } : null;
    };
  }

  private validarCompleter(key: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkMinLength = typeof (valor) === 'string' && valor.length && valor.length < 4;
      const checkInvalidTercero = (typeof (valor) === 'object' && !valor[key]) ||
        (typeof (valor) === 'string' && valor.length >= 4);
      return checkMinLength ? { errMinLength: true } : checkInvalidTercero ? { errSelected: true } : null;
    };
  }

  private calcular(control: AbstractControl) {
    this.totalDebitos = (control.get('elementos') as FormArray).controls ?
      (control.get('elementos') as FormArray).controls
        .map((elem) => (elem = elem.get('debito').value))
        .reduce((acc, value) => (acc + value), 0) : 0;
    this.totalCreditos = (control.get('elementos') as FormArray).controls ?
      (control.get('elementos') as FormArray).controls
        .map((elem) => (elem = elem.get('credito').value))
        .reduce((acc, value) => (acc + value), 0) : 0;
  }

  private sumasIguales(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      this.totalDebitos = (control as FormArray).controls
        .map((elem) => (elem = elem.get('debito').value))
        .reduce((acc, value) => (acc + value), 0);
      this.totalCreditos = (control as FormArray).controls
        .map((elem) => (elem = elem.get('credito').value))
        .reduce((acc, value) => (acc + value), 0);
      return this.totalCreditos !== this.totalDebitos ? { errorCantidad: true } : null;
    };
  }
}
