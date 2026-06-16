import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';
import { map, startWith } from 'rxjs/operators';
import { CentroCostosHelper } from '../../../helpers/movimientos/centroCostosHelper';


@Component({
  selector: 'ngx-form-elementos-seleccionados',
  templateUrl: './form-elementos-seleccionados.component.html',
  styleUrls: ['./form-elementos-seleccionados.component.scss'],
})
export class FormElementosSeleccionadosComponent implements OnInit {
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
    public centroCostosHelper: CentroCostosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findFuncionarios();
  }

  ngOnInit() {
    this.form_salida = this.Formulario;
    this.loadLists();
    this.getUbicaciones();
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        if (list.listFuncionarios && list.listFuncionarios.length && list.listFuncionarios[0]) {
          this.Funcionarios = list.listFuncionarios[0];
        }
      },
    );
  }

  get Formulario(): FormGroup {
    const form = this.fb.group({
      Funcionario: ['', [Validators.required, this.validarTercero()]],
      Ubicacion: ['', Validators.required],
      Observaciones: [''],
    });
    this.funcionariosFiltrados = this.cambiosFuncionario(form.get('Funcionario'));
    return form;
  }

  public getUbicaciones() {
    this.centroCostosHelper.getAllCentroCostos().subscribe((res: any) => {
      this.UbicacionesFiltradas = res || [];
    });
  }

  public onSubmit() {
    const form = this.form_salida.value;
    const ubicacion = this.centroCostosHelper.findCentroCostoById(
      this.UbicacionesFiltradas,
      this.centroCostosHelper.getCentroCostoId(form.Ubicacion),
    ) || form.Ubicacion;
    form.Funcionario = form.Funcionario.Tercero;
    form.Ubicacion = ubicacion;
    this.DatosEnviados.emit(form);
  }

  muestraCentroCosto = (centroCosto: any): string => this.centroCostosHelper.muestraCentroCosto(centroCosto);

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

}
