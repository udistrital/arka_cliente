import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { BajasHelper } from '../../../helpers/bajas/bajasHelper';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { FormatoTipoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PopUpManager } from '../../../managers/popUpManager';
import { TrasladosHelper } from '../../../helpers/movimientos/trasladosHelper';
import { isObject } from 'util';
import { GestorDocumentalService } from '../../../helpers/gestor_documental/gestorDocumentalHelper';
import { CentroCostosHelper } from '../../../helpers/movimientos/centroCostosHelper';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { TerceroCriterioContratista } from '../../../@core/data/models/terceros_criterio';

const SIZE_SOPORTE = 5;

@Component({
  selector: 'ngx-form-solicitud',
  templateUrl: './form-solicitud.component.html',
  styleUrls: ['./form-solicitud.component.scss'],
})
export class FormSolicitudComponent implements OnInit {
  elementos = [];
  elementosFiltrados: any[];
  funcionariosFiltrados: Observable<Partial<TerceroCriterioContratista>[]>;
  formBaja: FormGroup;
  ubicacionesFiltradas: any = [];
  dataSource: MatTableDataSource<any>;
  tiposBaja: FormatoTipoMovimiento[];
  sizeSoporte: number;
  private funcionarios: TerceroCriterioContratista[];
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  spinner: string = '';
  bajaId: number;
  trContable: any;
  @Output() valid = new EventEmitter<boolean>();
  @Input() modo: string = 'create' || 'get' || 'update';
  @Input() bajaInfo: any;
  @Output() bajaInfoChange: EventEmitter<any> = new EventEmitter<any>();
  displayedColumns: string[];

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private bajasHelper: BajasHelper,
    private movimientosHelper: MovimientosHelper,
    private sanitization: DomSanitizer,
    private pUpManager: PopUpManager,
    private trasladosHelper: TrasladosHelper,
    private documento: GestorDocumentalService,
    private centroCostosHelper: CentroCostosHelper,
    private store: Store<IAppState>,
    private listService: ListService,
  ) {
    this.bajaId = 0;
    this.sizeSoporte = SIZE_SOPORTE;
    this.displayedColumns = ['acciones', 'placa', 'nombre', 'subgrupo', 'tipoBien', 'entrada', 'salida',
      'funcionario', 'marca', 'sede', 'dependencia', 'ubicacion'];
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  ngOnInit() {
    this.buildForm();
    this.loadFuncionarios();
    this.init();
  }

  private async init() {
    this.spinner = 'Cargando formulario';
    const data = [this.getTiposBaja()];
    await Promise.all(data);
    if (this.modo !== 'create') {
      this.loadValues(this.bajaInfo);
    }
    this.spinner = '';
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

  get elemento(): FormGroup {
    const disabled = this.modo === 'get';
    const form = this.fb.group({
      id: [0],
      placa: [
        {
          value: '',
          disabled,
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

  get funcionario(): FormGroup {
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
    });

    if (!disabled) {
      this.funcionariosFiltrados = this.cambiosFuncionario(form.get('tercero'));
    }

    return form;
  }

  get info(): FormGroup {
    const disabled = this.modo === 'get';
    const form = this.fb.group({
      revisor: this.fb.group({
        info: [
          {
            value: '',
            disabled,
          },
        ],
        id: [0],
      }),
      fechaRevision: [''],
      fechaAprobacion: [''],
      tipoBaja: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      soporte: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
    });
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

  get resolucion(): FormGroup {
    const form = this.fb.group({
      fecha: [
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
      numero: [
        {
          value: '',
          disabled: true,
        },
      ],
    });
    return form;
  }

  private buildForm(): void {
    this.formBaja = this.fb.group({
      rechazo: this.rechazo,
      funcionario: this.funcionario,
      info: this.info,
      elementos: this.fb.array([], { validators: this.validateElementos() }),
      observaciones: this.observaciones,
      resolucion: this.resolucion,
    });
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.submitForm(this.formBaja.statusChanges);
  }

  private loadValues(values: any) {
    if (values.trContable) {
      this.trContable = values.trContable;
    }
    const disabled = this.modo === 'get';
    const razon = values.rechazo ? values.rechazo : '';
    const dependencia = values.dependencia ? values.dependencia : '';
    const numero = values.numero ? values.numero : '';
    const fecha = values.fechaRevisionC ? values.fechaRevisionC : '';
    this.formBaja.get('rechazo').patchValue({ razon });
    this.formBaja.get('resolucion').patchValue({ numero });
    this.formBaja.get('resolucion').patchValue({ dependencia });
    this.formBaja.get('resolucion').patchValue({ fecha });
    const soporte = { Id: values.soporte };
    const revisor = {
      id: values.revisor ? values.revisor.Tercero.Id : 0,
      info: values.revisor ? this.getCompuesto(values.revisor) : '',
    };
    const funcionario = values.funcionario ? values.funcionario : '';
    this.formBaja.get('funcionario').patchValue({ tercero: funcionario });
    this.formBaja.get('info').patchValue({
      soporte,
      tipoBaja: values.tipoBaja.Id,
      revisor,
    });

    if (values.elementos && values.elementos.length) {
      values.elementos.forEach(element => {
        const consSalida = element.Historial.Salida.Consecutivo;
        const consEntrada = element.Historial.Salida.MovimientoPadreId.Consecutivo;
        const formEl = this.fb.group({
          id: [element.Id],
          placa: [
            {
              value: element,
              disabled,
            },
          ],
          nombre: [
            {
              value: element.Nombre,
              disabled: true,
            },
          ],
          subgrupo: [
            {
              value: element.SubgrupoCatalogoId.SubgrupoId.Codigo + ' - ' + element.SubgrupoCatalogoId.SubgrupoId.Nombre,
              disabled: true,
            },
          ],
          tipoBien: [
            {
              value: element.SubgrupoCatalogoId.TipoBienId.Nombre,
              disabled: true,
            },
          ],
          entrada: [
            {
              value: consEntrada,
              disabled: true,
            },
          ],
          salida: [
            {
              value: consSalida,
              disabled: true,
            },
          ],
          funcionario: [
            {
              value: this.getCompuesto(element.Funcionario),
              disabled: true,
            },
          ],
          sede: [
            {
              value: this.getNombreCampoUbicacion(element.Ubicacion, 'Sede'),
              disabled: true,
            },
          ],
          dependencia: [
            {
              value: this.getNombreCampoUbicacion(element.Ubicacion, 'Dependencia'),
              disabled: true,
            },
          ],
          ubicacion: [
            {
              value: this.centroCostosHelper.muestraCentroCosto(element.Ubicacion),
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
        });
        this.cambiosPlaca(formEl.get('placa').valueChanges);
        (this.formBaja.get('elementos') as FormArray).push(formEl);
        this.dataSource.data = this.dataSource.data.concat(formEl.value);
      });
    }

    const observaciones = values.observaciones;
    this.formBaja.get('observaciones').patchValue({ observaciones });
    this.spinner = '';

    if (this.modo !== 'get') {
      const funcionarioId = this.getFuncionarioId();
      if (funcionarioId) {
        this.loadInventarioByFuncionario(funcionarioId, false, false);
      }
    }
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
      debounceTime(250),
      distinctUntilChanged(),
      map(val => typeof val === 'string' ? val : this.muestraPlaca(val)),
    ).subscribe((response: any) => {
      this.elementosFiltrados = this.filtroPlaca(response);
    });
  }

  private filtroPlaca(nombre: string): any[] {
    if (this.elementos.length && nombre.length > 0) {
      return this.elementos.filter(el => el.Placa.includes(nombre));
    } else {
      return this.elementos;
    }
  }

  public getDetalleElemento(index: number) {
    const value = this.formBaja.controls.elementos.value[index].placa.Id;
    this.spinner = 'Consultando detalle del elemento';
    this.bajasHelper.getDetalleElemento(value).subscribe(res => {
      this.spinner = '';
      const salidaOk = res.Historial && res.Historial.Salida.EstadoMovimientoId.Nombre === 'Salida Aprobada';
      const noTraslado = res.Historial &&
        (!res.Historial.Traslados || res.Historial.Traslados[0].EstadoMovimientoId.Nombre === 'Traslado Aprobado');
      const noBaja = res.Historial && !res.Historial.Baja;
      const assignable = res.Id && salidaOk && noTraslado && noBaja;
      if (assignable) {
        const consSalida = res.Historial.Salida.Consecutivo;
        const consEntrada = res.Historial.Salida.MovimientoPadreId.Consecutivo;
        (this.formBaja.get('elementos') as FormArray).at(index).patchValue({
          id: res.Id,
          nombre: res.Nombre,
          marca: res.Marca,
          subgrupo: res.SubgrupoCatalogoId.SubgrupoId.Codigo + ' - ' + res.SubgrupoCatalogoId.SubgrupoId.Nombre,
          tipoBien: res.SubgrupoCatalogoId.TipoBienId.Nombre,
          sede: this.getNombreCampoUbicacion(res.Ubicacion, 'Sede'),
          dependencia: this.getNombreCampoUbicacion(res.Ubicacion, 'Dependencia'),
          ubicacion: this.centroCostosHelper.muestraCentroCosto(res.Ubicacion),
          funcionario: this.getCompuesto(res.Funcionario),
          entrada: consEntrada,
          salida: consSalida,
        });
      } else if (!res.Id || !salidaOk) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.errorPlaca'));
      } else if (!noTraslado) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.errorTr'));
      } else if (!noBaja) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.errorBj'));
      }
    });
  }

  public onFuncionarioSeleccionado() {
    const funcionarioId = this.getFuncionarioId();
    if (funcionarioId) {
      this.loadInventarioByFuncionario(funcionarioId);
    }
  }

  private getCompuesto(tercero: any): string {
    const terceroCompuesto = (tercero.Identificacion ?
      (tercero.Identificacion.Numero + ' - ') : '') + tercero.Tercero.NombreCompleto;
    return terceroCompuesto;
  }

  public muestraFuncionario(contr: TerceroCriterioContratista): string {
    if (contr && contr.Identificacion && contr.Tercero) {
      return contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    } else if (contr && contr.Tercero) {
      return contr.Tercero.NombreCompleto;
    }
    return '';
  }

  private getNombreCampoUbicacion(ubicacion: any, campo: 'Sede' | 'Dependencia'): string {
    if (!ubicacion) {
      return '';
    }

    const valor = ubicacion[campo];
    if (valor && typeof valor === 'object') {
      return valor.Nombre || '';
    }

    if (typeof valor === 'string') {
      return valor;
    }

    const normalizado = this.centroCostosHelper.normalizarCentroCosto(ubicacion);
    return normalizado && normalizado[campo] ? normalizado[campo] : '';
  }

  private submitForm(statusChanges: Observable<any>) {
    statusChanges
      .pipe(debounceTime(250))
      .subscribe(() => {
        this.valid.emit(this.formBaja.valid);
        if (this.formBaja.valid) {
          this.bajaInfoChange.emit(this.formBaja);
        }
      });
  }

  private loadFuncionarios() {
    this.listService.findFuncionarios();
    this.store.select((state) => state).subscribe((list) => {
      if (list.listFuncionarios && list.listFuncionarios.length && list.listFuncionarios[0]) {
        this.funcionarios = list.listFuncionarios[0];
      }
    });
  }

  private getTiposBaja() {
    return new Promise<void>(resolve => {
      const query = 'limit=-1&query=CodigoAbreviacion__istartswith:BJ_';
      this.movimientosHelper.getAllFormatoMovimiento(query).subscribe((res: any) => {
        this.tiposBaja = res;
        resolve();
      });
    });
  }

  private getFuncionarioId(): number {
    const funcionario = this.formBaja.get('funcionario.tercero').value;
    if (funcionario && funcionario.Tercero && funcionario.Tercero.Id) {
      return funcionario.Tercero.Id;
    }
    return 0;
  }

  private loadInventarioByFuncionario(terceroId: number, resetSeleccion: boolean = true, showNoElementosError: boolean = true) {
    this.spinner = 'Consultando inventario del funcionario';
    this.trasladosHelper.getInventarioTerceroById(terceroId).subscribe({
      next: (res: any) => {
        this.spinner = '';
        if (resetSeleccion) {
          this.resetElementosSeleccionados();
        }

        if (res && res.Elementos && res.Elementos.length) {
          this.elementos = res.Elementos;
          this.elementosFiltrados = res.Elementos;
        } else {
          this.elementos = [];
          this.elementosFiltrados = [];
          if (showNoElementosError) {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registrar.noElementos'));
          }
        }
      },
      error: () => {
        this.spinner = '';
        if (resetSeleccion) {
          this.resetElementosSeleccionados();
        }
        this.elementos = [];
        this.elementosFiltrados = [];
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.consulta.errorElementos'));
      },
    });
  }

  private resetElementosSeleccionados() {
    const elementos = this.formBaja.get('elementos') as FormArray;
    while (elementos.length > 0) {
      elementos.removeAt(0);
    }
    this.dataSource.data = [];
  }

  public muestraPlaca(field): string {
    return field && field.Placa ? field.Placa : '';
  }

  public muestraDependencia(field) {
    return field ? field.Placa : '';
  }

  onInputFileDocumento(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {

        if (file.size < this.sizeSoporte * 1024000) {
          file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
          file.url = this.cleanURL(file.urlTemp);
          file.file = event.target.files[0];
          this.formBaja.get('info.soporte').setValue(file);
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.ErrorSizeSoporteText',
            { SIZE: this.sizeSoporte }));
        }
      } else {
        this.pUpManager.showErrorAlert('error' + this.translate.instant('GLOBAL.error'));
      }
    }
  }

  private downloadFile(id_documento: any) {
    const filesToGet = [{
      Id: id_documento,
    }];

    this.documento.get(filesToGet).subscribe((data: any) => {
      if (data && data.length && data[0].url) {
        window.open(data[0].url);
      }
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

  private filtroFuncionarios(nombre: string): TerceroCriterioContratista[] {
    if (nombre.length >= 4 && Array.isArray(this.funcionarios)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.funcionarios.filter((contr) => this.muestraFuncionario(contr).toLowerCase().includes(valorFiltrado));
    }
    return [];
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  clearFile() {
    this.formBaja.get('info.soporte').setValue('');
  }

  download() {
    const file = this.formBaja.get('info.soporte').value;
    if (file.Id) {
      this.downloadFile(file.Id);
    } else {
      const new_tab = window.open(file.urlTemp, file.urlTemp, '_blank');
      new_tab.onload = () => {
        new_tab.location = file.urlTemp;
      };
      new_tab.focus();
    }
  }

  private validateElementos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const noFilas = !control.value.length;
      const noSeleccionado = !noFilas && !control.value.every(el => el.placa ? isObject(el.placa) : el.id);
      const duplicados = !noSeleccionado && control.value.map(el => el.id)
        .some((element, index) => {
          return control.value.map(el => el.id).indexOf(element) !== index;
        });

      return (noFilas || noSeleccionado) ? { errorNoElementos: true } : duplicados ? { errorDuplicados: true } : null;
    };
  }

  private validarTercero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '';
      const checkInvalidString = typeof (valor) === 'string' && valor !== '';
      const checkInvalidTercero = typeof (valor) === 'object' && valor && !valor.Tercero;
      return checkStringLength ? { errorLongitudMinima: true } :
        ((checkInvalidString || checkInvalidTercero) ? { terceroNoValido: true } : null);
    };
  }

}
