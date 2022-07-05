import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';

@Component({
  selector: 'ngx-form-resolucion',
  templateUrl: './form-resolucion.component.html',
  styleUrls: ['./form-resolucion.component.scss'],
})
export class FormResolucionComponent implements OnInit {

  formResolucion: FormGroup;
  maxDate: Date;
  dependencias: any[];
  @Output() resolucionData = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private oikosHelper: OikosHelper,
  ) {
    this.maxDate = new Date();
  }

  ngOnInit() {
    this.buildForm();
  }

  private buildForm(): void {
    this.formResolucion = this.fb.group({
      fecha: ['', Validators.required],
      dependencia: ['', [Validators.required, this.validateObjectCompleter()]],
      numero: ['', Validators.required],
    });
    this.cambiosDependencia(this.formResolucion.get('dependencia').valueChanges);
  }

  public submitForm(volver: boolean = false) {
    if (volver) {
      this.resolucionData.emit(true);
    } else if (this.formResolucion.valid) {
      this.resolucionData.emit(this.formResolucion.value);
    }
  }

  public muestraDependencia(field) {
    return field ? field.Nombre : '';
  }

  private cambiosDependencia(valueChanges: Observable<any>) {
    valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((val) => this.loadDependencias(val)),
    ).subscribe((response: any) => {
      this.dependencias = response.queryOptions[0].Id ? response.queryOptions : [];
    });
  }

  private loadDependencias(text: string) {
    const queryOptions$ = text.length > 3 ?
      this.oikosHelper.getDependencias(text) :
      new Observable((obs) => { obs.next([{}]); });
    return combineLatest([queryOptions$]).pipe(
      map(([queryOptions_$]) => ({
        queryOptions: queryOptions_$,
      })),
    );
  }

  private validateObjectCompleter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length && valor.length < 4;
      const checkInvalidString = typeof (valor) === 'string' && valor.length > 3;
      const checkInvalidObject = typeof (valor) === 'object' && valor && !valor.Id;
      return (checkStringLength) ? { errorLongitudMinima: true } :
        (checkInvalidString || checkInvalidObject) ? { dependenciaNoValido: true } : null;
    };
  }
}
