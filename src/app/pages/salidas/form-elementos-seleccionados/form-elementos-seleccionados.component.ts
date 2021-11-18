import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';
import { isObject } from 'rxjs/internal-compatibility';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';


@Component({
  selector: 'ngx-form-elementos-seleccionados',
  templateUrl: './form-elementos-seleccionados.component.html',
  styleUrls: ['./form-elementos-seleccionados.component.scss'],
})
export class FormElementosSeleccionadosComponent implements OnInit {
  dependencias: any;
  Sedes: any;
  form_salida: FormGroup;
  UbicacionesFiltradas: any = [];
  private Funcionarios: TerceroCriterioContratista[];
  funcionariosFiltrados: Observable<Partial<TerceroCriterioContratista>[]>;

  @Output() DatosEnviados = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private tercerosHelper: TercerosHelper,
    private oikosHelper: OikosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findSedes();
    this.loadLists();
  }

  ngOnInit() {
    this.form_salida = this.Formulario;
    this.loadLists;
    this.loadFuncionarios();
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Sedes = list.listSedes[0];
      },
    );
  }

  get Formulario(): FormGroup {
    const form = this.fb.group({
      Funcionario: ['', [Validators.required, this.validarTercero()]],
      Sede: ['', Validators.required],
      Dependencia: ['', [Validators.required, this.validateObjectCompleter()]],
      Ubicacion: [
        {
          value: '',
          disabled: true,
        },
        { validators: [Validators.required] },
      ],
      Observaciones: [''],
    });
    this.funcionariosFiltrados = this.cambiosFuncionario(form.get('Funcionario'));
    this.cambiosDependencia(form.get('Dependencia').valueChanges);
    return form;
  }

  public getUbicaciones() {
    const sede = this.form_salida.get('Sede').valid ? this.form_salida.get('Sede').value : '';
    const dependencia = this.form_salida.get('Dependencia').valid ? this.form_salida.get('Dependencia').value : '';
    this.form_salida.patchValue({ Ubicacion: '' });
    if (sede && dependencia) {
      this.UbicacionesFiltradas = [];
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = dependencia;
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          if (isObject(res[0].Relaciones)) {
            this.UbicacionesFiltradas = res[0].Relaciones;
            this.form_salida.get('Ubicacion').enable();
          } else {
            this.form_salida.get('Ubicacion').disable();
          }
        });
      }
    } else {
      this.form_salida.get('Ubicacion').disable();
      this.UbicacionesFiltradas = [];
    }
  }

  public onSubmit() {
    const form = this.form_salida.value;
    form.Funcionario = form.Funcionario.Tercero;
    form.Sede = this.Sedes.find(y => y.Id === parseInt(form.Sede, 10));
    form.Ubicacion = this.UbicacionesFiltradas.find(w => w.Id === parseInt(form.Ubicacion, 10));
    this.DatosEnviados.emit(form);
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
        map(val => (typeof val === 'string') ? val : this.muestraFuncionario(val)),
        map(nombre => this.filtroFuncionarios(nombre)),
      );
  }

  private cambiosDependencia(valueChanges: Observable<any>) {
    valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((val) => this.loadDependencias(val) ),
    ).subscribe((response: any) => {
      this.dependencias = response.queryOptions[0].Id ? response.queryOptions : [];
      this.getUbicaciones();
    });
  }

  private filtroFuncionarios(nombre: string): TerceroCriterioContratista[] {
    if (nombre.length >= 4 && Array.isArray(this.Funcionarios)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Funcionarios.filter(contr => this.muestraFuncionario(contr).toLowerCase().includes(valorFiltrado));
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
        this.Funcionarios = res;
        resolve();
      });
    });
  }

  private validarTercero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '';
      const checkInvalidString = typeof (valor) === 'string' && valor !== '';
      const checkInvalidTercero = typeof (valor) === 'object' && !valor.Tercero;
      return checkStringLength ? { errorLongitudMinima: true } :
        (checkInvalidString || checkInvalidTercero) ? { terceroNoValido: true } : null;
    };
  }

  private validateObjectCompleter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '';
      const checkInvalidString = typeof (valor) === 'string' && valor !== '';
      const checkInvalidObject = typeof (valor) === 'object' && !valor.Id;
      return checkStringLength ? { errorLongitudMinima: true } :
        checkInvalidString || checkInvalidObject ? { dependenciaNoValido: true } : null;
    };
  }
}
