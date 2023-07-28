import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TrasladosHelper } from '../../../helpers/movimientos/trasladosHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';

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
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  load: boolean = false;
  trasladoId: number = 0;
  elementos = [];
  elementosFiltrados: any[];
  trContable: any;
  @Output() valid = new EventEmitter<boolean>();
  @Input() modo: string; // 'create' || 'get' || 'put'
  @Input() trasladoInfo: any;
  @Output() trasladoInfoChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private tercerosHelper: TercerosHelper,
    public oikosHelper: OikosHelper,
    private trasladosHelper: TrasladosHelper,
    private pUpManager: PopUpManager,
    private listService: ListService,
    private store: Store<IAppState>,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findFuncionarios();
  }

  ngOnInit() {
    this.initForms();
    if (this.modo !== 'get') {
      this.loadFuncionarios();
    }
  }

  private async initForms() {
    const data = [this.buildForm(), this.loadUbicaciones(), this.loadSedes(), this.loadInventario()];
    await Promise.all(data);
    if (this.modo !== 'create') {
      this.loadValues(this.trasladoInfo);
    }
    this.load = true;
  }

  private buildForm(): Promise<void> {
    return new Promise<void>(resolve => {
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
      if (this.formTraslado) {
        resolve();
      }
    });
  }

  private loadUbicaciones(): Promise<void> {
    return new Promise<void>(resolve => {
      if (!this.trasladoInfo || !this.trasladoInfo.ubicacion || !this.trasladoInfo.ubicacion.Ubicacion) {
        resolve();
      } else {
        if (this.modo === 'put') {
          const sede = this.trasladoInfo.ubicacion.Sede;
          const dependencia = this.trasladoInfo.ubicacion.Dependencia;
          this.oikosHelper.getAsignacionesBySedeAndDependencia(sede.CodigoAbreviacion, dependencia.Id).subscribe((res: any) => {
            this.ubicacionesFiltradas = res;
            resolve();
          });
        } else if (this.modo === 'get') {
          this.ubicacionesFiltradas = [this.trasladoInfo.ubicacion.Ubicacion];
          resolve();
        } else {
          resolve();
        }
      }

    });
  }

  private loadSedes(): Promise<void> {
    return new Promise<void>(resolve => {
      if (!this.trasladoInfo || !this.trasladoInfo.ubicacion || !this.trasladoInfo.ubicacion.Sede) {
        resolve();
      } else {
        if (this.modo !== 'get') {
          this.oikosHelper.getSedes().subscribe((res: any) => {
            this.sedes = res;
            resolve();
          });
        } else {
          this.sedes = [this.trasladoInfo.ubicacion.Sede];
          resolve();
        }
      }

    });
  }

  private loadInventario(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.modo !== 'get') {
        this.trasladosHelper.getInventarioTercero().subscribe((res: any) => {
          if (res.Elementos.length) {
            this.elementos = res.Elementos;
            if (this.modo === 'create') {
              const tercero_ = res.Tercero;
              const tercero = tercero_.Tercero && tercero_.Tercero.length ? tercero_.Tercero[0] : null;
              const emailO = tercero_.Correo.length && tercero_.Correo[0].Dato ?
                JSON.parse(tercero_.Correo[0].Dato).value : this.translate.instant('GLOBAL.traslados.noEmail');
              const cargoO = tercero_.Cargo.length ?
                tercero_.Cargo[0].Nombre : this.translate.instant('GLOBAL.traslados.noCargo');

              this.formTraslado.get('origen').patchValue({ tercero: tercero });
              this.formTraslado.get('origen').patchValue({ email: emailO });
              this.formTraslado.get('origen').patchValue({ cargo: cargoO });
            }
          } else if (this.modo === 'create') {
            this.formTraslado.disable();
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registrar.noElementos'));
          }
          resolve();
        });
      } else {
        resolve();
      }
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
    const disabled = true;
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
    if (!disabled) {
      this.tercerosDestino = this.cambiosFuncionario(form.get('tercero'));
    }
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
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
    });
    if (!disabled) {
      this.cambiosDependencia(form.get('sede'), form.get('dependencia'));
    }
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
    if (!disabled) {
      this.cambiosPlaca(form.get('placa').valueChanges);
    }
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

  private loadValues(values: any) {
    if (values.trContable) {
      this.trContable = values.trContable;
    }
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

    if (values.ubicacion && values.ubicacion.Sede) {
      const sede = values.ubicacion.Sede.Id;
      const dependencia = values.ubicacion.Dependencia;
      const ubicacion = values.ubicacion.Ubicacion.Id;

      this.formTraslado.get('ubicacion').setValue(
        {
          sede,
          dependencia,
          ubicacion,
        },
        { emitEvent: false },
      );
    }

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
    const sede = this.formTraslado.get('ubicacion.sede').value;
    const dependencia = this.formTraslado.get('ubicacion.dependencia').value;

    if (!sede || !dependencia.Id) {
      this.formTraslado.get('ubicacion').patchValue({ ubicacion: '' });
      this.ubicacionesFiltradas = [];
      return;
    }

    const sede_ = this.sedes.find((x) => x.Id === sede);
    this.oikosHelper.getAsignacionesBySedeAndDependencia(sede_.CodigoAbreviacion, dependencia.Id).subscribe((res: any) => {
      this.ubicacionesFiltradas = res;
    });
  }

  public getInfoTercero(controlName: string) {
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
      .pipe(debounceTime(250))
      .subscribe(() => {
        this.valid.emit(this.formTraslado.valid);
        if (this.formTraslado.valid && this.load) {
          this.trasladoInfoChange.emit(this.formTraslado);
        }
      });
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
        map((val: any) => typeof val === 'string' ? val : this.muestraFuncionario(val)),
        map((nombre: string) => this.filtroFuncionarios(nombre)),
      );
  }

  private cambiosDependencia(sedeCtrl, depCtrl) {
    this.oikosHelper.cambiosDependencia(sedeCtrl, depCtrl).subscribe((response: any) => {
      if (this.load) {
        this.dependencias = response.queryOptions;
        this.getUbicaciones();
      }
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

  private loadFuncionarios(): Promise<void> {
    return new Promise<void>(resolve => {
      this.store.select((state) => state).subscribe(
        (list) => {
          if (list.listFuncionarios && list.listFuncionarios.length && list.listFuncionarios[0]) {
            this.funcionarios = list.listFuncionarios[0];
            resolve();
          }
        },
      );
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
      const checkInvalidObject = typeof (valor) === 'object' && valor && !valor.Id;
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
