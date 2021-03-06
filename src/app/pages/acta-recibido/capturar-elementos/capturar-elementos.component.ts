import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import * as XLSX from 'xlsx';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { DatosLocales, DatosLocales2 } from './datos_locales';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';
import { Impuesto } from '../../../@core/data/models/acta_recibido/elemento';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { ListService } from '../../../@core/store/services/list.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { isNumeric } from 'rxjs/internal-compatibility';
import { isArray } from 'util';
import { MatCheckbox } from '@angular/material';
import { CompleterData, CompleterService, CompleterItem } from 'ng2-completer';
import { Observable } from 'rxjs';
import { Row } from 'ngx-smart-table/lib/data-set/row';
import { DatePipe } from '@angular/common';
import { RolUsuario_t as Rol, PermisoUsuario_t as Permiso } from '../../../@core/data/models/roles/rol_usuario';
import { UserService } from '../../../@core/data/users.service';

@Component({
  selector: 'ngx-capturar-elementos',
  templateUrl: './capturar-elementos.component.html',
  styleUrls: ['./capturar-elementos.component.scss'],
})
export class CapturarElementosComponent implements OnInit {
  ControlClases = new FormControl();
  filteredOptions: Observable<string[]>;
  fileString: string | ArrayBuffer;
  arrayBuffer: Iterable<number>;
  form: FormGroup;
  buffer: Uint8Array;
  Validador: boolean = false;
  Totales: DatosLocales;
  loading: boolean = false;
  protected dataService: CompleterData;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('checkTodoInput') checkDummy: MatCheckbox;
  dataSource: MatTableDataSource<any>;
  dataSource2: MatTableDataSource<any>;

  @Input() DatosRecibidos: any;
  @Output() DatosEnviados = new EventEmitter();
  @Output() DatosTotales = new EventEmitter();
  @Output() ElementosValidos = new EventEmitter<boolean>();

  private lists: IAppState;
  respuesta: any;
  Tipos_Bien: any;
  Unidades: any;
  Tarifas_Iva: any;
  nombreArchivo: any;
  Consumo: any;
  ConsumoControlado: any;
  Devolutivo: any;
  Clases: any;
  Codigo: any;
  displayedColumns: any[];
  checkTodos: boolean = false;
  checkParcial: boolean = false;
  ocultarAsignacionCatalogo: boolean;
  ErroresCarga: string = '';
  cargando: boolean = true;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private nuxeoService: NuxeoService,
    private confService: ConfiguracionService,
    private documentoService: DocumentoService,
    private catalogoHelper: CatalogoElementosHelper,
    private userService: UserService,
    private completerService: CompleterService,
  ) {
    this.Totales = new DatosLocales();
  }

  ngOnInit() {
    this.loadLists();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.createForm();
    this.ReglasColumnas();
  }

  public loadLists() {
    this.listService.findSubgruposConsumo();
    this.listService.findSubgruposConsumoControlado();
    this.listService.findSubgruposDevolutivo();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
    this.listService.findClases();

    this.store.select((state) => state).subscribe(
      (list) => {
        this.lists = list;
        this.muestraData();
      },
    );
  }

  private muestraData() {
    let clases;
    const todoCargado = (
      this.cargando && this.lists
      && Array.isArray(this.lists.listConsumo) && this.lists.listConsumo[0]
      && Array.isArray(this.lists.listConsumoControlado) && this.lists.listConsumoControlado[0]
      && Array.isArray(this.lists.listDevolutivo) && this.lists.listDevolutivo[0]
      && Array.isArray(this.lists.listTipoBien) && this.lists.listTipoBien[0]
      && Array.isArray(this.lists.listUnidades) && this.lists.listUnidades[0]
      && Array.isArray(this.lists.listIVA) && this.lists.listIVA[0]
      && Array.isArray(this.lists.listClases) && this.lists.listClases[0]
      && (() => {
        clases = this.lists.listClases[0];
        return Array.isArray(clases) && clases.length;
      })()
    );
    if (todoCargado) {
      this.Consumo = this.lists.listConsumo[0];
      this.ConsumoControlado = this.lists.listConsumoControlado[0];
      this.Devolutivo = this.lists.listDevolutivo[0];
      this.Tipos_Bien = this.lists.listTipoBien[0];
      this.Unidades = this.lists.listUnidades[0];
      this.Tarifas_Iva = this.lists.listIVA[0];

      this.Clases = clases.map(v => {
        v.mostrar = v.SubgrupoId.Codigo + ' - ' + v.SubgrupoId.Nombre;
        return v;
      });
      this.dataService = this.completerService.local(this.Clases, 'mostrar', 'mostrar');

      if (this.DatosRecibidos !== undefined) {
        this.dataSource = new MatTableDataSource(this.DatosRecibidos);
        this.respuesta = this.DatosRecibidos;
        this.getDescuentos();
        this.getSubtotales();
        this.getIVA();
        this.getTotales();
        this.getClasesElementos();
      } else {
        this.dataSource = new MatTableDataSource();
      }
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      for (let i = 0; i < this.dataSource.data.length; i++) {
        if (this.dataSource.data[i].CodigoSubgrupo === undefined) {
          this.dataSource.data[i].CodigoSubgrupo = '';
        }
      }

      this.ver();
      this.cargando = false;
    }
  }

  ReglasColumnas() {
    this.ocultarAsignacionCatalogo = !this.confService.getAccion('mostrarAsignacionCatalogo');
    if (this.ocultarAsignacionCatalogo) {
      this.displayedColumns = [
        'AccionesMacro',
        'Nombre',
        'Cantidad',
        'Marca',
        'Serie',
        'UnidadMedida',
        'ValorUnitario',
        'Subtotal',
        'Descuento',
        'PorcentajeIvaId',
        'ValorIva',
        'ValorTotal',
        'Acciones',
      ];
    } else {
      this.displayedColumns = [
        'AccionesMacro',
        'CodigoSubgrupo',
        'SubgrupoCatalogoId',
        'TipoBienId',
        'Nombre',
        'Cantidad',
        'Marca',
        'Serie',
        'UnidadMedida',
        'ValorUnitario',
        'Subtotal',
        'Descuento',
        'PorcentajeIvaId',
        'ValorIva',
        'ValorTotal',
        'Acciones',
      ];
    }
  }

  onSelectedClase(selected: CompleterItem, fila: number) {
    if (selected) {
    this.dataSource.data[fila].CodigoSubgrupo = selected.originalObject.SubgrupoId.Codigo;
    this.dataSource.data[fila].TipoBienId = selected.originalObject.TipoBienId.Id;
    this.dataSource.data[fila].SubgrupoCatalogoId = selected.originalObject.SubgrupoId.Id;
    this.dataSource.data[fila].TipoBienNombre = selected.originalObject.TipoBienId.Nombre;
    } else {
      this.dataSource.data[fila].CodigoSubgrupo = '';
      this.dataSource.data[fila].TipoBienId = '';
      this.dataSource.data[fila].SubgrupoCatalogoId = '';
      this.dataSource.data[fila].TipoBienNombre = '';
    }
  }

  onBlurClase(idx: number) {
    if (!this.dataSource.data[idx].NombreClase) {
      this.dataSource.data[idx].CodigoSubgrupo = '';
      this.dataSource.data[idx].TipoBienId = '';
      this.dataSource.data[idx].SubgrupoCatalogoId = '';
      this.dataSource.data[idx].TipoBienNombre = '';
    }
  }

  // TODO: De ser necesario, agregar otras validaciones asociadas
  // a cada elemento
  private validarElementos(): boolean {
    return (
      Array.isArray(this.dataSource.data)
      && this.dataSource.data.length // Al menos un elemento
      && this.dataSource.data.every(elem => (
          elem.hasOwnProperty('SubgrupoCatalogoId')
          && elem.SubgrupoCatalogoId
          && !isNaN(elem.SubgrupoCatalogoId)
      ))
    );
  }

  ver() {
    this.refrescaCheckTotal();
    // console.log(this.DatosEnviados)
    this.DatosEnviados.emit(this.dataSource.data);
    this.DatosTotales.emit(this.Totales);
    this.ElementosValidos.emit(this.validarElementos());
    // console.log(this.dataSource.data)
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
  onFileChange(event) {


    // console.log(event.target.files);
    const max_size = 1;

    let nombre = '';
    if (event.target.files.length > 0) {
      nombre = event.target.files[0].name;
      this.nombreArchivo = event.target.files[0].name;
      const extension = nombre.split('.').pop();
      const file = event.target.files[0];
      if (extension !== 'xlsx') {
        this.Validador = false;
      } else {
        if (file.size < max_size * 1024000) {
          this.form.get('archivo').setValue(file);
          this.Validador = true;
        } else {
          (Swal as any).fire({
            title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_title'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_placeholder'),
            type: 'warning',
          });
          this.Validador = false;
        }
        //  console.log(this.form)
      }

    } else {
      this.Validador = false;
    }
  }
  private prepareSave(): any {
    const input = new FormData();
    input.append('archivo', this.form.get('archivo').value);
    return input;
  }

  readThis(): void {

    this.cargando = true;
    const formModel: FormData = this.prepareSave();
    this.actaRecibidoHelper.postArchivo(formModel).subscribe(res => {
      if (res !== null) {
        if (res[0].Mensaje !== undefined) {
          (Swal as any).fire({
            type: 'success',
            title: res[0].Mensaje,
            text: res[0].Mensaje,
          });
          this.clearFile();
        } else {
          this.respuesta = res;
          this.dataSource.data = this.respuesta[0].Elementos;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          const validacion = this.validarCargaMasiva();
          if (validacion.valid) {
            (Swal as any).fire({
              type: 'success',
              title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTitleOK'),
              text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTextOK'),
            });
            this.ErroresCarga = validacion.errores[4];
          } else {
            (Swal as any).fire({
              type: 'warning',
              title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ValidacionCargaMasivaTitle'),
              text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ValidacionCargaMasivaText', {cantidad: validacion.cont_err}),
            });
            this.ErroresCarga = '';
          }
          this.clearFile();
          this.ver();
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

  validarCargaMasiva(): {valid: boolean, errores: any[], cont_err: number} {
    let valido = true;
    let conteo = 0;
    const error = [];
    const validar_iva = true;
    for (let i = 0; i < this.dataSource.data.length; i++) {
      let errorfila = '';
      if (this.dataSource.data[i].CodigoSubgrupo === undefined) {
        this.dataSource.data[i].CodigoSubgrupo = '';
        this.dataSource.data[i].TipoBienNombre = '';
        this.dataSource.data[i].NombreClase = '';
      }
      if ( this.Tarifas_Iva.some((tarifa) => +tarifa.Tarifa === +this.dataSource.data[i].PorcentajeIvaId) !== true) {
        this.dataSource.data[i].PorcentajeIvaId = this.Tarifas_Iva.find((x) => x.Nombre === '0% Excluido').Id;
        valido = false;
        conteo ++;
        errorfila = errorfila + i + 'PorcentajeIVA,';
      }
      if (this.Unidades.some((unidad) => unidad.Id.toString() === this.dataSource.data[i].UnidadMedida ) !== true) {
        this.dataSource.data[i].UnidadMedida = this.Unidades.find((x) => x.Unidad === 'UNIDAD').Id;
        valido = false;
        conteo ++;
        errorfila = errorfila + 'UnidadMedida,';
      }
      if (this.dataSource.data[i].Nombre === '') {
        this.dataSource.data[i].Nombre = 'N/A';
        valido = false;
        conteo ++;
        errorfila = errorfila + 'Nombre,';
      }
      if (this.dataSource.data[i].Marca === '') {
        this.dataSource.data[i].Marca = 'N/A';
        valido = false;
        conteo ++;
        errorfila = errorfila + 'Marca,';
      }
      if (this.dataSource.data[i].Serie === '') {
        this.dataSource.data[i].Serie = 'N/A';
        valido = false;
        conteo ++;
        errorfila = errorfila + 'Serie,';
      }
      if (this.dataSource.data[i].Cantidad === '') {
        this.dataSource.data[i].Cantidad = '1';
        valido = false;
        conteo ++;
        errorfila = errorfila + 'Cantidad,';
      }
      error[i] = errorfila;
    }
    return{ valid: valido, errores: error, cont_err: conteo };
  }

  clearFile() {
    this.Validador = true;
 //   this.form.get('archivo').setValue('');
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
        text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.AvisoSobreescritura', {CANT: this.dataSource.data.length}),
        type: 'warning',
        showCancelButton: true,
      }).then( res => {
        if (res.value) {
          cargar();
        }
      });
    } else {
      cargar();
    }
  }



  getDescuentos() {
    if (this.dataSource.data.length !== 0) {
      this.Totales.Descuento = this.dataSource.data.map(t => t.Descuento).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      const total = this.dataSource.data.map(t => t.Descuento).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      if (total >= 0.00) {
        return total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  getSubtotales() {
    if (this.dataSource.data.length !== 0) {
      this.Totales.Subtotal = this.dataSource.data.map(t => t.Subtotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      const total = this.dataSource.data.map(t => t.Subtotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      if (total >> 0.00) {
        return total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  getIVA() {
    if (this.dataSource.data.length !== 0) {
      this.Totales.ValorIva = this.dataSource.data.map(t => t.ValorIva).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      const total = this.dataSource.data.map(t => t.ValorIva).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      if (total >= 0.00) {
        return total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  getClasesElementos() {
    if (this.Clases && this.Clases.length) {
      this.dataSource.data.map((elemento) => {
        elemento.TipoBienNombre = elemento.TipoBienId !== 0 ? (() => {
          const criterio = x => x && x.Id === elemento.TipoBienId;
          if (this.Tipos_Bien.some(criterio)) {
            return this.Tipos_Bien.find(criterio).Nombre;
          }
          return '';
        })() : '';
        elemento.CodigoSubgrupo = elemento.TipoBienId !== 0 ? (() => {
          const criterio = x => x && x.SubgrupoId.Id === elemento.SubgrupoCatalogoId;
          if (this.Clases.some(criterio)) {
            return this.Clases.find(criterio).SubgrupoId.Codigo;
          }
          return '';
        })() : '';
        elemento.NombreClase = elemento.TipoBienId !== 0 ? (() => {
          const criterio = x => x.SubgrupoId.Id === elemento.SubgrupoCatalogoId;
          if (this.Clases.some(criterio)) {
            return this.Clases.find((x) => x.SubgrupoId.Id === elemento.SubgrupoCatalogoId).SubgrupoId.Nombre;
          }
          return '';
        })() : '';
      });
    }
  }

  getTotales() {
    if (this.dataSource.data.length !== 0) {
      this.Totales.ValorTotal = this.dataSource.data.map(t => t.ValorTotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      const total = this.dataSource.data.map(t => t.ValorTotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      if (total >= 0.00) {
        return total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  addElemento() {
    const data = this.dataSource.data;
    data.unshift({
      Cantidad: '1',
      Nombre: '',
      Descuento: '0',
      Marca: '',
      NivelInventariosId: '1',
      PorcentajeIvaId: '0',
      Serie: '',
      SubgrupoCatalogoId: '',
      CodigoSubgrupo: '',
      Subtotal: '0',
      TipoBienId: '',
      UnidadMedida: '2',
      ValorIva: '0',
      ValorTotal: '0',
      ValorUnitario: '0',
    },
    );
    this.respuesta = data;
    this.dataSource.data = data;
    this.ver();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // console.log(this.dataSource.data);
  }

  borraSeleccionados() {
    const seleccionados = this.getSeleccionados();
    if (seleccionados.length) {
      (Swal as any).fire({
        title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarVariosElementosTitle', { cantidad: seleccionados.length }),
        text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarVariosElementosText', { cantidad: seleccionados.length }),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.value) {
          this._deleteElemento(seleccionados);
          this.ver();
        }
      });
    }
  }

  aplicarClase() {
    const seleccionados = this.getSeleccionados();
    if (seleccionados.length) {
      (Swal as any).fire({
        title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarVariosElementosTitle', { cantidad: seleccionados.length }),
        text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.EliminarVariosElementosText', { cantidad: seleccionados.length }),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.value) {
          this._deleteElemento(seleccionados);
          this.ver();
        }
      });
    }
  }

  getSeleccionados() {
    return this.dataSource.data.map((elem, idx) => ({ 'idx_data': idx, elem }))
      .filter(elem => elem.elem.seleccionado)
      .map(elem => elem.idx_data);
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
        this._deleteElemento(index);
        this.ver();
      }
    });
  }

  private _deleteElemento(index: any) {
    // console.log({index});
    const indices = isNumeric(index) ? [index] : (isArray(index) ? index : undefined);
    if (indices) {
      const data = this.dataSource.data;
      indices.sort((a, b) => b - a);
      for (let i = 0; i < indices.length; i++) {
        data.splice((this.paginator.pageIndex * this.paginator.pageSize) + indices[i], 1);
      }
      this.dataSource.data = data;
    }
  }

  onClase(selected: CompleterItem) {
    const seleccionados = this.getSeleccionados();
    seleccionados.forEach((index) => {
      this.dataSource.data[index].CodigoSubgrupo = selected.originalObject.SubgrupoId.Codigo;
      this.dataSource.data[index].TipoBienId = selected.originalObject.TipoBienId.Id;
      this.dataSource.data[index].SubgrupoCatalogoId = selected.originalObject.SubgrupoId.Id;
      this.dataSource.data[index].TipoBienNombre = selected.originalObject.TipoBienId.Nombre;
      this.dataSource.data[index].NombreClase = selected.originalObject.SubgrupoId.Nombre;
      this.dataSource.data[index].seleccionado = false;
    });
    this.ver();
  }

  refrescaCheckTotal() {
    let checkTodos = false;
    let checkParcial = false;
    if (isArray(this.dataSource.data) && this.dataSource.data.length) {
      if (this.dataSource.data.every(elem => elem.seleccionado)) {
        // console.log('todos');
        checkTodos = true;
      } else if (this.dataSource.data.some(elem => elem.seleccionado)) {
        // console.log('algunos');
        checkParcial = true;
      } // "else" ninguno
    }
    this.checkTodos = checkTodos;
    this.checkParcial = checkParcial;
  }

  cambioCheckTodos(marcar: boolean) {
    this.dataSource.data.forEach(elem => {
      elem.seleccionado = marcar;
    });
    this.checkAnterior = undefined;
    this.refrescaCheckTotal();
  }

  cambioPagina(eventoPagina) {
    this.basePaginas = eventoPagina.pageIndex * eventoPagina.pageSize;
    // console.log({eventoPagina, 'base': this.basePaginas});
    this.checkDummy.focus();
  }

  private checkAnterior: number = undefined;
  private estadoShift: boolean = false;
  private basePaginas: number = 0;

  setCasilla(fila: number, checked: boolean) {
    fila += this.basePaginas;
    // console.log({fila, checked, 'shift': this.estadoShift, 'anterior': this.checkAnterior});
    if (this.estadoShift && this.checkAnterior !== undefined) { // Shift presionado
      const menor = Math.min(this.checkAnterior, fila);
      const mayor = Math.max(this.checkAnterior, fila);
      this.dataSource.data
        .map((elem, idx) => elem.seleccionado = (idx >= menor && idx <= mayor));
    } else { // Shift suelto
      if (checked) {
        this.checkAnterior = fila;
      } else {
        if (fila === this.checkAnterior)
          this.checkAnterior = undefined;
      }
    }
    this.refrescaCheckTotal();
  }

  keyDownTablaShift() {
    // console.log('shiftDown');
    this.refrescaCheckTotal();
    this.estadoShift = true;
  }
  keyUpTabla(evento: KeyboardEvent) {
    // console.log({'keyUpTabla': evento});
    this.estadoShift = evento.shiftKey;
    this.ver();
  }

  valortotal(subtotal: string, descuento: string, iva: string) {
    const total = (parseFloat(subtotal) - parseFloat(descuento) + parseFloat(iva));
    if (total >= 0.00) {
      return total;
    } else {
      return 0;
    }
  }
  valorXcantidad(valor_unitario: string, cantidad: string) {
    const total = (parseFloat(valor_unitario) * parseFloat(cantidad));
    if (total >= 0.00) {
      return total;
    } else {
      return '0';
    }
  }
  valor_iva(subtotal: string, descuento: string, porcentaje_iva: number) {
    const tarifa = +porcentaje_iva;
    const impuesto = this.Tarifas_Iva.find(tarifa_ => tarifa_.Tarifa === tarifa).Tarifa;
    const total = ((parseFloat(subtotal) - parseFloat(descuento)) * impuesto / 100);
    if (total >= 0.00) {
      return total;
    } else {
      return '0';
    }
  }
}
