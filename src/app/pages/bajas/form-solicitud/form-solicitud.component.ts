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
import { UserService } from '../../../@core/data/users.service';
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
  @Input() modoCrud: string = '';
  @Input() bajaInfo: any;
  @Output() bajaInfoChange: EventEmitter<any> = new EventEmitter<any>();
  displayedColumns: string[];
  displayedColumnsRevision: string[];
  displayedColumnsSeleccion: string[];

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
    private userService: UserService,
    private store: Store<IAppState>,
    private listService: ListService,
  ) {
    this.bajaId = 0;
    this.sizeSoporte = SIZE_SOPORTE;
    this.displayedColumns = ['acciones', 'placa', 'nombre', 'subgrupo', 'tipoBien', 'entrada', 'salida',
      'funcionario', 'marca', 'sede', 'dependencia', 'ubicacion'];
    this.displayedColumnsRevision = ['placa', 'nombre', 'subgrupo', 'tipoBien', 'entrada', 'salida',
      'funcionario', 'marca', 'sede', 'dependencia', 'ubicacion'];
    this.displayedColumnsSeleccion = ['seleccion', 'placa', 'nombre', 'marca', 'serie', 'valor'];
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  ngOnInit() {
    this.buildForm();
    this.loadFuncionarios();
    this.syncRevisorLogueado();
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
    const form = this.fb.group({
      id: [0],
      placa: [''],
      nombre: [''],
      subgrupo: [''],
      tipoBien: [''],
      entrada: [''],
      salida: [''],
      funcionario: [''],
      marca: [''],
      sede: [''],
      dependencia: [''],
      ubicacion: [''],
      serie: [''],
      valor: [''],
    });
    return form;
  }

  get funcionario(): FormGroup {
    const disabled = this.modo !== 'create';
    const validators = disabled ? [] : [Validators.required, this.validarTercero()];
    const form = this.fb.group({
      tercero: [
        {
          value: '',
          disabled,
        },
        validators,
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
    const soporte = this.buildSoporteControlValue(values.soporte);
    const revisorActual = this.getUsuarioLogueado();
    const revisorFuente = this.modo === 'get' && revisorActual ? revisorActual : values.revisor;
    const revisor = {
      id: revisorFuente ? revisorFuente.Tercero.Id : 0,
      info: revisorFuente ? this.getCompuesto(revisorFuente) : '',
    };
    const funcionario = values.funcionario ? values.funcionario : '';
    this.formBaja.get('funcionario').patchValue({ tercero: funcionario });
    this.formBaja.get('info').patchValue({
      soporte,
      tipoBaja: this.getTipoBajaId(values.tipoBaja),
      revisor,
    });

    if (values.elementos && values.elementos.length) {
      values.elementos.forEach(element => {
        (this.formBaja.get('elementos') as FormArray).push(this.createElementoForm(element));
      });
      if (this.modo === 'get') {
        this.syncElementosDataSource();
      }
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

  getActualIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  public onFuncionarioSeleccionado() {
    const funcionarioId = this.getFuncionarioId();
    if (funcionarioId) {
      this.loadInventarioByFuncionario(funcionarioId);
    }
  }

  private createElementoForm(element: any): FormGroup {
    const salida = element && element.Historial && element.Historial.Salida ? element.Historial.Salida : null;
    const movimientoPadre = salida && salida.MovimientoPadreId ? salida.MovimientoPadreId : null;
    const subgrupo = element && element.SubgrupoCatalogoId && element.SubgrupoCatalogoId.SubgrupoId ?
      element.SubgrupoCatalogoId.SubgrupoId : null;
    const tipoBien = element && element.SubgrupoCatalogoId && element.SubgrupoCatalogoId.TipoBienId ?
      element.SubgrupoCatalogoId.TipoBienId : null;
    return this.fb.group({
      id: element ? element.Id : 0,
      placa: element || '',
      nombre: element ? element.Nombre : '',
      marca: element ? element.Marca : '',
      subgrupo: subgrupo ? subgrupo.Codigo + ' - ' + subgrupo.Nombre : '',
      tipoBien: tipoBien ? tipoBien.Nombre : '',
      sede: this.getNombreCampoUbicacion(element ? element.Ubicacion : null, 'Sede'),
      dependencia: this.getNombreCampoUbicacion(element ? element.Ubicacion : null, 'Dependencia'),
      ubicacion: this.centroCostosHelper.muestraCentroCosto(element ? element.Ubicacion : null),
      funcionario: element && element.Funcionario ? this.getCompuesto(element.Funcionario) : '',
      entrada: movimientoPadre ? movimientoPadre.Consecutivo : '',
      salida: salida ? salida.Consecutivo : '',
      serie: element ? element.Serie || '' : '',
      valor: element ? element.Valor || '' : '',
    });
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

  private syncRevisorLogueado() {
    this.userService.getUser().subscribe((user: any) => {
      if (this.modo === 'get' && user && user.Tercero && this.formBaja) {
        this.formBaja.get('info.revisor').patchValue({
          id: user.Tercero.Id,
          info: this.getCompuesto(user),
        });
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
        if (res && res.Elementos && res.Elementos.length) {
          this.elementos = this.mergeSelectedIntoInventario(res.Elementos);
          this.dataSource.data = this.elementos;
        } else {
          this.elementos = [];
          this.dataSource.data = [];
          if (resetSeleccion) {
            this.resetElementosSeleccionados();
          }
          if (showNoElementosError) {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registrar.noElementos'));
          }
        }
      },
      error: () => {
        this.spinner = '';
        this.elementos = [];
        this.dataSource.data = [];
        if (resetSeleccion) {
          this.resetElementosSeleccionados();
        }
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

  private syncElementosDataSource() {
    if (this.modo === 'get') {
      const elementos = this.formBaja.get('elementos') as FormArray;
      this.dataSource.data = elementos.controls.map((control: FormGroup) => control.getRawValue());
    } else {
      this.dataSource.data = this.elementos;
    }
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

  private getUsuarioLogueado(): any {
    return this.userService.user || null;
  }

  private getTipoBajaId(tipoBaja: any): any {
    if (!tipoBaja) {
      return '';
    }

    if (typeof tipoBaja === 'number') {
      return tipoBaja;
    }

    if (typeof tipoBaja === 'string') {
      const tipoEncontrado = Array.isArray(this.tiposBaja) ?
        this.tiposBaja.find((tipo) => tipo.Nombre === tipoBaja) : null;
      return tipoEncontrado ? tipoEncontrado.Id : '';
    }

    if (tipoBaja.Id) {
      return tipoBaja.Id;
    }

    if (tipoBaja.Nombre && Array.isArray(this.tiposBaja)) {
      const tipoEncontrado = this.tiposBaja.find((tipo) => tipo.Nombre === tipoBaja.Nombre);
      return tipoEncontrado ? tipoEncontrado.Id : '';
    }

    return '';
  }

  private getSoporteId(soporte: any): number {
    if (!soporte) {
      return 0;
    }

    if (Array.isArray(soporte)) {
      return soporte.length ? this.getSoporteId(soporte[0]) : 0;
    }

    if (typeof soporte === 'number') {
      return soporte;
    }

    if (typeof soporte === 'string') {
      const parsed = Number(soporte);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    if (soporte.SoporteMovimientoId) {
      return this.getSoporteId(soporte.SoporteMovimientoId);
    }

    if (soporte.DocumentoId) {
      return soporte.DocumentoId;
    }

    return soporte.Id || 0;
  }

  private buildSoporteControlValue(soporte: any): any {
    if (Array.isArray(soporte)) {
      return this.buildSoporteControlValue(soporte.length ? soporte[0] : null);
    }

    const soporteId = this.getSoporteId(soporte);
    if (!soporteId) {
      return '';
    }

    if (typeof soporte === 'object') {
      return {
        ...soporte,
        Id: soporteId,
      };
    }

    return { Id: soporteId };
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
      const duplicados = !noFilas && control.value.map(el => el.id)
        .some((element, index) => {
          return control.value.map(el => el.id).indexOf(element) !== index;
        });

      return noFilas ? { errorNoElementos: true } : duplicados ? { errorDuplicados: true } : null;
    };
  }

  public isElementoSeleccionado(element: any): boolean {
    const elementos = this.formBaja.get('elementos') as FormArray;
    return elementos.controls.some((control: FormGroup) => control.get('id').value === element.Id);
  }

  public toggleElemento(element: any, checked: boolean) {
    const elementos = this.formBaja.get('elementos') as FormArray;
    const index = elementos.controls.findIndex((control: FormGroup) => control.get('id').value === element.Id);

    if (checked && index < 0) {
      elementos.push(this.createElementoForm(element));
    }

    if (!checked && index >= 0) {
      elementos.removeAt(index);
    }

    this.valid.emit(this.formBaja.valid);
    this.bajaInfoChange.emit(this.formBaja);
  }

  public toggleElementosPagina(checked: boolean) {
    this.getElementosPaginaActual().forEach((element) => this.toggleElemento(element, checked));
  }

  public todosSeleccionadosPagina(): boolean {
    const pagina = this.getElementosPaginaActual();
    return pagina.length > 0 && pagina.every((element) => this.isElementoSeleccionado(element));
  }

  public seleccionParcialPagina(): boolean {
    const pagina = this.getElementosPaginaActual();
    return pagina.some((element) => this.isElementoSeleccionado(element)) && !this.todosSeleccionadosPagina();
  }

  private getElementosPaginaActual(): any[] {
    if (!this.paginator) {
      return this.dataSource.data || [];
    }

    const data = this.dataSource.data || [];
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice(start, start + this.paginator.pageSize);
  }

  private mergeSelectedIntoInventario(inventario: any[]): any[] {
    const seleccionados = (this.formBaja.get('elementos') as FormArray).controls
      .map((control: FormGroup) => control.getRawValue().placa)
      .filter((element) => element && element.Id);
    const faltantes = seleccionados.filter((element) => !inventario.some((item) => item.Id === element.Id));
    return faltantes.length ? inventario.concat(faltantes) : inventario;
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

  get ocultarSoporteEnRevisionAlmacen(): boolean {
    return this.modoCrud === 'revisar';
  }

  get mostrarTipoBajaComoTexto(): boolean {
    return this.modoCrud === 'revisar';
  }

  get tipoBajaLabel(): string {
    const tipoBaja = this.bajaInfo && this.bajaInfo.tipoBaja;
    if (tipoBaja && tipoBaja.Nombre) {
      return tipoBaja.Nombre;
    }

    const tipoBajaId = this.formBaja && this.formBaja.get('info.tipoBaja').value;
    if (!tipoBajaId || !Array.isArray(this.tiposBaja)) {
      return '';
    }

    const encontrado = this.tiposBaja.find((tipo) => tipo.Id === tipoBajaId);
    return encontrado ? encontrado.Nombre : '';
  }

  get puedeContinuarInfo(): boolean {
    return this.modoCrud === 'revisar' || !this.formBaja.get('info').invalid;
  }

  get esRevisionSinStepper(): boolean {
    return this.modoCrud === 'revisar';
  }

}
