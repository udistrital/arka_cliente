import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { DatosLocales } from './datos_locales';
import { ElementoActa } from '../../../@core/data/models/acta_recibido/elemento';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { ListService } from '../../../@core/store/services/list.service';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Detalle } from '../../../@core/data/models/catalogo/detalle';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ParametrosGobierno } from '../../../@core/data/models/parametros_gobierno/parametros_gobierno';

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

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
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

  private checkAnterior: number = undefined;
  private estadoShift: boolean = false;
  private basePaginas: number = 0;
  clases: any;
  clasesFiltradas: any[];

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private confService: ConfiguracionService,
  ) {
    this.Totales = new DatosLocales();
    this.sizeSoporte = SIZE_SOPORTE;
  }

  ngOnInit() {
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
    this.listService.findClases();
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
    await this.loadElementos();
    await this.loadLists();
    this.submitForm(this.formElementos.get('elementos').valueChanges);
    if (this.ajustes) {
      this.cuentasMov(this.ajustes);
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
      clase: this.clase,
      elementos: this.fb.array([]),
    });
  }

  private cuentasMov(elementos: ElementoActa[]) {
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
    const placa = el.SubgrupoCatalogoId.TipoBienId.Id && el.SubgrupoCatalogoId.TipoBienId.NecesitaPlaca;
    const min = el.Descuento > 0 && el.Descuento > el.ValorUnitario;
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
          disabled: disabled || (placa && el.Cantidad === 1),
        },
        {
          validators: placa ? [Validators.required, Validators.min(1), Validators.max(1)] : [Validators.required, Validators.min(1)],
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
          validators: [Validators.min( min ? el.Descuento + 1 : 0.00)],
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
          validators: [Validators.required, this.validarCompleter('Id')],
        },
      ],
      TipoBienId: [
        {
          value: el.SubgrupoCatalogoId.TipoBienId.Nombre,
          disabled: true,
        },
      ],
      ValorResidual: [
        {
          value: el.ValorResidual * 100 / el.ValorTotal,
          disabled: (!el.SubgrupoCatalogoId.Amortizacion && !el.SubgrupoCatalogoId.Depreciacion) || disabled,
        },
        {
          validators: this.Modo === 'ajustar' ? [Validators.required, Validators.min(0), Validators.max(100.01)] : [],
        },
      ],
      VidaUtil: [
        {
          value: el.VidaUtil,
          disabled: (!el.SubgrupoCatalogoId.Amortizacion && !el.SubgrupoCatalogoId.Depreciacion) || disabled,
        },
        {
          validators: this.Modo === 'ajustar' ? [Validators.required, Validators.min(0), Validators.max(100)] : [],
        },
      ],
    });

    this.cambiosClase(formEl.get('SubgrupoCatalogoId'));
    this.cambiosValores(formEl.get('Cantidad'));
    this.cambiosValores(formEl.get('ValorUnitario'));
    this.cambiosValores(formEl.get('Descuento'));
    this.cambiosValores(formEl.get('PorcentajeIvaId'));
    this.setValidation(formEl);

    return formEl;
  }

  private setValidation(form: FormGroup) {
    form.get('SubgrupoCatalogoId').markAsTouched();
    form.get('Nombre').markAsTouched();
    form.get('Cantidad').markAsTouched();
    form.get('UnidadMedida').markAsTouched();
    form.get('ValorUnitario').markAsTouched();
    form.get('Descuento').markAsTouched();
    form.get('PorcentajeIvaId').markAsTouched();
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

  public fillClase(index) {
    const clase = (this.formElementos.get('elementos') as FormArray).at(index).get('SubgrupoCatalogoId').value;
    (this.formElementos.get('elementos') as FormArray).at(index).patchValue({ TipoBienId: clase.TipoBienId.Nombre });
    this.setCantidad(index, clase.TipoBienId.NecesitaPlaca);
  }

  private setCantidad(index: number, placa: boolean) {
    if (placa) {
      (this.formElementos.get('elementos') as FormArray).at(index).patchValue({ Cantidad: 1 });
      (this.formElementos.get('elementos') as FormArray).at(index).get('Cantidad').disable();
      (this.formElementos.get('elementos') as FormArray).at(index).get('Cantidad')
        .setValidators([Validators.required, Validators.min(1), Validators.max(1)]);
    } else {
      (this.formElementos.get('elementos') as FormArray).at(index).get('Cantidad').enable();
      (this.formElementos.get('elementos') as FormArray).at(index).get('Cantidad').setValidators([Validators.required, Validators.min(1)]);
      (this.formElementos.get('elementos') as FormArray).at(index).get('Cantidad').updateValueAndValidity();
    }
  }

  private cambiosClase(control: AbstractControl) {
    control.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        distinctUntilChanged(),
        map(val => typeof val === 'string' ? val : this.muestraClase(val)),
      ).subscribe((response: any) => {
        this.clasesFiltradas = this.filtroCuentas(response);
      });
  }

  private cambiosValores(control: AbstractControl) {
    control.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
      ).subscribe(() => {

        const cant = control.parent.get('Cantidad').value;
        const unit = control.parent.get('ValorUnitario').value;
        const dsc = control.parent.get('Descuento').value;
        const iva = control.parent.get('PorcentajeIvaId').value;

        const subt = this.getSubtotal(cant, unit, dsc);
        const vIva = this.getIva(subt, iva);
        const total = this.getTotal(subt, vIva);

        control.parent.get('Subtotal').patchValue(subt);
        control.parent.get('ValorIva').patchValue(vIva);
        control.parent.get('ValorTotal').patchValue(total);

        if (dsc > 0 && dsc > unit) {
          control.parent.get('Descuento').setErrors({ errMin: true });
        } else {
          control.parent.get('Descuento').clearValidators();
          control.parent.get('Descuento').updateValueAndValidity();
        }
      });
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

  private filtroCuentas(nombre): any[] {
    if (this.clases && nombre.length > 3) {
      return this.clases.filter(contr => this.muestraClase(contr).toLowerCase().includes(nombre.toLowerCase()));
    } else {
      return [];
    }
  }

  public muestraClase(clase): string {
    return clase && clase.SubgrupoId.Id ? clase.SubgrupoId.Codigo + ' - ' + clase.SubgrupoId.Nombre : '';
  }

  private loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe(list => {
        this.unidades = list.listUnidades[0],
          this.Tarifas_Iva = list.listIVA[0],
          this.clases = list.listClases[0],

          (this.unidades && this.unidades.length > 0 &&
            this.Tarifas_Iva && this.Tarifas_Iva.length > 0 &&
            this.clases && this.clases.length > 0) ? resolve() : null;
      });
    });
  }

  getActualIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  private loadElementos(): Promise<void> {
    return new Promise<void>(resolve => {
      if (!this.ActaRecibidoId) {
        resolve();
      } else if (this.Modo !== 'ajustar') {
        this.actaRecibidoHelper.getElementosActa(this.ActaRecibidoId).toPromise().then(res => {
          if (res && res.length) {
            this.cuentasMov(res);
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
            this.cuentasMov(res);
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

  public setClase() {
    const clase = this.formElementos.get('clase.clase').value;
    this.selected.forEach((idx) => {
      (this.formElementos.get('elementos') as FormArray).at(idx).patchValue(
        {
          SubgrupoCatalogoId: clase,
          TipoBienId: clase.TipoBienId.Nombre,
        },
        {
          emitEvent: false,
        },
      );
      this.setCantidad(idx, clase.TipoBienId.NecesitaPlaca);
    });

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

  public onBlurClase(index: number) {
    const clase = (this.formElementos.get('elementos') as FormArray).at(index).get('SubgrupoCatalogoId').value;
    if (!clase.SubgrupoId) {
      (this.formElementos.get('elementos') as FormArray).at(index).patchValue({ TipoBienId: '' });
    }
  }

  TraerPlantilla() {
    NuxeoService.nuxeo.header('X-NXDocumentProperties', '*');

    // NuxeoService.nuxeo.request('/id/8e4d5b47-ba37-41dd-b549-4efc1777fef2') // PLANTILLA VIEJA
    NuxeoService.nuxeo.request('/id/76e0956e-1cbe-45d7-993c-1839fbbf2cfc') // Plantilla nueva
      .get()
      .then(function (response) {
        // console.log(response)
        response.fetchBlob()
          .then(function (blob) {
            // console.log(blob)
            blob.blob()
              .then(function (responseblob: Blob) {
                // console.log(responseblob)
                const url = window.URL.createObjectURL(responseblob);
                const plantilla = document.createElement('a');
                document.body.appendChild(plantilla);
                plantilla.href = url;
                plantilla.download = 'plantilla.xlsx';
                plantilla.click();
              });
          })
          .catch(function (response2) {
          });
      })
      .catch(function (response) {
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createForm() {
    this.form = this.fb.group({
      archivo: ['', Validators.required],
    });
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
          (Swal as any).fire({
            title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_title'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_placeholder'),
            type: 'warning',
          });
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
        if (res.Mensaje !== undefined) {
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.error'),
            text: this.translate.instant('GLOBAL.Errores.' + res.Mensaje),
          });
          this.clearFile();
        } else {
          this.cuentasMov(res.Elementos);
          this.formElementos.get('archivo').reset();
          this.submitted = true;
          const validacion = this.validarCargaMasiva(res.Elementos);
          if (validacion.valid) {
            (Swal as any).fire({
              type: 'success',
              title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTitleOK'),
              text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTextOK'),
            });
            this.ErroresCarga = validacion.cont_err.toString();
          } else {
            (Swal as any).fire({
              type: 'warning',
              title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ValidacionCargaMasivaTitle'),
              text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ValidacionCargaMasivaText', { cantidad: validacion.cont_err }),
            });
            this.ErroresCarga = '';
          }
          this.clearFile();
        }

      } else {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTitleNO'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTextNO'),
        });
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

  onSubmit() {
    const cargar = () => {
      this.checkAnterior = undefined;
      this.basePaginas = 0;
      this.readThis();
    };
    if (this.dataSource.data.length) {
      (Swal as any).fire({
        title: this.translate.instant('GLOBAL.Advertencia'),
        text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.AvisoSobreescritura', { CANT: this.dataSource.data.length }),
        type: 'warning',
        showCancelButton: true,
      }).then(res => {
        if (res.value) {
          cargar();
        }
      });
    } else {
      cargar();
    }
  }

  private emit() {
    this.ElementosValidos.emit(this.Modo === 'verificar' ? this.checkTodos : this.formElementos.get('elementos').valid);
    this.DatosEnviados.emit(this.elementos_);
    this.getTotales();
  }

  private getTotales() {
    this.Totales.Subtotal = this.getTotales_('Subtotal');
    this.Totales.ValorIva = this.getTotales_('ValorIva');
    this.Totales.ValorTotal = this.getTotales_('ValorTotal');
    this.DatosTotales.emit(this.Totales);
  }

  private getTotales_(control: string) {
    const total = (this.formElementos.get('elementos') as FormArray).controls
      .map((elem) => (elem = elem.get(control).value))
      .reduce((acc, value) => (acc + value), 0);
    return total;
  }

  addElemento() {
    const subgrupo = new Detalle;
    const data = new ElementoActa;
    subgrupo.SubgrupoId = <Subgrupo>{ Id: 0 };
    subgrupo.TipoBienId = new TipoBien;

    data.Cantidad = 0;
    data.Nombre = '';
    data.Descuento = 0;
    data.Marca = '';
    data.Serie = '';
    data.SubgrupoCatalogoId = subgrupo;
    data.Subtotal = 0;
    data.UnidadMedida = 13;
    data.ValorIva = 0;
    data.ValorTotal = 0;
    data.ValorUnitario = 0;

    (this.formElementos.get('elementos') as FormArray).push(this.fillElemento(data));
    this.dataSource.data = this.dataSource.data.concat({});
  }

  borraSeleccionados() {
    if (this.selected.length) {
      (Swal as any).fire({
        title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarVariosElementosTitle', { cantidad: this.selected.length }),
        text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarVariosElementosText', { cantidad: this.selected.length }),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.value) {
          this._deleteElemento(null, true);
        }
      });
    }
  }

  deleteElemento(index: number) {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarElementosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarElementosText'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
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
      this.formElementos.get('clase.clase').enable();
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
      this.formElementos.get('clase.clase').disable();
    }

    this.checkAnterior = undefined;
  }

  cambioPagina(eventoPagina) {
    this.basePaginas = eventoPagina.pageIndex * eventoPagina.pageSize;
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
      this.formElementos.get('clase.clase').enable();
    } else if (!this.selected.length) {
      this.formElementos.get('clase.clase').disable();
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

  get clase(): FormGroup {
    const form = this.fb.group({
      clase: [
        {
          value: '',
          disabled: true,
        },
      ],
    });

    this.cambiosClase(form.get('clase'));
    return form;
  }

  private validarCompleter(key: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkMinLength = typeof (valor) === 'string' && valor.length && valor.length < 4;
      const checkInvalidTercero = (valor && typeof (valor) === 'object' && valor.SubgrupoId && valor.SubgrupoId[key] === 0) ||
        (typeof (valor) === 'string' && valor.length >= 4);
      return checkMinLength ? { errMinLength: true } : checkInvalidTercero ? { errSelected: true } : null;
    };
  }

}
