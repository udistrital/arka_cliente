import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';
import { map, startWith } from 'rxjs/operators';


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
    private store: Store<IAppState>,
    private listService: ListService,
    public oikosHelper: OikosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findSedes();
    this.listService.findFuncionarios();
  }

  ngOnInit() {
    this.form_salida = this.Formulario;
    this.loadLists();
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        if (list.listSedes.length && list.listSedes[0] &&
          list.listFuncionarios && list.listFuncionarios.length && list.listFuncionarios[0]) {
          this.Sedes = list.listSedes[0];
          this.Funcionarios = list.listFuncionarios[0];
        }
      },
    );
  }

  get Formulario(): FormGroup {
    const form = this.fb.group({
      Funcionario: ['', [Validators.required, this.validarTercero()]],
      Sede: ['', Validators.required],
      Dependencia: ['', [Validators.required, this.validateObjectCompleter()]],
      Ubicacion: ['', Validators.required],
      Observaciones: [''],
    });
    this.funcionariosFiltrados = this.cambiosFuncionario(form.get('Funcionario'));
    this.oikosHelper.cambiosDependencia(form.get('Sede'), form.get('Dependencia')).subscribe((response: any) => {
      this.dependencias = response.queryOptions;
      this.getUbicaciones();
    });
    return form;
  }

  public getUbicaciones() {
    const sede = this.form_salida.get('Sede').value;
    const dependencia = this.form_salida.get('Dependencia').value;

    if (!sede || !dependencia.Id) {
      this.form_salida.get('Ubicacion').patchValue({ ubicacion: '' });
      this.UbicacionesFiltradas = [];
      return;
    }

    const sede_ = this.Sedes.find((x) => x.Id === sede);
    this.oikosHelper.getAsignacionesBySedeAndDependencia(sede_.CodigoAbreviacion, dependencia.Id).subscribe((res: any) => {
      this.UbicacionesFiltradas = res;
    });
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
        map((val: any) => (typeof val === 'string') ? val : this.muestraFuncionario(val)),
        map((nombre: string) => this.filtroFuncionarios(nombre)),
      );
  }

  private filtroFuncionarios(nombre: string): TerceroCriterioContratista[] {
    if (nombre.length >= 4 && Array.isArray(this.Funcionarios)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Funcionarios.filter(contr => this.muestraFuncionario(contr).toLowerCase().includes(valorFiltrado));
    } else return [];
  }

  private validarTercero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '';
      const checkInvalidString = typeof (valor) === 'string' && valor !== '';
      const checkInvalidTercero = typeof (valor) === 'object' && !valor.Tercero;
      return checkStringLength ? { errorLongitudMinima: true } :
        ((checkInvalidString || checkInvalidTercero) ? { terceroNoValido: true } : null);
    };
  }

  private validateObjectCompleter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '';
      const checkInvalidString = typeof (valor) === 'string' && valor !== '';
      const checkInvalidObject = typeof (valor) === 'object' && !valor.Id;
      return checkStringLength ? { errorLongitudMinima: true } :
        (checkInvalidString || checkInvalidObject ? { dependenciaNoValido: true } : null);
    };
  }
}
