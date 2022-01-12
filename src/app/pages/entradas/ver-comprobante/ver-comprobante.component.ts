import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup,
   FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { ErrorStateMatcher } from '@angular/material/core';

export const MVTO_DB = 344;
export const MVTO_CR = 345;

export class MyErrorStateMatcher implements ErrorStateMatcher {
   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const isSubmitted = form && form.submitted;
      return (control && control.invalid);
   }
}

@Component({
   selector: 'ngx-ver-comprobante',
   templateUrl: './ver-comprobante.component.html',
   styleUrls: ['./ver-comprobante.component.scss'],
})
export class VerComprobanteComponent implements OnInit {
   formComprobante: FormGroup;
   displayedColumns: string[] = ['acciones', 'secuencia', 'cuenta', 'descripcion', 'debito', 'credito'];
   dataSource: MatTableDataSource<any>;
   cuentas: any[];
   cuentasFiltradas: any[];
   @Input() transaccion: any;
   @Input() tercero: any;
   @Input() consecutivo: any;
   @Input() descripcion: any;
   @Input() modo: string; // create | get | update
   @ViewChild('paginator') paginator: MatPaginator;
   totalCreditos: any;
   totalDebitos: any;
   m_db = MVTO_DB;
   matcher = new MyErrorStateMatcher();
   m_cr = MVTO_CR;
   constructor(
      private fb: FormBuilder,
      private store: Store<IAppState>,
      private listService: ListService,
   ) { }

   ngOnInit() {
      this.buildForm();
      this.listService.findPlanCuentasDebito();
      this.listService.findPlanCuentasCredito();
      this.loadLists();
      this.fillForm();
   }

   private fillForm() {
      this.totalCreditos = 0;
      this.totalDebitos = 0;
      this.transaccion.movimientos.forEach(obj => {
         if (obj.TipoMovimientoId === MVTO_DB) {
            this.totalDebitos += obj.Valor;
         }
         if (obj.TipoMovimientoId === MVTO_CR) {
            this.totalCreditos += obj.Valor;
         }
      });
   }

   public loadLists() {
      this.store.select((stte) => stte).subscribe(
         (list) => {
            if (list.listPlanCuentasCredito.length && list.listPlanCuentasDebito.length) {
               let arreglo;
               const arreglo2 = new Array();
               const arreglo3 = new Array();
               arreglo = list.listPlanCuentasCredito[0];

               arreglo.forEach((elemento) => {
                  const found = arreglo.find(element => elemento.Codigo !== element.Codigo && element.Codigo.indexOf(elemento.Codigo) === 0);
                  if (!found) {
                     arreglo2.push(elemento);
                  }
               });

               const a = arreglo2.map(x => ({
                  Codigo: x.Codigo + ' ' + x.Nombre,
                  Nombre: x.Nombre, DetalleCuentaID: x.DetalleCuentaID, Naturaleza: x.Naturaleza,
               }));
               let arreglo1;
               arreglo1 = list.listPlanCuentasDebito[0];
               arreglo1.forEach((elemento) => {
                  const found = arreglo1.find(element => elemento.Codigo !== element.Codigo &&
                     element.Codigo.indexOf(elemento.Codigo) === 0);
                  if (!found) {
                     arreglo3.push(elemento);
                  }
               });
               const b = arreglo3.map(x => ({
                  Codigo: x.Codigo + ' ' + x.Nombre,
                  Nombre: x.Nombre, DetalleCuentaID: x.DetalleCuentaID, Naturaleza: x.Naturaleza,
               }));

               this.cuentas = arreglo2.concat(arreglo3);
            }
         },
      );
      this.loadValues();
   }

   private buildForm(): void {
      this.formComprobante = this.fb.group({
         elementos: this.fb.array([], { validators: this.sumasIguales() }),
      });
      this.dataSource = new MatTableDataSource<any>();
      this.dataSource.paginator = this.paginator;
   }

   public addElemento() {
      (this.formComprobante.get('elementos') as FormArray).push(this.elemento);
      this.dataSource.data = this.dataSource.data.concat(this.elemento.value);
   }

   public fillElemento(index) {
      const naturaleza = (this.formComprobante.get('elementos') as FormArray).at(index).get('cuenta').value.Naturaleza;
      const naturalezaDff = naturaleza === 'debito' ? 'credito' : 'debito';
      (this.formComprobante.get('elementos') as FormArray).at(index).patchValue({
         credito: 0,
         debito: 0,
      });
      (this.formComprobante.get('elementos') as FormArray).at(index).get(naturalezaDff).setValidators([]);
      (this.formComprobante.get('elementos') as FormArray).at(index).get(naturalezaDff).disable();
      (this.formComprobante.get('elementos') as FormArray).at(index).get(naturaleza).setValidators(Validators.min(0.01));
      (this.formComprobante.get('elementos') as FormArray).at(index).get(naturaleza).enable();
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
               validators: [Validators.required],
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
               disabled: true,
            },
         ],
         credito: [
            {
               value: 0,
               disabled: true,
            },
         ],
      });
      this.cambiosCuenta(form.get('cuenta'));
      return form;
   }

   private cambiosCuenta(control: AbstractControl): Observable<any[]> {
      control.valueChanges
         .pipe(
            startWith(''),
            debounceTime(250),
            distinctUntilChanged(),
            map(val => typeof val === 'string' ? val : this.muestraCuenta(val)),
         ).subscribe((response: any) => {
            this.cuentasFiltradas = this.filtroCuentas(response);
         });
      return;
   }

   private loadValues() {
      this.transaccion.movimientos.forEach(mov => {
         mov.cuenta = {
            Nombre: mov.NombreCuenta,
            Codigo: mov.CuentaId,
            Naturaleza: mov.TipoMovimientoId === MVTO_CR ? 'credito' : 'debito',
         };
      });
      const disabled = this.modo === 'get';

      this.transaccion.movimientos.forEach(element => {
         const dbt = element.cuenta.Naturaleza === 'debito';
         const formEl = this.fb.group({
            cuenta: [
               {
                  value: element.cuenta,
                  disabled,
               },
               {
                  validators: [Validators.required],
               },
            ],
            descripcion: [
               {
                  value: element.Descripcion,
                  disabled: true,
               },
            ],
            credito: [
               {
                  value: !dbt ? element.Valor : 0,
                  disabled: dbt,
               },
               {
                  validators: !dbt ? [Validators.min(0.01)] : [],
               },
            ],
            debito: [
               {
                  value: dbt ? element.Valor : 0,
                  disabled: !dbt,
               },
               {
                  validators: dbt ? [Validators.min(0.01)] : [],
               },
            ],
         });
         formEl.get('cuenta').markAsTouched();
         formEl.get('debito').markAsTouched();
         formEl.get('credito').markAsTouched();
         this.cambiosCuenta(formEl.get('cuenta'));
         this.dataSource.data = this.dataSource.data.concat(formEl.value);
         (this.formComprobante.get('elementos') as FormArray).push(formEl);
      });

   }

   public getMovimientos(index, control: string) {
      return (this.formComprobante.get('elementos') as FormArray).at(index).get(control).errors;
   }

   public muestraCuenta(contr): string {
      return contr.Codigo ? contr.Codigo + ' - ' + contr.Nombre : '';
   }

   private filtroCuentas(nombre): any[] {
      if (nombre.length > 3) {
         return this.cuentas.filter(contr => this.muestraCuenta(contr).toLowerCase().includes(nombre.toLowerCase()));
      } else {
         return [];
      }
   }

   getActualIndex(index: number) {
      return index + this.paginator.pageSize * this.paginator.pageIndex;
   }

   private sumasIguales(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
         const elementos = control.value.length;
         return !elementos ? { errorNoElementos: true } : null;
      };
   }
}
