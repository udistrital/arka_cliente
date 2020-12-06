import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
import { ListService } from '../../../@core/store/services/list.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';

@Component({
  selector: 'ngx-capturar-elementos',
  templateUrl: './capturar-elementos.component.html',
  styleUrls: ['./capturar-elementos.component.scss'],
})
export class CapturarElementosComponent implements OnInit {

  fileString: string | ArrayBuffer;
  arrayBuffer: Iterable<number>;
  form: FormGroup;
  buffer: Uint8Array;
  Validador: boolean = false;
  Totales: DatosLocales;
  loading: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild('fileInput') fileInput: ElementRef;
  dataSource: MatTableDataSource<any>;

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

  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private catalogoHelper: CatalogoElementosHelper) {

    this.listService.findSubgruposConsumo();
    this.listService.findSubgruposConsumoControlado();
    this.listService.findSubgruposDevolutivo();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
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
        // console.log(this.Tarifas_Iva)
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
      this.ver();
    } else {
      this.dataSource = new MatTableDataSource();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ver() {
    this.DatosEnviados.emit(this.dataSource.data);
    this.DatosTotales.emit(this.Totales);
  }

  TraerPlantilla() {

    NuxeoService.nuxeo.header('X-NXDocumentProperties', '*');
    NuxeoService.nuxeo.request('/id/8e4d5b47-ba37-41dd-b549-4efc1777fef2')
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
      const [_, extension] = nombre.split('.');
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
          // console.log(res);
          this.respuesta = res;
          this.dataSource.data = this.respuesta[0].Elementos;
          this.ver();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

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

  displayedColumns = [
    'AccionesMacro',
    'TipoBienId',
    'SubgrupoCatalogoId',
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
      Subtotal: '0',
      TipoBienId: '1',
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
        const data = this.dataSource.data;
        data.splice((this.paginator.pageIndex * this.paginator.pageSize) + index, 1);
        this.dataSource.data = data;
        this.ver();
      }
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
