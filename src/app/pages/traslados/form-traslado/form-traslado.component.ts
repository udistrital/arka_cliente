import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';
import { isObject } from 'rxjs/internal-compatibility';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';


@Component({
  selector: 'ngx-form-traslado',
  templateUrl: './form-traslado.component.html',
  styleUrls: ['./form-traslado.component.scss'],
})
export class FormTrasladoComponent implements OnInit {
  private funcionarios: TerceroCriterioContratista[];
  funcionariosFiltrados: Observable<Partial<TerceroCriterioContratista>[]>;
  tercerosDestino: Observable<Partial<TerceroCriterioContratista>[]>;
  dependencias: any;
  sedes: any;
  formTraslado: FormGroup;
  ubicacionesFiltradas: any = [];

  @Output() DatosEnviados = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private oikosHelper: OikosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  ngOnInit() {
    this.loadSedes();
    this.loadFuncionarios();
    this.buildForm();
  }

  private loadSedes() {
    this.oikosHelper.getSedes().subscribe(res =>
      this.sedes = res,
    );
  }

  get terceroOrigen(): FormGroup {
    const form = this.fb.group({
      tercero: ['', [Validators.required, this.validarTercero()]],
      cargo: [''],
      email: [''],
    });
    this.funcionariosFiltrados = this.cambiosFuncionario(form.get('tercero'));
    return form;
  }

  get terceroDestino(): FormGroup {
    const form = this.fb.group({
      tercero: ['', [Validators.required, this.validarTercero()]],
      cargo: [''],
      email: [''],
    });
    this.tercerosDestino = this.cambiosFuncionario(form.get('tercero'));
    return form;
  }

  get ubicacionDestino(): FormGroup {
    const form = this.fb.group({
      sede: ['', Validators.required],
      dependencia: ['', [Validators.required, this.validateObjectCompleter()]],
      ubicacion: [
        {
          value: '',
          disabled: true,
        },
        { validators: [Validators.required] },
      ],
    });
    this.cambiosDependencia(form.get('dependencia').valueChanges);
    return form;
  }

  private buildForm(): void {
    this.formTraslado = this.fb.group({
      origen: this.terceroOrigen,
      destino: this.terceroDestino,
      ubicacion: this.ubicacionDestino,
    }, { validators: this.checkValidness });
  }

  public getUbicaciones() {
    const sede = this.formTraslado.get('ubicacion.sede').valid ? this.formTraslado.get('ubicacion.sede').value : '';
    const dependencia = this.formTraslado.get('ubicacion.dependencia').valid ? this.formTraslado.get('ubicacion.dependencia').value : '';
    if (sede && dependencia) {
      this.ubicacionesFiltradas = [];
      this.formTraslado.get('ubicacion').patchValue({ ubicacion: '' });
      const transaccion: any = {};
      transaccion.Sede = this.sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = dependencia;
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          if (isObject(res[0].Relaciones)) {
            this.ubicacionesFiltradas = res[0].Relaciones;
            this.formTraslado.get('ubicacion.ubicacion').enable();
          } else {
            this.formTraslado.get('ubicacion.ubicacion').disable();
          }
        });
      }
    } else {
      this.formTraslado.get('ubicacion').patchValue({ ubicacion: '' });
      this.formTraslado.get('ubicacion.ubicacion').disable();
      this.ubicacionesFiltradas = [];
    }
  }

  public muestraDependencia(field) {
    return field ? field.Nombre : '';
  }

  public muestraFuncionario(contr: TerceroCriterioContratista): string {
    if (contr && contr.Identificacion && contr.Tercero) {
      return contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    } else if (contr && contr.Tercero) {
      return contr.Tercero.NombreCompleto;
    }
  }

  private cambiosFuncionario(control: AbstractControl): Observable<Partial<TerceroCriterioContratista>[]> {
    return control.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        distinctUntilChanged(),
        map(val => typeof val === 'string' ? val : this.muestraFuncionario(val)),
        map(nombre => this.filtroFuncionarios(nombre)),
      );
  }

  private cambiosDependencia(valueChanges: Observable<any>) {
    valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((val) => this.loadDependencias(val)),
    ).subscribe((response: any) => {
      this.dependencias = response.queryOptions[0].Id ? response.queryOptions : [];
      this.getUbicaciones();
    });
  }

  private filtroFuncionarios(nombre: string): TerceroCriterioContratista[] {
    if (nombre.length >= 4 && Array.isArray(this.funcionarios)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.funcionarios.filter(contr => this.muestraFuncionario(contr).toLowerCase().includes(valorFiltrado));
    } else return [];
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

  private loadFuncionarios(): Promise<void> {
    return new Promise<void>(resolve => {
      this.tercerosHelper.getTercerosByCriterio('funcionarios').toPromise().then(res => {
        this.funcionarios = res;
        resolve();
      });
    });
  }

  private validarTercero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '' ? true : false;
      const checkInvalidString = typeof (valor) === 'string' && valor !== '' ? true : false;
      const checkInvalidTercero = typeof (valor) === 'object' && !valor.Tercero ? true : false;
      return checkStringLength ? { errorLongitudMinima: true } :
        checkInvalidString || checkInvalidTercero ? { terceroNoValido: true } : null;
    };
  }

  private checkValidness: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const errors = control.get('origen.tercero').value !== '' &&
      control.get('origen.tercero').value === control.get('destino.tercero').value;
    errors && this.formTraslado ? control.get('destino.tercero').setErrors({'mismoTercero': true}) : null;
    return null;
  }

  private validateObjectCompleter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '' ? true : false;
      const checkInvalidString = typeof (valor) === 'string' && valor !== '' ? true : false;
      const checkInvalidObject = typeof (valor) === 'object' && !valor.Id ? true : false;
      return checkStringLength ? { errorLongitudMinima: true } :
        checkInvalidString || checkInvalidObject ? { dependenciaNoValido: true } : null;
    };
  }
}
