import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { BajasHelper } from '../../../helpers/bajas/bajasHelper';

@Component({
  selector: 'ngx-form-solicitud',
  templateUrl: './form-solicitud.component.html',
  styleUrls: ['./form-solicitud.component.scss'],
})
export class FormSolicitudComponent implements OnInit {
  dependencias: any;
  formBaja: FormGroup;
  ubicacionesFiltradas: any = [];
  dataSource: MatTableDataSource<any>;
  @ViewChild('paginator') paginator: MatPaginator;
  load: boolean = false;
  bajaId: number = 0;
  @Output() valid = new EventEmitter<boolean>();
  @Input() modo: string = 'create'; // get | update
  @Input() bajaInfo: any;
  @Output() bajaInfoChange: EventEmitter<any> = new EventEmitter<any>();
  displayedColumns: string[] = ['acciones', 'placa', 'nombre', 'subgrupo', 'tipoBien', 'entrada', 'salida',
    'funcionario', 'marca', 'sede', 'dependencia', 'ubicacion'];

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private bajasHelper: BajasHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  ngOnInit() {
    if (this.modo === 'create') {
      this.buildForm();
      this.load = true;
    }
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
          validators: [Validators.required],
        },
      ],
      nombre: [
        {
          value: '',
          disabled: true,
        },
      ],
      subgrupo: [
        {
          value: '',
          disabled: true,
        },
      ],
      tipoBien: [
        {
          value: '',
          disabled: true,
        },
      ],
      entrada: [
        {
          value: '',
          disabled: true,
        },
      ],
      salida: [
        {
          value: '',
          disabled: true,
        },
      ],
      funcionario: [
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
      sede: [
        {
          value: '',
          disabled: true,
        },
      ],
      dependencia: [
        {
          value: '',
          disabled: true,
        },
      ],
      ubicacion: [
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
    this.formBaja = this.fb.group({
      elementos: this.fb.array([], { validators: this.validateElementos() }),
      observaciones: this.observaciones,
    });
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.submitForm(this.formBaja.statusChanges);
  }

  private loadValues(values: any) {
    const disabled = this.modo === 'get';
    values.elementos.forEach(element => {
      const formEl = this.fb.group({
        id: [element.Id],
        placa: [
          {
            value: element.Placa,
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
      });
      (this.formBaja.get('elementos') as FormArray).push(formEl);
      this.dataSource.data = this.dataSource.data.concat(formEl.value);
    });

    const observaciones = values.observaciones;
    this.formBaja.get('observaciones').patchValue({ observaciones });
  }

  addElemento() {
    (this.formBaja.get('elementos') as FormArray).push(this.elemento);
    this.dataSource.data = this.dataSource.data.concat(this.elemento.value);
  }

  getActualIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  removeElemento(index: number) {
    index = this.paginator.pageIndex > 0 ? index + (this.paginator.pageIndex * this.paginator.pageSize) : index;
    (this.formBaja.get('elementos') as FormArray).removeAt(index);
    const data = this.dataSource.data;
    data.splice(index, 1);
    this.dataSource.data = data;
  }

  private cambiosPlaca(valueChanges: Observable<any>) {
    valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((val) => this.loadPlacas(val)),
    ).subscribe((response: any) => {
      this.dependencias = response.queryOptions[0].Id ? response.queryOptions : [];
    });
  }

  public getDetalleElemento(index: number) {
    this.bajasHelper.getDetalleElemento(this.formBaja.controls.elementos.value[index].placa.Id).subscribe(res => {
      const consSalida = JSON.parse(res.Salida.Detalle).consecutivo;
      const consEntrada = JSON.parse(res.Salida.MovimientoPadreId.Detalle).consecutivo;
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ id: res.Id });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ nombre: res.Nombre });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ marca: res.Marca });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ subgrupo: res.SubgrupoCatalogoId.SubgrupoId.Nombre });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ tipoBien: res.SubgrupoCatalogoId.TipoBienId.Nombre });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ sede: res.Ubicacion.Sede.Nombre });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ dependencia: res.Ubicacion.Dependencia.Nombre });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ ubicacion: res.Ubicacion.Ubicacion.EspacioFisicoId.Nombre });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ funcionario: res.Funcionario.Tercero.NombreCompleto });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ entrada: consSalida });
      (this.formBaja.get('elementos') as FormArray).at(index).patchValue({ salida: consEntrada });
    });
  }

  private submitForm(statusChanges: Observable<any>) {
    statusChanges
      .debounceTime(250)
      .subscribe(() => {
        this.valid.emit(this.formBaja.valid);
        if (this.formBaja.valid && this.load) {
          this.bajaInfoChange.emit(this.formBaja);
        }
      });
  }

  public muestraDependencia(field) {
    return field ? field.Placa : '';
  }

  private loadPlacas(text: string) {
    const queryOptions$ = text.length > 3 ?
      this.bajasHelper.getElementos(text) :
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
