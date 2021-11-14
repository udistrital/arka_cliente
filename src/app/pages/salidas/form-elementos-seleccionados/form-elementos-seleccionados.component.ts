import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { isObject } from 'rxjs/internal-compatibility';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';


@Component({
  selector: 'ngx-form-elementos-seleccionados',
  templateUrl: './form-elementos-seleccionados.component.html',
  styleUrls: ['./form-elementos-seleccionados.component.scss'],
})
export class FormElementosSeleccionadosComponent implements OnInit {
  searchStr: string;
  searchStr2: Array<string>;
  searchStr3: string;
  dataService: CompleterData;
  dataService2: CompleterData;
  dataService3: CompleterData;
  Proveedores: any;
  Dependencias: any;
  Ubicaciones: any;
  Sedes: any;
  form_salida: FormGroup;
  private Funcionarios: TerceroCriterioContratista[];
  funcionariosFiltrados: Observable<Partial<TerceroCriterioContratista>[]>;

  @Output() DatosEnviados = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private toasterService: ToasterService,
    private completerService: CompleterService,
    private store: Store<IAppState>,
    private listService: ListService,
    private tercerosHelper: TercerosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findDependencias();
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
        this.Dependencias = list.listDependencias[0];
        this.Sedes = list.listSedes[0];
        this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
      },
    );
  }

  get Formulario(): FormGroup {
    const form = this.fb.group({
      Funcionario: ['', [Validators.required, this.validarTercero()]],
      Sede: ['', Validators.required],
      Dependencia: ['', Validators.required],
      Ubicacion: ['', Validators.required],
    });
    this.funcionariosFiltrados = this.cambiosFuncionario(form.get('Funcionario'));
    return form;
  }
  Traer_Relacion_Ubicaciones() {
    const sede = this.form_salida.get('Sede').value;
    const dependencia = this.form_salida.get('Dependencia').value;
    if (this.form_salida.get('Sede').valid && this.form_salida.get('Dependencia').valid &&
      sede !== undefined && dependencia !== undefined) {
      this.UbicacionesFiltradas = [];
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          if (isObject(res[0].Relaciones)) {
            this.form_salida.patchValue({ Ubicacion: '' });
            this.UbicacionesFiltradas = res[0].Relaciones;
          }
        });
      }
    }
  }

  onSubmit() {
    if (this.elementos2) {
      const form = this.form_salida.value;
    form.Funcionario = form.Funcionario.Tercero;
    } else {
      this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.salidas.errorFuncionario'));
    }

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
        map(val => typeof val === 'string' ? val : this.muestraFuncionario(val)),
        map(nombre => this.filtroFuncionarios(nombre)),
        );
      }

  private filtroFuncionarios(nombre: string): TerceroCriterioContratista[] {
    if (nombre.length >= 4 && Array.isArray(this.Funcionarios)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Funcionarios.filter(contr => this.muestraFuncionario(contr).toLowerCase().includes(valorFiltrado));
    } else return [];
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
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '' ? true : false;
      const checkInvalidString = typeof (valor) === 'string' && valor !== '' ? true : false;
      const checkInvalidTercero = typeof (valor) === 'object' && !valor.Tercero ? true : false;
      return checkStringLength ? { errorLongitudMinima: true } :
        checkInvalidString || checkInvalidTercero ? { terceroNoValido: true } : null;
    };
  }
  }
}
