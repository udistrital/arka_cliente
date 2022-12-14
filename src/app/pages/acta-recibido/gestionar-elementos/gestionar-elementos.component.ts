import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { DatosLocales } from './datos_locales';
import { ElementoActa } from '../../../@core/data/models/acta_recibido/elemento';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { ListService } from '../../../@core/store/services/list.service';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { ParametrosHelper } from '../../../helpers/parametros/parametrosHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { GestorDocumentalService } from '../../../helpers/gestor_documental/gestorDocumentalHelper';

const SIZE_SOPORTE = 1;

@Component({
  selector: 'ngx-gestionar-elementos',
  templateUrl: './gestionar-elementos.component.html',
  styleUrls: ['./gestionar-elementos.component.scss'],
})
export class GestionarElementosComponent implements OnInit {
  formElementos: FormGroup;
  form: FormGroup;
  Totales: DatosLocales;

  @ViewChild('paginator', {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild('fileInput', {static: true}) fileInput: ElementRef;
  dataSource: MatTableDataSource<any>;

  @Input() ActaRecibidoId: number;
  @Input() Modo: string = 'agregar' || 'verificar' || 'ver' || 'ajustar';
  @Input() ajustes: any[];
  @Input() placa: boolean;
  @Output() DatosEnviados = new EventEmitter();
  @Output() DatosTotales = new EventEmitter();
  @Output() ElementosValidos = new EventEmitter<boolean>();

  unidades: any;
  Tarifas_Iva: any;
  displayedColumns: any[];
  checkTodos: boolean = false;
  checkParcial: boolean = false;
  mostrarClase: boolean;
  ErroresCarga: string = '';
  cargando: boolean = true;
  file: any;
  submitted: boolean = true;
  sizeSoporte: number;
  cce: string = 'https://colombiacompra.gov.co/clasificador-de-bienes-y-servicios';
  tiposBien: any[];
  tiposBienFiltrados: any[];

  private checkAnterior: number = undefined;
  private estadoShift: boolean = false;
  private basePaginas: number = 0;
  clases: any;
  UVT: number;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private confService: ConfiguracionService,
    private catalogoHelper: CatalogoElementosHelper,
    private parametrosHelper: ParametrosHelper,
    private pUpManager: PopUpManager,
    private documento: GestorDocumentalService,
  ) {
    this.Totales = new DatosLocales();
    this.sizeSoporte = SIZE_SOPORTE;
  }

  ngOnInit() {
    this.listService.findListsActa();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.createForm();
    this.ReglasColumnas();
    this.initForms();
    this.builForm();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.shiftKey) {
      this.estadoShift = true;
    }
  }
  @HostListener('window:keyup', ['$event'])
  handleKeyUp() {
    this.estadoShift = false;
  }

  private async initForms() {
    const uvt = await this.loadUVT();
    if (!uvt) {
      this.pUpManager.showErrorAlert('No se pudo consultar el valor del UVT. Intente más tarde o contacte soporte');
      return;
    }

    await this.loadTiposBienHijos();
    await Promise.all([this.loadLists(), this.loadElementos()]);
    this.submitForm(this.formElementos.get('elementos').valueChanges);
    if (this.ajustes) {
      this.fillForm(this.ajustes);
    } else {
      this.emit();
    }
  }

  private builForm() {
    this.dataSource = new MatTableDataSource([]);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.formElementos = this.fb.group({
      archivo: ['', Validators.required],
      masivo: this.masivo,
      elementos: this.fb.array([]),
    });
  }

  private fillForm(elementos: ElementoActa[]) {
    elementos.forEach((element, idx) => {
      (this.formElementos.get('elementos') as FormArray).push(this.fillElemento(element));
      this.dataSource.data = this.dataSource.data.concat({});
      if (idx === elementos.length - 1) {
        this.cargando = false;
      }
    });
  }

  private fillElemento(el: ElementoActa) {
    const disabled = this.Modo === 'verificar' || this.Modo === 'ver';
    const min = el.Descuento > 0 && el.Descuento > el.ValorUnitario;
    const placa = !el.SubgrupoCatalogoId ? false :
      this.checkPlacaSubgrupoTipoBien(el.SubgrupoCatalogoId.TipoBienId.Id,
        el.TipoBienId && el.TipoBienId.Id ? el.TipoBienId.Id : 0, el.ValorUnitario);

    const formEl = this.fb.group({
      Id: [el.Id],
      Seleccionado: [
        {
          value: false,
          disabled: this.Modo === 'ver',
        },
      ],
      Placa: [
        {
          value: el.Placa,
          disabled: true,
        },
      ],
      Nombre: [
        {
          value: el.Nombre,
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      Cantidad: [
        {
          value: el.Cantidad,
          disabled: disabled,
        },
        {
          validators: [Validators.required, Validators.min(1)].concat(placa ? Validators.max(1) : []),
        },
      ],
      Marca: [
        {
          value: el.Marca,
          disabled,
        },
      ],
      Serie: [
        {
          value: el.Serie,
          disabled,
        },
      ],
      UnidadMedida: [
        {
          value: el.UnidadMedida,
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      ValorUnitario: [
        {
          value: el.ValorUnitario,
          disabled,
        },
        {
          validators: [Validators.required, Validators.min(0.01)],
        },
      ],
      Descuento: [
        {
          value: el.Descuento,
          disabled,
        },
        {
          validators: [Validators.min(min ? el.Descuento + 1 : 0.00)],
        },
      ],
      Subtotal: [
        {
          value: el.Subtotal,
          disabled: true,
        },
      ],
      PorcentajeIvaId: [
        {
          value: el.PorcentajeIvaId !== null ? el.PorcentajeIvaId : '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      ValorIva: [
        {
          value: el.ValorIva,
          disabled: true,
        },
      ],
      ValorTotal: [
        {
          value: el.ValorTotal,
          disabled: true,
        },
      ],
      SubgrupoCatalogoId: [
        {
          value: el.SubgrupoCatalogoId,
          disabled: disabled || !this.mostrarClase,
        },
        {
          validators: [Validators.required, this.validarTipoBien('Id')],
        },
      ],
      TipoBienId: [
        {
          value: el.TipoBienId ? el.TipoBienId : '',
          disabled,
        },
        {
          validators: [this.validarTipoBien('Id')],
        },
      ],
      ValorResidual: [
        {
          value: el.ValorResidual * 1000 / (el.ValorTotal * 10),
          disabled: disabled ? disabled : el.SubgrupoCatalogoId ? !el.SubgrupoCatalogoId.Amortizacion && !el.SubgrupoCatalogoId.Depreciacion : true,
        },
        {
          validators: this.Modo === 'ajustar' ? [Validators.required, Validators.min(0), Validators.max(100.01)] : [],
        },
      ],
      VidaUtil: [
        {
          value: el.VidaUtil,
          disabled: disabled ? disabled : el.SubgrupoCatalogoId ? !el.SubgrupoCatalogoId.Amortizacion && !el.SubgrupoCatalogoId.Depreciacion : true,
        },
        {
          validators: this.Modo === 'ajustar' ? [Validators.required, Validators.min(0), Validators.max(100)] : [],
        },
      ],
    });

    this.cambiosClase(formEl.get('SubgrupoCatalogoId'));
    this.cambiosTipoBien(formEl.get('TipoBienId'));

    this.cambiosValores(formEl.get('SubgrupoCatalogoId'));
    this.cambiosValores(formEl.get('TipoBienId'));
    this.cambiosValores(formEl.get('Cantidad'));
    this.cambiosValores(formEl.get('ValorUnitario'));
    this.cambiosValores(formEl.get('Descuento'));
    this.cambiosValores(formEl.get('PorcentajeIvaId'));

    this.touchForm(formEl);

    return formEl;
  }

  private touchForm(form: FormGroup) {
    form.get('SubgrupoCatalogoId').markAsTouched();
    form.get('TipoBienId').markAsTouched();
    form.get('Nombre').markAsTouched();
    form.get('Cantidad').markAsTouched();
    form.get('UnidadMedida').markAsTouched();
    form.get('ValorUnitario').markAsTouched();
    form.get('Descuento').markAsTouched();
    form.get('PorcentajeIvaId').markAsTouched();
  }

  private checkPlacaSubgrupo(tipoBienPadre: number, valorUnitario: number): boolean {
    const placa = this.tiposBien.filter(tb => tb.TipoBienPadreId.Id === tipoBienPadre)
      .find(tb_ => tb_.LimiteInferior <= (valorUnitario / this.UVT) && valorUnitario / this.UVT < tb_.LimiteSuperior);
    return placa && placa.NecesitaPlaca;
  }

  private checkPlacaSubgrupoTipoBien(tipoBienPadre: number, tipoBienHijo: number, valorUnitario: number): boolean {
    if (!tipoBienHijo) {
      return this.checkPlacaSubgrupo(tipoBienPadre, valorUnitario);
    } else {
      const placa = this.tiposBien.filter(tb => tb.Id === tipoBienHijo && tb.NecesitaPlaca)
        .find(tb_ => tb_.LimiteInferior <= (valorUnitario / this.UVT) && valorUnitario / this.UVT < tb_.LimiteSuperior);
      return placa && placa.NecesitaPlaca;
    }
  }

  // Event emission
  private emit() {
    this.ElementosValidos.emit(this.Modo === 'verificar' ? this.checkTodos : this.formElementos.get('elementos').valid);
    this.DatosEnviados.emit(this.elementos_);
    this.getTotales();
  }

  private submitForm(statusChanges: Observable<any>) {
    statusChanges
      .pipe(debounceTime(250))
      .subscribe(() => {
        this.emit();
      });
  }

  get elementos_() {
    return this.elementosF_
      .map(el => ({
        Id: el.get('Id').value,
        Nombre: el.get('Nombre').value,
        Cantidad: el.get('Cantidad').value,
        Marca: el.get('Marca').value,
        Serie: el.get('Serie').value,
        UnidadMedida: el.get('UnidadMedida').value,
        ValorUnitario: el.get('ValorUnitario').value,
        Subtotal: el.get('Subtotal').value,
        Descuento: el.get('Descuento').value,
        ValorTotal: el.get('ValorTotal').value,
        PorcentajeIvaId: el.get('PorcentajeIvaId').value,
        ValorIva: el.get('ValorIva').value,
        TipoBienId: el.get('TipoBienId').value,
        SubgrupoCatalogoId: el.get('SubgrupoCatalogoId').value,
        Placa: el.get('Placa').value,
        ValorResidual: el.get('ValorResidual').value,
        VidaUtil: el.get('VidaUtil').value,
      }));
  }

  get elementosF_() {
    if (this.Modo === 'ajustar') {
      return (this.formElementos.get('elementos') as FormArray).controls
        .filter(el_ => el_.dirty);
    } else {
      return (this.formElementos.get('elementos') as FormArray).controls;
    }
  }

  // Totales
  private getTotales() {
    this.Totales.Subtotal = this.getTotales_('Subtotal');
    this.Totales.ValorIva = this.getTotales_('ValorIva');
    this.Totales.ValorTotal = this.getTotales_('ValorTotal');
    this.DatosTotales.emit(this.Totales);
  }

  private getIva(tarifa: number, subtotal: number) {
    const iva = tarifa * subtotal / 100;
    return iva > 0 ? iva : 0;
  }

  private getSubtotal(cant: number, unit: number, dsc: number) {
    const subtotal = cant * (unit - dsc);
    return subtotal > 0 ? subtotal : 0;
  }

  private getTotal(subt: number, iva: number) {
    const total = subt + iva;
    return total > 0 ? total : 0;
  }

  private getTotales_(control: string) {
    const total = (this.formElementos.get('elementos') as FormArray).controls
      .map((elem) => (elem = elem.get(control).value))
      .reduce((acc, value) => (acc + value), 0);
    return total;
  }

  // Tabla
  private ReglasColumnas() {
    this.mostrarClase = !!this.confService.getAccion('mostrarAsignacionCatalogo');
    const cols = ['Acciones'];
    if (this.mostrarClase) {
      cols.push('SubgrupoCatalogoId', 'TipoBienId');
    }
    if (this.placa) {
      cols.push('Placa');
    }
    cols.push('Nombre', 'Cantidad', 'Marca', 'Serie', 'UnidadMedida', 'ValorUnitario',
      'Descuento', 'Subtotal', 'PorcentajeIvaId', 'ValorIva', 'ValorTotal');
    if (this.Modo === 'ajustar' || this.ajustes) {
      cols.push('ValorResidual', 'VidaUtil');
    }
    this.displayedColumns = cols;
  }

  getActualIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  cambioPagina(eventoPagina) {
    this.basePaginas = eventoPagina.pageIndex * eventoPagina.pageSize;
  }

  // Completers
  private filtroTipoBien(nombre): any[] {
    if (this.tiposBien && nombre.length > 1) {
      return this.tiposBien.filter(contr => this.muestraTipoBien(contr).toLowerCase().includes(nombre.toLowerCase()));
    } else {
      return [];
    }
  }

  public muestraClase(clase): string {
    return clase && clase.SubgrupoId && clase.SubgrupoId.Id ? (clase.SubgrupoId.Codigo + ' - ' + clase.SubgrupoId.Nombre) : '';
  }

  public muestraTipoBien(tb): string {
    return tb && tb.Id ? tb.Nombre : '';
  }

  private cambiosClase(control: AbstractControl) {
    control.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((val: any) => this.loadClases(val)),
      ).subscribe((response: any) => {
        this.clases = response.queryOptions.length && response.queryOptions[0].SubgrupoId ? response.queryOptions : [];
      });
  }

  private cambiosTipoBien(control: AbstractControl) {
    control.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        map(val => typeof val === 'string' ? val : this.muestraTipoBien(val)),
      ).subscribe((response: any) => {
        this.tiposBienFiltrados = this.filtroTipoBien(response);
      });
  }

  // Validators
  private setCantidad(control: any, placa: boolean) {
    if (placa) {
      control.get('Cantidad').setValidators([Validators.required, Validators.min(1), Validators.max(1)]);
      control.get('Cantidad').updateValueAndValidity();
    } else {
      control.get('Cantidad').setValidators([Validators.required, Validators.min(1)]);
      control.get('Cantidad').updateValueAndValidity();
    }
  }

  private cambiosValores(control: AbstractControl) {
    control.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
      ).subscribe(() => {

        const control_ = control.parent;
        const cant = control_.get('Cantidad').value;
        const unit = control_.get('ValorUnitario').value;
        const dsc = control_.get('Descuento').value;
        const iva = control_.get('PorcentajeIvaId').value;

        const subt = this.getSubtotal(cant, unit, dsc);
        const vIva = this.getIva(subt, iva);
        const total = this.getTotal(subt, vIva);

        control_.get('Subtotal').patchValue(subt);
        control_.get('ValorIva').patchValue(vIva);
        control_.get('ValorTotal').patchValue(total);

        if (dsc > 0 && dsc > unit) {
          control_.get('Descuento').setErrors({ errMin: true });
        } else {
          control_.get('Descuento').clearValidators();
          control_.get('Descuento').updateValueAndValidity();
        }

        const clase = control_.get('SubgrupoCatalogoId');
        const tipoBien = control_.get('TipoBienId');
        if (clase.value && clase.value.TipoBienId && tipoBien.valid) {
          this.setCantidad(control.parent,
            this.checkPlacaSubgrupoTipoBien(clase.value.TipoBienId.Id, tipoBien.value && tipoBien.value.Id ? tipoBien.value.Id : 0, unit));
        }

      });
  }

  private validarTipoBien(key: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      if (control.parent && !control.hasError('required')) {
        const valor = control.value;
        const checkMinLength = valor && valor.length < 4;
        const checkInvalidObject = valor && (!valor[key] || valor.length >= 4);

        if (checkMinLength) {
          return { errMinLength: true };
        } else if (checkInvalidObject) {
          return { errSelected: true };
        } else {
          const tb = control.parent.get('TipoBienId');
          const sg = control.parent.get('SubgrupoCatalogoId');
          if ((sg.value && sg.value.TipoBienId &&
            !this.tiposBien.find(tb_ => (tb_.TipoBienPadreId.Id === sg.value.TipoBienId.Id && tb_.LimiteInferior))) ||
            (tb.valid && tb.value && sg.value && sg.value.TipoBienId.Id !== tb.value.TipoBienPadreId.Id)) {
            return { errorTipoBien: true };
          }
        }
      }
    };
  }

  // Consultas
  private loadUVT(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (this.Modo === 'agregar' || this.Modo === 'ajustar') {
        const payload = 'limit=1&sortby=Id&order=desc&query=Activo:true,ParametroId__CodigoAbreviacion:UVT,'
          + 'PeriodoId__Nombre:' + new Date().getFullYear() + '&fields=Valor';
        this.parametrosHelper.getAllParametroPeriodo(payload).subscribe(res => {
          if (res.Data && res.Data.length && res.Data[0].Valor) {
            this.UVT = JSON.parse(res.Data[0].Valor).Valor;
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  private loadElementos(): Promise<void> {
    return new Promise<void>(resolve => {
      if (!this.ActaRecibidoId) {
        this.cargando = false;
        resolve();
      } else if (this.Modo !== 'ajustar') {
        this.actaRecibidoHelper.getElementosActa(this.ActaRecibidoId).toPromise().then(res => {
          if (res && res.length) {
            this.fillForm(res);
            if (!this.cargando) {
              resolve();
            }
          } else {
            this.cargando = false;
            resolve();
          }
        });
      } else {
        this.actaRecibidoHelper.getElementosActaMov(this.ActaRecibidoId).toPromise().then(res => {
          if (res && res.length) {
            this.fillForm(res);
            if (!this.cargando) {
              resolve();
            }
          } else {
            this.cargando = false;
            resolve();
          }
        });
      }
    });
  }

  private loadTiposBienHijos(): Promise<void> {
    return new Promise<void>(resolve => {
      const query = 'limit=-1&query=Activo:true,TipoBienPadreId__isnull:false,TipoBienPadreId__Activo:true'
        + '&fields=Id,Nombre,TipoBienPadreId,LimiteInferior,LimiteSuperior,NecesitaPlaca';
      this.catalogoHelper.getAllTiposBien(query).subscribe(res => {
        resolve();
        this.tiposBien = res;
      });
    });
  }

  private loadClases(text: string) {
    const queryOptions$ = text.length > 3 ?
      this.catalogoHelper.getAllDetalleSubgrupo('limit=-1&fields=Id,SubgrupoId,TipoBienId&compuesto=' + text) :
      new Observable((obs) => { obs.next([{}]); });
    return combineLatest([queryOptions$]).pipe(
      map(([queryOptions_$]) => ({
        queryOptions: queryOptions_$,
      })),
    );
  }

  private loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe(list => {
        if (list.listUnidades && list.listUnidades.length && list.listIVA && list.listIVA.length) {
          this.unidades = list.listUnidades[0];
          this.Tarifas_Iva = list.listIVA[0];
          resolve();
        }
      });
    });
  }

  // Acciones macro
  public setClase() {
    const clase = this.formElementos.get('masivo.clase').value;
    this.selected.forEach((idx) => {
      const control = (this.formElementos.get('elementos') as FormArray).at(idx);
      control.patchValue(
        {
          SubgrupoCatalogoId: clase,
        },
      );
      control.get('TipoBienId').updateValueAndValidity();
    });
  }

  public setTipoBien() {
    const tb = this.formElementos.get('masivo.tipoBien').value;
    this.selected.forEach((idx) => {
      const control = (this.formElementos.get('elementos') as FormArray).at(idx);
      control.patchValue(
        {
          TipoBienId: tb,
        },
      );
      control.get('SubgrupoCatalogoId').updateValueAndValidity();
    });
  }

  addElemento() {
    const data = new ElementoActa;

    data.Cantidad = 0;
    data.Nombre = '';
    data.Descuento = 0;
    data.Marca = '';
    data.Serie = '';
    data.Subtotal = 0;
    data.UnidadMedida = 13;
    data.ValorIva = 0;
    data.ValorTotal = 0;
    data.ValorUnitario = 0;

    (this.formElementos.get('elementos') as FormArray).push(this.fillElemento(data));
    this.dataSource.data = this.dataSource.data.concat({});
  }

  get selected() {
    const idxs = (this.formElementos.get('elementos') as FormArray).controls
      .reduce(function (acc, curr, index) {
        if (curr.get('Seleccionado').value) {
          acc.push(index);
        }
        return acc;
      }, []);

    return idxs;
  }

  borraSeleccionados() {
    if (this.selected.length) {
      this.pUpManager.showAlertWithOptions(this.optionsDeleteElementos(this.selected.length))
        .then((result) => {
          if (result.value) {
            this._deleteElemento(null, true);
          }
        });
    }
  }

  deleteElemento(index: number) {
    this.pUpManager.showAlertWithOptions(this.optionsDeleteElemento)
      .then((result) => {
        if (result.value) {
          this._deleteElemento(index, false);
        }
      });
  }

  private _deleteElemento(index: number, selected: boolean) {

    if (index >= 0 && !selected) {
      (this.formElementos.get('elementos') as FormArray).removeAt(index);
      const data = this.dataSource.data;
      data.splice(index, 1);
      this.dataSource.data = data;
    } else {
      this.selected.reverse().forEach((idx) => {
        (this.formElementos.get('elementos') as FormArray).removeAt(idx);
        const data = this.dataSource.data;
        data.splice(idx, 1);
        this.dataSource.data = data;
      });
    }

  }

  refrescaCheckTotal() {

    if ((this.formElementos.get('elementos') as FormArray).controls
      .every((el) => (el.get('Seleccionado').value))) {
      this.checkTodos = true;
      this.checkParcial = false;
    } else if ((this.formElementos.get('elementos') as FormArray).controls
      .some((el) => (el.get('Seleccionado').value))) {
      this.checkTodos = false;
      this.checkParcial = true;
    } else {
      this.checkTodos = false;
      this.checkParcial = false;
    }

  }

  public cambioCheckTodos() {
    if (!this.checkTodos) {
      (this.formElementos.get('elementos') as FormArray).controls
        .filter((el) => (!el.get('Seleccionado').value))
        .forEach((el) => {
          el.patchValue(
            {
              Seleccionado: true,
            },
          );
        });
      this.checkTodos = true;
      this.checkParcial = false;
      this.enableGlobal(true);
    } else {
      (this.formElementos.get('elementos') as FormArray).controls
        .filter((el) => (el.get('Seleccionado').value))
        .forEach((el) => {
          el.patchValue(
            {
              Seleccionado: false,
            },
          );
        });
      this.checkTodos = false;
      this.checkParcial = false;
      this.enableGlobal(false);
    }

    this.checkAnterior = undefined;
  }

  setCasilla(fila: number, checked: any) {
    this.enableGlobal(checked.checked);
    fila += this.basePaginas;
    if (this.estadoShift && this.checkAnterior !== undefined) { // Shift presionado
      const menor = Math.min(this.checkAnterior, fila);
      const mayor = Math.max(this.checkAnterior, fila);
      this.setRange(menor, mayor);
    } else { // Shift suelto
      if (checked.checked) {
        this.checkAnterior = fila;
      } else {
        if (fila === this.checkAnterior)
          this.checkAnterior = undefined;
      }
    }
    this.refrescaCheckTotal();
  }

  private enableGlobal(value) {
    if (value) {
      this.formElementos.get('masivo').enable();
    } else if (!this.selected.length) {
      this.formElementos.get('masivo').disable();
    }
  }

  private setRange(menor: number, mayor: number) {
    (this.formElementos.get('elementos') as FormArray).controls
      .filter((_, idx) => (idx >= menor && idx <= mayor))
      .forEach((el) => {
        el.patchValue(
          {
            Seleccionado: true,
          },
        );
      });
  }

  get masivo(): FormGroup {
    const form = this.fb.group({
      clase: [
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
    });

    this.cambiosClase(form.get('clase'));
    this.cambiosTipoBien(form.get('tipoBien'));
    return form;
  }

  // Carga masiva
  createForm() {
    this.form = this.fb.group({
      archivo: ['', Validators.required],
    });
  }

  TraerPlantilla() {
    const filesToGet = [{ Id: 147296 }];
    this.documento.get_(filesToGet);
  }

  public onFileChange(event) {
    if (event.target.files.length > 0) {
      this.submitted = false;
      const nombre = event.target.files[0].name;
      const extension = nombre.split('.').pop();
      const file = event.target.files[0];
      if (extension === 'xlsx') {
        if (file.size < this.sizeSoporte * 1024000) {
          this.formElementos.get('archivo').setValue(file);
        } else {
          this.pUpManager.showAlertWithOptions(this.optionsFileChange);
        }
      }
    }
  }

  private prepareSave(): any {
    const input = new FormData();
    input.append('archivo', this.formElementos.get('archivo').value);
    return input;
  }

  readThis(): void {

    this.cargando = true;
    const formModel: FormData = this.prepareSave();
    (this.formElementos.get('elementos') as FormArray).controls = [];
    this.dataSource.data = [];
    this.actaRecibidoHelper.postArchivo(formModel).subscribe((res: any) => {
      if (res !== null) {
        if (res.Mensaje) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.Errores.' + res.Mensaje));
          this.clearFile();
        } else {
          this.fillForm(res.Elementos);
          this.formElementos.get('archivo').reset();
          this.submitted = true;
          const validacion = this.validarCargaMasiva(res.Elementos);
          if (validacion.valid) {
            this.pUpManager.showAlertWithOptions(this.optionsCargaMasivaOk);
            this.ErroresCarga = validacion.cont_err.toString();
          } else {
            this.pUpManager.showAlertWithOptions(this.optionsCargaMasivaErr(validacion.cont_err));
            this.ErroresCarga = '';
          }
          this.clearFile();
        }

      } else {
        this.pUpManager.showAlertWithOptions(this.optionsNoCargaMasiva);
        this.clearFile();
      }
      this.cargando = false;
    });
  }

  validarCargaMasiva(elementos: any[]): { valid: boolean, cont_err: number } {
    let valido = true;
    let conteo = 0;

    for (const elemento of elementos) {
      let errorfila = '';
      if (!this.Tarifas_Iva.some((tarifa) => +tarifa.Tarifa === elemento.PorcentajeIvaId)) {
        valido = false;
        conteo++;
      }
      if (!this.unidades.some((unidad) => +unidad.Id === elemento.UnidadMedida)) {
        valido = false;
        conteo++;
        errorfila = errorfila + 'UnidadMedida,';
      }
      if (!elemento.Nombre) {
        valido = false;
        conteo++;
        errorfila = errorfila + 'Nombre,';
      }
      if (!elemento.Marca) {
        valido = false;
        conteo++;
      }
      if (!elemento.Serie) {
        valido = false;
        conteo++;
      }
      if (!elemento.Cantidad) {
        valido = false;
        conteo++;
      }
    }
    return { valid: valido, cont_err: conteo };
  }

  clearFile() {
    this.formElementos.get('archivo').setValue('');
  }

  onSubmitCargaMasiva() {
    const cargar = () => {
      this.checkAnterior = undefined;
      this.basePaginas = 0;
      this.readThis();
    };
    if (this.dataSource.data.length) {
      this.pUpManager.showAlertWithOptions(this.optionsPreCargaMasiva(this.dataSource.data.length))
        .then(res => {
          if (res.value) {
            cargar();
          }
        });
    } else {
      cargar();
    }
  }

  // Alerts
  get optionsFileChange() {
    return {
      title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_title'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_placeholder'),
      type: 'warning',
    };
  }

  private optionsErrPlantilla(mensaje) {
    return {
      type: 'success',
      title: this.translate.instant('GLOBAL.error'),
      text: this.translate.instant('GLOBAL.Errores.' + mensaje),
    };
  }

  get optionsCargaMasivaOk() {
    return {
      type: 'success',
      title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTitleOK'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTextOK'),
    };
  }

  private optionsCargaMasivaErr(num) {
    return {
      type: 'warning',
      title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ValidacionCargaMasivaTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ValidacionCargaMasivaText', { cantidad: num }),
    };
  }

  private optionsPreCargaMasiva(CANT) {
    return {
      title: this.translate.instant('GLOBAL.Advertencia'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.AvisoSobreescritura', { CANT }),
      type: 'warning',
      showCancelButton: true,
    };
  }

  private optionsDeleteElementos(cantidad) {
    return {
      title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarVariosElementosTitle', { cantidad }),
      text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarVariosElementosText', { cantidad }),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    };
  }

  get optionsDeleteElemento() {
    return {
      title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarElementosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarElementosText'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    };
  }

  get optionsNoCargaMasiva() {
    return {
      type: 'error',
      title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTitleNO'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTextNO'),
    };
  }

}
