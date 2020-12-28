import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
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
import { ListService } from '../../../@core/store/services/list.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { isNumeric } from 'rxjs/internal-compatibility';
import { isArray } from 'util';
import { MatCheckboxChange } from '@angular/material';
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
  dataSource: MatTableDataSource<any>;
  dataSource2: MatTableDataSource<any>;

  @Input() DatosRecibidos: any;
  @Output() DatosEnviados = new EventEmitter();
  @Output() DatosTotales = new EventEmitter();

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

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private catalogoHelper: CatalogoElementosHelper,
    private userService: UserService,
    private completerService: CompleterService) {

    this.listService.findSubgruposConsumo();
    this.listService.findSubgruposConsumoControlado();
    this.listService.findSubgruposDevolutivo();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
    this.listService.findClases();
    this.loadLists();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Consumo = list.listConsumo[0];
        this.ConsumoControlado = list.listConsumoControlado[0];
        this.Devolutivo = list.listDevolutivo[0];
        this.Tipos_Bien = list.listTipoBien[0];
        this.Unidades = list.listUnidades[0];
        this.Tarifas_Iva = list.listIVA[0];
        this.Clases = list.listClases[0];
        this.dataService = this.completerService.local(this.Clases, 'SubgrupoId.Nombre', 'SubgrupoId.Nombre');
        // console.log({pollito:this.Clases})
      },
    );
  }
  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {
    this.createForm();
    this.Totales = new DatosLocales();
    if (this.DatosRecibidos !== undefined) {
      this.dataSource = new MatTableDataSource(this.DatosRecibidos);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.respuesta = this.DatosRecibidos;
      this.getDescuentos();
      this.getSubtotales();
      this.getIVA();
      this.getTotales();
      this.getClasesElementos();
      // this.dataSource.data[0].TipoBienNombre = this.Tipos_Bien[2].Nombre;
      this.ver();
    } else {
      this.dataSource = new MatTableDataSource();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    for (let i = 0; i < this.dataSource.data.length; i++) {
      if (this.dataSource.data[i].CodigoSubgrupo === undefined) {
        this.dataSource.data[i].CodigoSubgrupo = '';
      }
    }
    this.ReglasColumnas();
  }

  ReglasColumnas() {
    if (this.userService.tieneAlgunRol([Rol.Proveedor])) {
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
    this.dataSource.data[fila].CodigoSubgrupo = selected.originalObject.SubgrupoId.Codigo;
    this.dataSource.data[fila].TipoBienId = selected.originalObject.TipoBienId.Id;
    this.dataSource.data[fila].SubgrupoCatalogoId = selected.originalObject.SubgrupoId.Id;
    this.dataSource.data[fila].TipoBienNombre = selected.originalObject.TipoBienId.Nombre;
  }



  ver() {
    this.refrescaCheckTotal();
    // console.log(this.DatosEnviados)
    this.DatosEnviados.emit(this.dataSource.data);
    this.DatosTotales.emit(this.Totales);
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
          this.ver();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          for (let i = 0; i < this.dataSource.data.length; i++) {
            if (this.dataSource.data[i].CodigoSubgrupo === undefined) {
              this.dataSource.data[i].CodigoSubgrupo = '';
              this.dataSource.data[i].TipoBienNombre = '';
              this.dataSource.data[i].NombreClase = '';
            }
          }
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTitleOK'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ElementosCargadosTextOK'),
          });
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
    });
  }

  clearFile() {
    this.Validador = false;
    this.form.get('archivo').setValue('');

  }

  onSubmit() {
    this.readThis();
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
        elemento.TipoBienNombre = this.Tipos_Bien.find((x) => x.Id === elemento.TipoBienId).Nombre;
        elemento.CodigoSubgrupo = this.Clases.find((x) => x.SubgrupoId.Id === elemento.SubgrupoCatalogoId).SubgrupoId.Codigo;
        elemento.NombreClase = this.Clases.find((x) => x.SubgrupoId.Id === elemento.SubgrupoCatalogoId).SubgrupoId.Nombre;
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
      PorcentajeIvaId: '3',
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
    this.refrescaCheckTotal();
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
    const tarifa = porcentaje_iva;
    const impuesto = this.Tarifas_Iva.find(tarifa_ => tarifa_.Id.toString() === tarifa.toString()).Tarifa;
    const total = ((parseFloat(subtotal) - parseFloat(descuento)) * impuesto / 100);
    if (total >= 0.00) {
      return total;
    } else {
      return '0';
    }
  }
}
