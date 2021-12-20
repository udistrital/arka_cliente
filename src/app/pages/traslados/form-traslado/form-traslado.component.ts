import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';
import { isObject } from 'rxjs/internal-compatibility';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { TrasladosHelper } from '../../../helpers/movimientos/trasladosHelper';

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
  displayedColumns: string[] = ['acciones', 'placa', 'nombre', 'marca', 'serie', 'valor'];
  dataSource: MatTableDataSource<any>;
  @ViewChild('paginator') paginator: MatPaginator;
  load: boolean = false;
  trasladoId: number = 0;
  elementos = [];
  elementosFiltrados: any[];
  @Output() valid = new EventEmitter<boolean>();
  @Input() modo: string = 'create'; // get | update
  @Input() trasladoInfo: any;
  @Output() trasladoInfoChange: EventEmitter<any> = new EventEmitter<any>();


  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private oikosHelper: OikosHelper,
    private trasladosHelper: TrasladosHelper,
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
    this.oikosHelper.getSedes().subscribe((res: any) => {
      this.sedes = res;
      this.modo !== 'create' ? this.loadValues(this.trasladoInfo) : this.load = true;
    });
  }

  get rechazo(): FormGroup {
    const form = this.fb.group({
      razon: [
        {
          value: '',
          disabled: true,
        },
      ],
    });
    return form;
  }

  get terceroOrigen(): FormGroup {
    const disabled = this.modo === 'get';
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
    const disabled = this.modo === 'get';
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
    const disabled = this.modo === 'get';
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
    const disabled = this.modo === 'get';
    const form = this.fb.group({
      id: [0],
      placa: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, this.validateObjectCompleter()],
        },
      ],
      nombre: [
        {
          value: '',
          disabled: true,
        },
      ],
      marca: [
        {
          value: '',
          disabled: true,
        },
      ],
      serie: [
        {
          value: '',
          disabled: true,
        },
      ],
      valor: [
        {
          value: '',
          disabled: true,
        },
      ],
    });
    this.cambiosPlaca(form.get('placa').valueChanges);
    return form;
  }

  get observaciones(): FormGroup {
    const disabled = this.modo === 'get';
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
      rechazo: this.rechazo,
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

  private loadValues(values: any) {
    const razon = values.rechazo ? values.rechazo : '';
    this.formTraslado.get('rechazo').patchValue({ razon });
    const disabled = this.modo === 'get';
    const terceroO = values.origen.Tercero[0];
    const emailO = values.origen.Correo.length && values.origen.Correo[0].Dato ?
      JSON.parse(values.origen.Correo[0].Dato).value : this.translate.instant('GLOBAL.traslados.noEmail');
    const cargoO = values.origen.Cargo.length ?
      values.origen.Cargo[0].Nombre : this.translate.instant('GLOBAL.traslados.noCargo');
    this.formTraslado.get('origen').patchValue({ tercero: terceroO });
    this.formTraslado.get('origen').patchValue({ email: emailO });
    this.formTraslado.get('origen').patchValue({ cargo: cargoO });

    const terceroD = values.destino.Tercero[0];
    const emailD = values.destino.Correo.length && values.destino.Correo[0].Dato ?
      JSON.parse(values.destino.Correo[0].Dato).value : this.translate.instant('GLOBAL.traslados.noEmail');
    const cargoD = values.destino.Cargo.length ?
      values.destino.Cargo[0].Nombre : this.translate.instant('GLOBAL.traslados.noCargo');
    this.formTraslado.get('destino').patchValue({ tercero: terceroD });
    this.formTraslado.get('destino').patchValue({ email: emailD });
    this.formTraslado.get('destino').patchValue({ cargo: cargoD });

    const sede = values.ubicacion.Sede.Id;
    const dependencia = values.ubicacion.Dependencia;
    const ubicacion = values.ubicacion.Ubicacion.Id;
    this.formTraslado.get('ubicacion').patchValue({ sede, emitEvent: false });
    this.formTraslado.get('ubicacion').patchValue({ dependencia, emitEvent: false });
    this.formTraslado.get('ubicacion').patchValue({ ubicacion });

    values.elementos.forEach(element => {
      const formEl = this.fb.group({
        id: [element.Id],
        placa: [
          {
            value: element,
            disabled,
          },
          {
            validators: [Validators.required],
          },
        ],
        nombre: [
          {
            value: element.Nombre,
            disabled: true,
          },
        ],
        marca: [
          {
            value: element.Marca,
            disabled: true,
          },
        ],
        serie: [
          {
            value: element.Serie,
            disabled: true,
          },
        ],
        valor: [
          {
            value: element.Valor,
            disabled: true,
          },
        ],
      });
      (this.formTraslado.get('elementos') as FormArray).push(formEl);
      this.dataSource.data = this.dataSource.data.concat(formEl.value);
    });

    const observaciones = values.observaciones;
    this.formTraslado.get('observaciones').patchValue({ observaciones });
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
    const sede = this.formTraslado.get('ubicacion.sede').value ? this.formTraslado.get('ubicacion.sede').value : '';
    const dependencia = this.formTraslado.get('ubicacion.dependencia').value.Id ? this.formTraslado.get('ubicacion.dependencia').value : '';
    this.formTraslado.get('ubicacion').patchValue({ ubicacion: '' });
    if (sede && dependencia) {
      this.ubicacionesFiltradas = [];
      const transaccion: any = {};
      transaccion.Sede = this.sedes.find((x) => x.Id === parseInt(sede, 10));
      transaccion.Dependencia = dependencia;
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          if (!this.load) {
            this.formTraslado.get('ubicacion').patchValue({ ubicacion: this.trasladoInfo.ubicacion.Ubicacion.Id });
            this.load = true;
          }
          if (isObject(res[0].Relaciones)) {
            this.ubicacionesFiltradas = res[0].Relaciones;
            this.modo !== 'get' ? this.formTraslado.get('ubicacion.ubicacion').enable() : null;
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
    if (controlName === 'origen') {
      (this.formTraslado.get('elementos') as FormArray).reset();
      this.removeElemento(0);
      this.dataSource.data = [];
      this.trasladosHelper.getElementosFuncionario(terceroId).subscribe(res => {
        this.elementos = res;
      });
    }
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
        if (this.formTraslado.valid && this.load) {
          this.trasladoInfoChange.emit(this.formTraslado);
        }
      });
  }

  public muestraDependencia(field) {
    return field ? field.Nombre : '';
  }

  public muestraPlaca(field): string {
    return field && field.Placa ? field.Placa : '';
  }

  public fillElemento(event, index) {
    const value = event.option.value;
    (this.formTraslado.get('elementos') as FormArray).at(index).patchValue({
      id: value.Id,
      nombre: value.Nombre,
      marca: value.Marca,
      serie: value.Serie,
      valor: value.Valor,
    });
  }

  public muestraFuncionario(contr: TerceroCriterioContratista): string {
    if (contr && contr.Identificacion && contr.Tercero) {
      return contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    } else if (contr && contr.Tercero) {
      return contr.Tercero.NombreCompleto;
    }
  }

  private cambiosPlaca(valueChanges: Observable<any>) {
    valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      distinctUntilChanged(),
      map(val => typeof val === 'string' ? val : this.muestraPlaca(val)),
    ).subscribe((response: any) => {
      this.elementosFiltrados = this.filtroPlaca(response);
    });
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

  private filtroPlaca(nombre: string): any[] {
    if (this.elementos.length && nombre.length > 0) {
      return this.elementos.filter(el => el.Placa.includes(nombre));
    } else {
      return this.elementos;
    }
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
        ((checkInvalidString || checkInvalidTercero) ? { terceroNoValido: true } : null);
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
        ((checkInvalidString || checkInvalidObject) ? { dependenciaNoValido: true } : null);
    };
  }

  private validateElementos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const elementos = control.value.length;
      return !elementos ? { errorNoElementos: true } : null;
    };
  }

}
