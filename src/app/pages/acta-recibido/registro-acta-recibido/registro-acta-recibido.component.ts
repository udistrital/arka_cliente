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

  Estados_Acta: Array<EstadoActa>;
  Tipos_Bien: Array<TipoBien>;
  Estados_Elemento: Array<EstadoElemento>;

  // Modelos
  Acta: ActaRecibido;
  Elementos__Soporte: Array<any>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Unidades: Unidad[];
  Proveedores: any;
  Ubicaciones: Ubicacion[];
  Sedes: Ubicacion[];
  Dependencias: Dependencia[];
  DatosTotales: any;
  Totales: Array<any>;
  dataService3: CompleterData;
  Tarifas_Iva: Impuesto[];

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private toasterService: ToasterService,
    private completerService: CompleterService,
    private store: Store < IAppState > ,
    private listService: ListService,


  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findProveedores();
    this.loadLists();
  }
  ngOnInit() {
    this.searchStr2 = new Array<string>();
    this.DatosElementos = new Array<any>();
    this.Elementos__Soporte = new Array<any>();
    // Observable.of(this.listService.findProveedores());


    const observable = combineLatest([
      this.Actas_Recibido.getParametros(),
      this.Actas_Recibido.getParametrosSoporte(),
      // this.Actas_Recibido.getProveedores(),
    ]);
    observable.subscribe(([ParametrosActa, ParametrosSoporte]) => {
      // console.log([ParametrosActa, ParametrosSoporte, Proveedores]);
      this.Traer_Estados_Acta(ParametrosActa[0].EstadoActa);
      this.Traer_Estados_Elemento(ParametrosActa[0].EstadoElemento);
      this.Traer_Tipo_Bien(ParametrosActa[0].TipoBien);
      this.Traer_Unidades(ParametrosActa[0].Unidades);
      this.Traer_IVA(ParametrosActa[0].IVA);
      this.Traer_Dependencias(ParametrosSoporte[0].Dependencias);
      this.Traer_Ubicaciones(ParametrosSoporte[0].Ubicaciones);
      this.Traer_Sedes(ParametrosSoporte[0].Sedes);

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
    });
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Proveedores = list.listProveedores[0];
        this.dataService2 = this.completerService.local(this.Proveedores, 'compuesto', 'compuesto');
      },
    );
  }
  Traer_Dependencias(res: any) {
    this.Dependencias = new Array<Dependencia>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const dependencia = new Dependencia;
        dependencia.Id = res[index].Id;
        dependencia.TelefonoDependencia = res[index].TelefonoDependencia;
        dependencia.CorreoElectronico = res[index].Correo;
        dependencia.Nombre = res[index].Nombre;
        this.Dependencias.push(dependencia);
      }
    }
    this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
  }
  Traer_Proveedores_() {
    // this.Proveedores = new Array<Proveedor>();
    // for (const index in res) {
    //   if (res.hasOwnProperty(index)) {
    //     const proveedor = new Proveedor;
    //     proveedor.Id = res[index].Id;
    //     proveedor.NomProveedor = res[index].NomProveedor;
    //     proveedor.NumDocumento = res[index].NumDocumento;
    //     proveedor.compuesto = res[index].NumDocumento + ' - ' + res[index].NomProveedor;
    //     this.Proveedores.push(proveedor);
    //   }
    // }

  }
  Traer_Ubicaciones(res: any) {
    this.Ubicaciones = new Array<Ubicacion>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const ubicacion = new Ubicacion;
        ubicacion.Id = res[index].Id;
        ubicacion.Codigo = res[index].Codigo;
        ubicacion.Estado = res[index].Estado;
        ubicacion.Nombre = res[index].Nombre;
        this.Ubicaciones.push(ubicacion);
      }
    }
    this.dataService = this.completerService.local(this.Ubicaciones, 'Nombre', 'Nombre');
  }
  Traer_Sedes(res: any) {
    this.Sedes = new Array<Ubicacion>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const ubicacion = new Ubicacion;
        ubicacion.Id = res[index].Id;
        ubicacion.Codigo = res[index].Codigo;
        ubicacion.Estado = res[index].Estado;
        ubicacion.Nombre = res[index].Nombre;
        this.Sedes.push(ubicacion);
      }
    }
  }
  Traer_IVA(res: any) {
    this.Tarifas_Iva = new Array<Impuesto>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const tarifas = new Impuesto;
        tarifas.Id = res[index].Id;
        tarifas.Activo = res[index].Activo;
        tarifas.Tarifa = res[index].Tarifa;
        tarifas.Decreto = res[index].Decreto;
        tarifas.FechaCreacion = res[index].FechaCreacion;
        tarifas.FechaModificacion = res[index].FechaModificacion;
        tarifas.ImpuestoId = res[index].ImpuestoId.Id;
        tarifas.Nombre = res[index].Tarifa.toString() + '% ' + res[index].ImpuestoId.CodigoAbreviacion;
        this.Tarifas_Iva.push(tarifas);
      }
    }
  }
  Traer_Estados_Acta(res: any) {
    this.Estados_Acta = new Array<EstadoActa>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const estados_acta = new EstadoActa;
        estados_acta.Id = res[index].Id;
        estados_acta.Nombre = res[index].Nombre;
        estados_acta.CodigoAbreviacion = res[index].CodigoAbreviacion;
        estados_acta.Descripcion = res[index].Descripcion;
        estados_acta.FechaCreacion = res[index].FechaCreacion;
        estados_acta.FechaModificacion = res[index].FechaModificacion;
        estados_acta.NumeroOrden = res[index].NumeroOrden;
        this.Estados_Acta.push(estados_acta);
      }
    }
  }
  Traer_Tipo_Bien(res: any) {
    this.Tipos_Bien = new Array<TipoBien>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const tipo_bien = new TipoBien;
        tipo_bien.Id = res[index].Id;
        tipo_bien.Nombre = res[index].Nombre;
        tipo_bien.CodigoAbreviacion = res[index].CodigoAbreviacion;
        tipo_bien.Descripcion = res[index].Descripcion;
        tipo_bien.FechaCreacion = res[index].FechaCreacion;
        tipo_bien.FechaModificacion = res[index].FechaModificacion;
        tipo_bien.NumeroOrden = res[index].NumeroOrden;
        this.Tipos_Bien.push(tipo_bien);
      }
    }
  }
  Traer_Estados_Elemento(res: any) {
    this.Estados_Elemento = new Array<EstadoElemento>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const estados_elemento = new EstadoElemento;
        estados_elemento.Id = res[index].Id;
        estados_elemento.Nombre = res[index].Nombre;
        estados_elemento.CodigoAbreviacion = res[index].CodigoAbreviacion;
        estados_elemento.Descripcion = res[index].Descripcion;
        estados_elemento.FechaCreacion = res[index].FechaCreacion;
        estados_elemento.FechaModificacion = res[index].FechaModificacion;
        estados_elemento.NumeroOrden = res[index].NumeroOrden;
        this.Estados_Elemento.push(estados_elemento);
      }
    }
  }
  Traer_Unidades(res: any) {
    this.Unidades = new Array<Unidad>();
    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const unidad = new Unidad;
        unidad.Id = res[index].Id;
        unidad.Unidad = res[index].Unidad;
        unidad.Tipo = res[index].Tipo;
        unidad.Descripcion = res[index].Descripcion;
        unidad.Estado = res[index].Estado;
        this.Unidades.push(unidad);
      }
    }
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
      Soporte: ['', Validators.required],
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
  onFirstSubmit() {
    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, 2);
    const Soportes = new Array<TransaccionSoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => {
      Soportes.push(this.Registrar_Soporte(soporte, this.Elementos__Soporte[index], Transaccion_Acta.ActaRecibido));

    });
    Transaccion_Acta.SoportesActa = Soportes;
    this.Actas_Recibido.postTransaccionActa(Transaccion_Acta).subscribe((res: any) => {
      if (res !== null) {
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
  }
  Registrar_Acta(Datos: any, Datos2: any): ActaRecibido {

    const Acta_de_Recibido = new ActaRecibido();
    Acta_de_Recibido.Id = null;
    Acta_de_Recibido.Activo = true;
    Acta_de_Recibido.FechaCreacion = new Date();
    Acta_de_Recibido.FechaModificacion = new Date();
    Acta_de_Recibido.RevisorId = 123;
    Acta_de_Recibido.UbicacionId = this.Ubicaciones.find(ubicacion => ubicacion.Nombre === Datos.Ubicacion).Id;
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
  Registrar_Soporte(Datos: any, Elementos_: any, Acta: ActaRecibido): TransaccionSoporteActa {

    const Soporte_Acta = new SoporteActa();
    const Transaccion = new TransaccionSoporteActa();

    const proveedor___ = Datos.Proveedor.split(' ');
    Soporte_Acta.Id = null;
    Soporte_Acta.ActaRecibidoId = Acta;
    Soporte_Acta.Activo = true;
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
      Elementos_Soporte.push(Elemento__);

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
        sessionStorage.removeItem('Formulario_Registro');
        sessionStorage.removeItem('Elementos_Formulario_Registro');
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
}
