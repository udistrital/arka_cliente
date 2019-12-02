import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';

import { MatTable } from '@angular/material';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Elemento, Impuesto } from '../../../@core/data/models/acta_recibido/elemento';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SoporteActa, Ubicacion, Dependencia } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionSoporteActa, TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import Swal from 'sweetalert2';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';
import { CompleterService, CompleterData } from 'ng2-completer';
import { HttpLoaderFactory } from '../../../app.module';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from '../../../@core/data/documento.service';





@Component({
  selector: 'ngx-registro-acta-recibido',
  templateUrl: './registro-acta-recibido.component.html',
  styleUrls: ['./registro-acta-recibido.component.scss'],
})


export class RegistroActaRecibidoComponent implements OnInit {

  config: ToasterConfig;
  searchStr: string;
  searchStr2: Array<string>;
  searchStr3: string;
  protected dataService: CompleterData;
  protected dataService2: CompleterData;
  protected dataService3: CompleterData;

  // Mensajes de error
  errMess: any;
  private sub: Subscription;

  // Decorador para renderizar los cambios en las tablas de elementos
  @ViewChildren(MatTable) _matTable: QueryList<MatTable<any>>;

  // Variables de Formulario
  firstForm: FormGroup;
  @ViewChild('fform') firstFormDirective;
  Datos: any;
  DatosElementos: Array<any>;
  carga_agregada: boolean;
  index;
  selected = new FormControl(0);
  // Tablas parametricas

  Estados_Acta: any;
  Tipos_Bien: any;
  Estados_Elemento: any;

  // Modelos
  Acta: ActaRecibido;
  Elementos__Soporte: Array<any>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Unidades: any;
  Proveedores: any;
  Ubicaciones: any;
  Sedes: any;
  Dependencias: any;
  DatosTotales: any;
  Totales: Array<any>;
  Tarifas_Iva: any;
  fileDocumento: any[];
  uidDocumento: any;
  idDocumento: number[];
  validador: boolean;
  validador_soporte: number;
  Nombre: any;



  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private toasterService: ToasterService,
    private completerService: CompleterService,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,


  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findProveedores();
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findUbicaciones();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
    this.loadLists();
    this.fileDocumento = [];
    this.uidDocumento = [];
    this.idDocumento = [];
  }
  ngOnInit() {
    this.searchStr2 = new Array<string>();
    this.DatosElementos = new Array<any>();
    this.Elementos__Soporte = new Array<any>();

    if (sessionStorage.Formulario_Registro == null) {
      this.Cargar_Formularios();
    } else {
      const formulario = JSON.parse(sessionStorage.Formulario_Registro);
      // console.log(sessionStorage.Formulario_Registro);
      // console.log(sessionStorage.Elementos_Formulario_Registro);
      let elementos;
      if (sessionStorage.Elementos_Formulario_Registro === []) {
        elementos = [];
      } else {
        elementos = JSON.parse(sessionStorage.getItem('Elementos_Formulario_Registro'));
        // console.log(elementos);
      }
      (Swal as any).fire({
        type: 'warning',
        title: 'Registro sin completar',
        text: 'Existe un registro nuevo sin terminar, que desea hacer?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Seguir con anterior',
        cancelButtonText: 'Nuevo Registro, se eliminara el registro anterior',
      }).then((result) => {
        if (result.value) {
          this.Cargar_Formularios2(formulario, elementos);
        } else {
          (Swal as any).fire({
            type: 'warning',
            title: 'Ultima Palabra?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Si, Nuevo Registro',
            cancelButtonText: 'No, Usar Anterior',
          }).then((result2) => {
            if (result2.value) {
              sessionStorage.removeItem('Formulario_Registro');
              sessionStorage.removeItem('Elementos_Formulario_Registro');
              this.Cargar_Formularios();
            } else {
              this.Cargar_Formularios2(formulario, elementos);
            }
          });
        }
      });
    }

  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Estados_Acta = list.listEstadosActa[0];
        this.Estados_Elemento = list.listEstadosElemento[0];
        this.Tipos_Bien = list.listTipoBien[0];
        this.Unidades = list.listUnidades[0];
        this.Tarifas_Iva = list.listIVA[0];
        this.Proveedores = list.listProveedores[0];
        this.Dependencias = list.listDependencias[0];
        // this.Ubicaciones = list.listUbicaciones[0];
        this.Sedes = list.listSedes[0];
        this.dataService2 = this.completerService.local(this.Proveedores, 'compuesto', 'compuesto');
        this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
        // this.dataService = this.completerService.local(this.Ubicaciones, 'Nombre', 'Nombre');
      },
    );
  }
  download(index) {

    const new_tab = window.open(this.fileDocumento[index].urlTemp, this.fileDocumento[index].urlTemp, '_blank');
    new_tab.onload = () => {
      new_tab.location = this.fileDocumento[index].urlTemp;
    };
    new_tab.focus();
  }

  onInputFileDocumento(event, index) {
    // console.log(event.target.files);
    // console.log(event.srcElement.files);
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
        file.url = this.cleanURL(file.urlTemp);
        file.IdDocumento = 13;
        file.file = event.target.files[0];
        this.fileDocumento[index] = file;
        // console.log(file);
        // console.log(this.fileDocumento);
      } else {
        this.pUpManager.showErrorAlert('error' + this.translate.instant('GLOBAL.error'));
      }
    }
  }
  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  Cargar_Formularios() {

    this.firstForm = this.fb.group({
      Formulario1: this.Formulario_1,
      Formulario2: this.fb.array([this.Formulario_2]),
      Formulario3: this.Formulario_3,
    });
    this.carga_agregada = true;
  }
  Cargar_Formularios2(transaccion_: any, elementos_: any) {

    const Form2 = this.fb.array([]);
    const elementos = new Array<any[]>();

    for (const Soporte of transaccion_.Formulario2) {
      const Formulario__2 = this.fb.group({
        Id: [''],
        Proveedor: [Soporte.Proveedor, Validators.required],
        Consecutivo: [Soporte.Consecutivo, Validators.required],
        Fecha_Factura: [Soporte.Fecha_Factura, Validators.required],
        Soporte: ['', Validators.required],
      });
      Form2.push(Formulario__2);
    }
    this.Elementos__Soporte = elementos_;

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [''],
        Sede: [transaccion_.Formulario1.Sede, Validators.required],
        Dependencia: [transaccion_.Formulario1.Dependencia, Validators.required],
        Ubicacion: [transaccion_.Formulario1.Ubicacion, Validators.required],
      }),
      Formulario2: Form2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [transaccion_.Formulario3.Datos_Adicionales, Validators.required],
      }),
    });
    this.carga_agregada = true;
    this.Traer_Relacion_Ubicaciones();
  }
  get Formulario_1(): FormGroup {
    return this.fb.group({
      Sede: [''],
      Dependencia: [''],
      Ubicacion: ['', Validators.required],
    });
  }
  get Formulario_2(): FormGroup {
    return this.fb.group({
      Proveedor: ['', Validators.required],
      Consecutivo: ['', Validators.required],
      Fecha_Factura: ['', Validators.required],
      Soporte: [''],
    });
  }
  get Elementos(): FormGroup {
    return this.fb.group({
      TipoBienId: [''],
      SubgrupoCatalogoId: [''],
      Nombre: [''],
      Cantidad: ['0'],
      Marca: [''],
      Serie: [''],
      UnidadMedida: [''],
      ValorUnitario: ['0'],
      Subtotal: ['0'],
      Descuento: ['0'],
      PorcentajeIvaId: [''],
      ValorIva: ['0'],
      ValorTotal: ['0'],
    });
  }
  get Formulario_3(): FormGroup {
    return this.fb.group({
      Datos_Adicionales: ['', Validators.required],
    });
  }
  addSoportes() {
    (this.firstForm.get('Formulario2') as FormArray).push(this.Formulario_2);
  }
  deleteSoportes(index: number) {
    (this.firstForm.get('Formulario2') as FormArray).removeAt(index);
  }
  addTab() {
    this.addSoportes();
    this.searchStr2.push();
    this.selected.setValue(this.firstForm.get('Formulario2').value.length - 1);
    // console.log(this.dataService2);

  }
  removeTab(i: number) {
    this.deleteSoportes(i);
    this.searchStr2.splice(i, 1);
    this.selected.setValue(i - 1);

  }
  postSoporteNuxeo(files: any) {
    // console.log(files);
    return new Promise((resolve, reject) => {
      files.forEach((file) => {
        // console.log(file);
        file.Id = file.nombre;
        file.nombre = 'soporte_' + file.IdDocumento + '_acta_recibido';
        // file.key = file.Id;
        file.key = 'soporte_' + file.IdDocumento;
      });
      // console.log(files);
      this.nuxeoService.getDocumentos$(files, this.documentoService)
        .subscribe(response => {
          // console.log('response', response);
          if (Object.keys(response).length === files.length) {
            // console.log('response', response);
            files.forEach((file) => {
              this.uidDocumento.push(file.uid);
              this.idDocumento.push(response[file.key].Id);
            });
            resolve(true);
          }
        }, error => {
          reject(error);
        });
    });
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  async onFirstSubmit() {

    const start = async () => {
      await this.asyncForEach(this.fileDocumento, async (file) => {
        await this.postSoporteNuxeo([file]);
        // console.log(file);
      });
      // console.log('Done');
    };
    await start();
    // console.log(this.uidDocumento);
    // console.log(this.idDocumento);
    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, 2);
    const Soportes = new Array<TransaccionSoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => {
      Soportes.push(this.Registrar_Soporte(soporte, this.Elementos__Soporte[index], Transaccion_Acta.ActaRecibido, this.idDocumento[index]));

    });
    Transaccion_Acta.SoportesActa = Soportes;
    // console.log('ok');
    // console.log(Transaccion_Acta)
    if (this.validador === false) {
      this.Actas_Recibido.postTransaccionActa(Transaccion_Acta).subscribe((res: any) => {
        if (res !== null) {
          // console.log(res);
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Acta') +
              `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaTitle'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Acta') +
              `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Registrada'),
          });
        } else {
          (Swal as any).fire({
            type: 'error',
            title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaTitleNO'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaNO'),
          });
        }
      });
    } else {
      (Swal as any).fire({
        type: 'error',
        title: 'Datos Incompletos',
        text: 'Existen datos de elementos incompletos en el soporte del proveedor :' +
          this.Proveedores.find(x => x.Id === this.validador_soporte),
      });
    }

  }
  Registrar_Acta(Datos: any, Datos2: any): ActaRecibido {

    const Acta_de_Recibido = new ActaRecibido();
    Acta_de_Recibido.Id = null;
    Acta_de_Recibido.Activo = true;
    Acta_de_Recibido.FechaCreacion = new Date();
    Acta_de_Recibido.FechaModificacion = new Date();
    Acta_de_Recibido.RevisorId = 123;
    Acta_de_Recibido.UbicacionId = parseFloat(Datos.Ubicacion);
    Acta_de_Recibido.Observaciones = Datos2.Datos_Adicionales;

    return Acta_de_Recibido;
  }
  Registrar_Estado_Acta(Acta: ActaRecibido, Estado: number): HistoricoActa {

    const Historico_ = new HistoricoActa();

    Historico_.Id = null;
    Historico_.ActaRecibidoId = Acta;
    Historico_.Activo = true;
    Historico_.EstadoActaId = this.Estados_Acta.find(estado => estado.Id === Estado);
    Historico_.FechaCreacion = new Date();
    Historico_.FechaModificacion = new Date();

    return Historico_;
  }
  Registrar_Soporte(Datos: any, Elementos_: any, Acta: ActaRecibido, Documento: number): TransaccionSoporteActa {

    const Soporte_Acta = new SoporteActa();
    const Transaccion = new TransaccionSoporteActa();

    const proveedor___ = Datos.Proveedor.split(' ');
    Soporte_Acta.Id = null;
    Soporte_Acta.ActaRecibidoId = Acta;
    Soporte_Acta.Activo = true;
    Soporte_Acta.DocumentoId = Documento;
    Soporte_Acta.Consecutivo = Datos.Consecutivo;
    Soporte_Acta.FechaCreacion = new Date();
    Soporte_Acta.FechaModificacion = new Date();
    Soporte_Acta.FechaSoporte = Datos.Fecha_Factura;
    Soporte_Acta.ProveedorId = this.Proveedores.find(proveedor => proveedor.NumDocumento.toString() === proveedor___[0].toString()).Id;

    Transaccion.SoporteActa = Soporte_Acta;
    Transaccion.Elementos = this.Registrar_Elementos(Elementos_, Soporte_Acta);
    return Transaccion;
  }
  Registrar_Elementos(Datos: any, Soporte: SoporteActa): Array<Elemento> {
    const Elementos_Soporte = new Array<Elemento>();
    if ((Object.keys(Datos).length === 0)) {
      // console.log(this.validador);
      this.validador = true;
      this.validador_soporte = Soporte.ProveedorId;
      // console.log(this.validador);
    } else {
      for (const datos of Datos) {
        const Elemento__ = new Elemento;
        const valorTotal = (parseFloat(this.Pipe2Number(datos.Subtotal)) - parseFloat(this.Pipe2Number(datos.Descuento)));
        // console.log(this.Unidades);
        // console.log(Datos);
        // console.log(this.Unidades.find(unidad => unidad.Id === parseInt(datos.UnidadMedida)))
        Elemento__.Id = null;
        Elemento__.Nombre = datos.Nombre;
        Elemento__.Cantidad = parseFloat(this.Pipe2Number(datos.Cantidad));
        Elemento__.Marca = datos.Marca;
        Elemento__.Serie = datos.Serie;
        Elemento__.UnidadMedida = this.Unidades.find(unidad => unidad.Id === parseFloat(datos.UnidadMedida)).Id;
        Elemento__.ValorUnitario = parseFloat(this.Pipe2Number(datos.ValorUnitario));
        Elemento__.Subtotal = parseFloat(this.Pipe2Number(datos.Subtotal));
        Elemento__.Descuento = parseFloat(this.Pipe2Number(datos.Descuento));
        Elemento__.ValorTotal = valorTotal;
        Elemento__.PorcentajeIvaId = parseFloat(datos.PorcentajeIvaId);
        Elemento__.ValorIva = parseFloat(this.Pipe2Number(datos.ValorIva));
        Elemento__.ValorFinal = parseFloat(this.Pipe2Number(datos.ValorTotal));
        Elemento__.SubgrupoCatalogoId = parseFloat(datos.SubgrupoCatalogoId);
        Elemento__.Verificado = false;
        Elemento__.TipoBienId = this.Tipos_Bien.find(bien => bien.Id === parseFloat(datos.TipoBienId));
        Elemento__.EstadoElementoId = this.Estados_Acta.find(estado => estado.Id === 1);
        Elemento__.SoporteActaId = Soporte;
        Elemento__.Activo = true;
        Elemento__.FechaCreacion = new Date();
        Elemento__.FechaModificacion = new Date();
        this.validador = false;
        if ((Elemento__.Nombre === '') || (Elemento__.Marca === '') || (Elemento__.Serie === '')) {
          // console.log(this.validador);
          this.validador = true;
          this.validador_soporte = Soporte.ProveedorId;
          // console.log(this.validador);
        }
        if ((Elemento__.ValorUnitario === 0.00) || (Elemento__.Cantidad === 0.00)) {
          // console.log(this.validador);
          this.validador = true;
          this.validador_soporte = Soporte.ProveedorId;
          // console.log(this.validador);
        }
        Elementos_Soporte.push(Elemento__);
      }
    }
    return Elementos_Soporte;
  }

  displayedColumns = [
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

  Pipe2Number(any: string) {
    // if (any !== null) {
    //  return any.replace(/[$,]/g, '');
    // } else {
    //   return '0';
    // }
    return any;
  }
  valortotal(subtotal: string, descuento: string, iva: string) {
    return (parseFloat(subtotal) - parseFloat(descuento) + parseFloat(iva));
  }
  valorXcantidad(valor_unitario: string, cantidad: string) {
    return (parseFloat(valor_unitario) * parseFloat(cantidad));
  }
  valor_iva(subtotal: string, descuento: string, porcentaje_iva: string) {
    return ((parseFloat(subtotal) - parseFloat(descuento)) * parseFloat(porcentaje_iva) / 100);
  }
  ver(event: any, index: number) {
    this.DatosElementos = event;
    if (this.Elementos__Soporte === undefined) {
      this.Elementos__Soporte = new Array<any>(this.DatosElementos);
    } else {
      if (index < (this.Elementos__Soporte.length)) {
        this.Elementos__Soporte[index] = this.DatosElementos;
      } else {
        this.Elementos__Soporte.push(this.DatosElementos);
      }
    }
    this.usarLocalStorage();

  }
  ver2(event: any, index: number) {
    this.DatosTotales = event;
    if (this.Totales === undefined) {
      this.Totales = new Array<any>(this.DatosTotales);
    } else {
      if (index < (this.Totales.length)) {
        this.Totales[index] = this.DatosTotales;
      } else {
        this.Totales.push(this.DatosTotales);
      }
    }
  }
  Revisar_Totales() {
    (Swal as any).fire({
      type: 'warning',
      title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.CargaElementosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.CargaElementos'),
    });
  }
  Revisar_Totales2() {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.DatosVeridicosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.DatosVeridicos'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        this.onFirstSubmit();
        if (!this.validador) {
          sessionStorage.removeItem('Formulario_Registro');
          sessionStorage.removeItem('Elementos_Formulario_Registro');
          this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
            // this.router.navigate(['/pages/acta_recibido/consulta_acta_recibido']);
          });
        }

      }
    });
  }
  getGranSubtotal() {
    if (this.Totales !== []) {
      return this.Totales.map(t => t.Subtotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    } else {
      return '0';
    }
  }
  getGranDescuentos() {

    if (this.Totales !== []) {
      return this.Totales.map(t => t.Descuento).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    } else {
      return '0';
    }
  }
  getGranValorIva() {

    if (this.Totales !== []) {
      return this.Totales.map(t => t.ValorIva).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    } else {
      return '0';
    }
  }
  getGranTotal() {

    if (this.Totales !== []) {
      return this.Totales.map(t => t.ValorTotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    } else {
      return '0';
    }
  }
  usarLocalStorage() {

    if (sessionStorage.Formulario_Registro == null) {
      sessionStorage.setItem('Formulario_Registro', JSON.stringify(this.firstForm.value));
      sessionStorage.setItem('Elementos_Formulario_Registro', JSON.stringify(this.Elementos__Soporte));
    } else {
      sessionStorage.setItem('Formulario_Registro', JSON.stringify(this.firstForm.value));
      sessionStorage.setItem('Elementos_Formulario_Registro', JSON.stringify(this.Elementos__Soporte));
    }
  }

  Traer_Relacion_Ubicaciones() {
    const sede = this.firstForm.get('Formulario1').get('Sede').value;
    const dependencia = this.firstForm.get('Formulario1').get('Dependencia').value;

    if (this.firstForm.get('Formulario1').get('Sede').valid || this.firstForm.get('Formulario1').get('Dependencia').valid) {
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      // console.log(this.Sedes);
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          // console.log(res)
          if (Object.keys(res[0]).length !== 0 ) {
            this.Ubicaciones = res[0].Relaciones;
          } else {
            this.Ubicaciones = undefined;
          }
        });
      }
    }
  }
}
