import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormArray, Form } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';
import { isObject } from 'rxjs/internal-compatibility';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { DetalleTraslado } from '../../../@core/data/models/movimientos_arka/movimientos_arka';


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
  displayedColumns: string[] = ['acciones', 'placa', 'nombre'];
  dataSource: MatTableDataSource<any>;
  @ViewChild('paginator') paginator: MatPaginator;
  modo = 'registro';
  @Output() valid = new EventEmitter<boolean>();
  @Input() trasladoInfo: DetalleTraslado;
  @Output() trasladoInfoChange: EventEmitter<DetalleTraslado> = new EventEmitter<DetalleTraslado>();


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
    const disabled = this.modo === 'ver';
    const form = this.fb.group({
      tercero: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, this.validarTercero()],
        },
      ],
      cargo: [
        {
          value: '',
          disabled: true,
        },
      ],
      email: [
        {
          value: '',
          disabled: true,
        },
      ],
    });
    this.funcionariosFiltrados = this.cambiosFuncionario(form.get('tercero'));
    return form;
  }

  get terceroDestino(): FormGroup {
    const disabled = this.modo === 'ver';
    const form = this.fb.group({
      tercero: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, this.validarTercero()],
        },
      ],
      cargo: [
        {
          value: '',
          disabled: true,
        },
      ],
      email: [
        {
          value: '',
          disabled: true,
        },
      ],
    });
    this.tercerosDestino = this.cambiosFuncionario(form.get('tercero'));
    return form;
  }

  get ubicacionDestino(): FormGroup {
    const disabled = this.modo === 'ver';
    const form = this.fb.group({
      sede: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      dependencia: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, this.validateObjectCompleter()],
        },
      ],
      ubicacion: [
        {
          value: '',
          disabled: true,
        },
        {
          validators: [Validators.required],
        },
      ],
    });
    this.cambiosDependencia(form.get('dependencia').valueChanges);
    return form;
  }

  get elemento(): FormGroup {
    const disabled = this.modo === 'ver';
    const form = this.fb.group({
      placa: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      nombre: [
        {
          value: '',
          disabled: true,
        },
      ],
    });
    return form;
  }

  get observaciones(): FormGroup {
    const disabled = this.modo === 'ver';
    const form = this.fb.group({
      observaciones: [
        {
          value: '',
          disabled,
        },
      ],
    });
    return form;
  }

  private buildForm(): void {
    this.formTraslado = this.fb.group({
      origen: this.terceroOrigen,
      destino: this.terceroDestino,
      ubicacion: this.ubicacionDestino,
      elementos: this.fb.array([], { validators: this.validateElementos() }),
      observaciones: this.observaciones,
    }, { validators: this.checkValidness });
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.submitForm(this.formTraslado.statusChanges);
  }

  addElemento() {
    (this.formTraslado.get('elementos') as FormArray).push(this.elemento);
    this.dataSource.data = this.dataSource.data.concat(this.elemento.value);
  }

  getActualIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  removeElemento(index: number) {
    index = this.paginator.pageIndex > 0 ? index + (this.paginator.pageIndex * this.paginator.pageSize) : index;
    (this.formTraslado.get('elementos') as FormArray).removeAt(index);
    const data = this.dataSource.data;
    data.splice(index, 1);
    this.dataSource.data = data;
  }

  public getUbicaciones() {
    const sede = this.formTraslado.get('ubicacion.sede').valid ? this.formTraslado.get('ubicacion.sede').value : '';
    const dependencia = this.formTraslado.get('ubicacion.dependencia').valid ? this.formTraslado.get('ubicacion.dependencia').value : '';
    this.formTraslado.get('ubicacion').patchValue({ ubicacion: '' });
    if (sede && dependencia) {
      this.ubicacionesFiltradas = [];
      const transaccion: any = {};
      transaccion.Sede = this.sedes.find((x) => x.Id === parseInt(sede, 10));
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
      this.formTraslado.get('ubicacion.ubicacion').disable();
      this.ubicacionesFiltradas = [];
    }
  }

  getInfoTercero(controlName: string) {
    const terceroId = this.formTraslado.get(controlName + '.tercero').value.Tercero.Id;
    this.loadCargo(terceroId, controlName);
    this.loadEmail(terceroId, controlName);
  }

  private loadCargo(terceroId: number, controlName: string) {
    this.tercerosHelper.getCargo(terceroId).subscribe(res => {
      if (res.length) {
        this.formTraslado.get(controlName).patchValue({ cargo: res[0].Nombre });
      } else {
        this.formTraslado.get(controlName).patchValue({ cargo: this.translate.instant('GLOBAL.traslados.noCargo') });
      }
    });
  }

  private loadEmail(terceroId: number, controlName: string) {
    this.tercerosHelper.getCorreo(terceroId).subscribe(res => {
      if (res[0].Dato) {
        this.formTraslado.get(controlName).patchValue({ email: JSON.parse(res[0].Dato).value });
      } else {
        this.formTraslado.get(controlName).patchValue({ email: this.translate.instant('GLOBAL.traslados.noEmail') });
      }
    });
  }

  private submitForm(statusChanges: Observable<any>) {
    statusChanges
      .debounceTime(250)
      .subscribe(() => {
        this.valid.emit(this.formTraslado.valid);
        if (this.formTraslado.valid) {
          this.trasladoInfoChange.emit(this.formTraslado.value);
        }
      });
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
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '';
      const checkInvalidString = typeof (valor) === 'string' && valor !== '';
      const checkInvalidTercero = typeof (valor) === 'object' && !valor.Tercero;
      return checkStringLength ? { errorLongitudMinima: true } :
        (checkInvalidString || checkInvalidTercero) ? { terceroNoValido: true } : null;
    };
  }

  private checkValidness: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const errors = control.get('origen.tercero').value !== '' &&
      control.get('origen.tercero').value === control.get('destino.tercero').value;
    errors && this.formTraslado ? control.get('destino.tercero').setErrors({ 'mismoTercero': true }) : null;
    return null;
  }

  private validateObjectCompleter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '';
      const checkInvalidString = typeof (valor) === 'string' && valor !== '';
      const checkInvalidObject = typeof (valor) === 'object' && !valor.Id;
      return checkStringLength ? { errorLongitudMinima: true } :
        (checkInvalidString || checkInvalidObject) ? { dependenciaNoValido: true } : null;
    };
  }

  private validateElementos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const elementos = control.value.length;
      return !elementos ? { errorNoElementos: true } : null;
    };
  }

}