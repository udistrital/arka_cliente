import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
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
import { CompleterData, CompleterService } from 'ng2-completer';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { combineAll } from 'rxjs-compat/operator/combineAll';



@Component({
  selector: 'ngx-edicion-acta-recibido',
  templateUrl: './edicion-acta-recibido.component.html',
  styleUrls: ['./edicion-acta-recibido.component.scss'],
})
export class EdicionActaRecibidoComponent implements OnInit {

  config: ToasterConfig;
  searchStr: string;
  searchStr2: string[];
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
  carga_agregada: boolean;
  index;
  selected = new FormControl(0);
  _Acta_Id: number;

  // Tablas parametricas

  @Input('Id_Acta')
  set name2(id: number) {
    this._Acta_Id = id;
  }
  Estados_Acta: Array<EstadoActa>;
  Tipos_Bien: Array<TipoBien>;
  Estados_Elemento: Array<EstadoElemento>;

  // Modelos

  Acta__: ActaRecibido;
  Elementos__Soporte: Array<any[]>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Transaccion__: TransaccionActaRecibido;
  Unidades: Array<Unidad>;
  DatosElementos: Array<any>;
  Acta: ActaRecibido;

  observable: any;

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
    private store: Store<IAppState>,
    private listService: ListService,

  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }
  ngOnInit() {
    this.listService.findProveedores();
    this.loadLists();
  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Proveedores = list.listProveedores[0];
        this.dataService2 = this.completerService.local(this.Proveedores, 'compuesto', 'compuesto');
        this.searchStr2 = new Array<string>();
        this.DatosElementos = new Array<any>();
        this.Elementos__Soporte = new Array<any>();
        const observable = combineLatest([
          this.Actas_Recibido.getParametros(),
          this.Actas_Recibido.getParametrosSoporte(),
          this.Actas_Recibido.getTransaccionActa(this._Acta_Id),
        ]);
        observable.subscribe(([ParametrosActa, ParametrosSoporte, Acta]) => {
          // console.log([ParametrosActa, ParametrosSoporte, Acta]);
          if (Acta[0].SoportesActa !== null) {
            this.Traer_Estados_Acta(ParametrosActa[0].EstadoActa);
            this.Traer_Estados_Elemento(ParametrosActa[0].EstadoElemento);
            this.Traer_Tipo_Bien(ParametrosActa[0].TipoBien);
            this.Traer_Unidades(ParametrosActa[0].Unidades);
            this.Traer_IVA(ParametrosActa[0].IVA);
            this.Traer_Dependencias(ParametrosSoporte[0].Dependencias);
            this.Traer_Ubicaciones(ParametrosSoporte[0].Ubicaciones);
            this.Traer_Sedes(ParametrosSoporte[0].Sedes);
            this.Cargar_Formularios(Acta[0]);
          }
        });
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
  // Traer_Proveedores_(res: any) {
  //   this.Proveedores = new Array<Proveedor>();

  //   for (const index in res) {
  //     if (res.hasOwnProperty(index)) {
  //       const proveedor = new Proveedor;
  //       proveedor.Id = res[index].Id;
  //       proveedor.NomProveedor = res[index].NomProveedor;
  //       proveedor.NumDocumento = res[index].NumDocumento;
  //       proveedor.compuesto = res[index].NumDocumento + ' - ' + res[index].NomProveedor;
  //       this.Proveedores.push(proveedor);
  //     }
  //   }

  //   this.dataService2 = this.completerService.local(this.Proveedores, 'compuesto', 'compuesto');
  // }
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

  Cargar_Formularios(transaccion_: TransaccionActaRecibido) {

    const Form2 = this.fb.array([]);
    const elementos = new Array<any[]>();

    for (const Soporte of transaccion_.SoportesActa) {
      const Formulario__2 = this.fb.group({
        Id: [Soporte.SoporteActa.Id],
        Proveedor: [
          this.Proveedores.find(proveedor => proveedor.Id.toString() === Soporte.SoporteActa.ProveedorId.toString()).compuesto,
          Validators.required,
        ],
        Consecutivo: [Soporte.SoporteActa.Consecutivo, Validators.required],
        Fecha_Factura: [Soporte.SoporteActa.FechaSoporte, Validators.required],
        Soporte: ['', Validators.required],
      });

      const elementoSoporte = [];
      for (const _Elemento of Soporte.Elementos) {

        const Elemento___ = {
          Id: _Elemento.Id,
          TipoBienId: this.Tipos_Bien.find(tipo => tipo.Id.toString() === _Elemento.TipoBienId.Id.toString()).Id,
          SubgrupoCatalogoId: _Elemento.SubgrupoCatalogoId,
          Nombre: _Elemento.Nombre,
          Cantidad: _Elemento.Cantidad,
          Marca: _Elemento.Marca,
          Serie: _Elemento.Serie,
          UnidadMedida: this.Unidades.find(unidad => unidad.Id.toString() === _Elemento.UnidadMedida.toString()).Id,
          ValorUnitario: _Elemento.ValorUnitario,
          Subtotal: _Elemento.ValorTotal,
          Descuento: _Elemento.Descuento,
          PorcentajeIvaId: this.Tarifas_Iva.find(tarifa => tarifa.Id.toString() === _Elemento.PorcentajeIvaId.toString()).Id,
          ValorIva: _Elemento.ValorIva,
          ValorTotal: _Elemento.ValorFinal,
        };
        elementoSoporte.push(Elemento___);
      }
      elementos.push(elementoSoporte);
      Form2.push(Formulario__2);
    }
    this.Elementos__Soporte = elementos;
    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [transaccion_.ActaRecibido.Id],
        Sede: ['', Validators.required],
        Dependencia: ['', Validators.required],
        Ubicacion: [
          this.Ubicaciones.find(ubicacion => ubicacion.Id === transaccion_.ActaRecibido.UbicacionId).Nombre,
          Validators.required,
        ],
      }),
      Formulario2: Form2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [transaccion_.ActaRecibido.Observaciones, Validators.required],
      }),
    });
    this.carga_agregada = true;
  }
  get Formulario_1(): FormGroup {
    return this.fb.group({
      Id: [0],
      Sede: ['', Validators.required],
      Dependencia: ['', Validators.required],
      Ubicacion: ['', Validators.required],
    });
  }
  get Formulario_2(): FormGroup {
    return this.fb.group({
      Id: [0],
      Proveedor: ['', Validators.required],
      Consecutivo: ['', Validators.required],
      Fecha_Factura: ['', Validators.required],
      Soporte: ['', Validators.required],
      Elementos: this.fb.array([this.Elementos]),
    });
  }
  get Elementos(): FormGroup {
    return this.fb.group({
      Id: [0],
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
    this.selected.setValue(this.firstForm.get('Formulario2').value.length - 1);
  }
  removeTab(i: number) {
    this.deleteSoportes(i);
    this.selected.setValue(i - 1);
  }
  onFirstSubmit() {
    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, 3);
    const Soportes = new Array<TransaccionSoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => {
      Soportes.push(this.Registrar_Soporte(soporte, this.Elementos__Soporte[index], Transaccion_Acta.ActaRecibido));

    });
    Transaccion_Acta.SoportesActa = Soportes;
    this.Actas_Recibido.putTransaccionActa(Transaccion_Acta, Transaccion_Acta.ActaRecibido.Id).subscribe((res: any) => {
      if (res !== null) {
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Acta') +
            `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.ModificadaTitle'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Acta') +
            `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Modificada'),
        }).then((willDelete) => {
          if (willDelete.value) {
            window.location.reload();
          }
        });
      } else {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.ModificadaTitleNO'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.ModificadaNO'),
        });
      }
    });
  }

  onFirstSubmit2() {
    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, 4);
    const Soportes = new Array<TransaccionSoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => {
      Soportes.push(this.Registrar_Soporte(soporte, this.Elementos__Soporte[index], Transaccion_Acta.ActaRecibido));

    });
    Transaccion_Acta.SoportesActa = Soportes;
    this.Actas_Recibido.putTransaccionActa(Transaccion_Acta, Transaccion_Acta.ActaRecibido.Id).subscribe((res: any) => {
      if (res !== null) {
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Acta') +
            `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.VerificadaTitle'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Acta') +
            `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Verificada'),
        }).then((willDelete) => {
          if (willDelete.value) {
            window.location.reload();
          }
        });
      } else {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.VerificadaTitleNO'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.VerificadaNO'),
        });
      }
    });

  }

  Registrar_Acta(Datos: any, Datos2: any): ActaRecibido {

    const Acta_de_Recibido = new ActaRecibido();

    Acta_de_Recibido.Id = parseFloat(Datos.Id);
    Acta_de_Recibido.Activo = true;
    Acta_de_Recibido.FechaCreacion = new Date();
    Acta_de_Recibido.FechaModificacion = new Date();
    Acta_de_Recibido.RevisorId = 123;
    Acta_de_Recibido.UbicacionId = this.Ubicaciones.find(ubicacion => ubicacion.Nombre === Datos.Ubicacion).Id;
    Acta_de_Recibido.Observaciones = Datos2.Datos_Adicionales;

    return Acta_de_Recibido;
  }
  Registrar_Estado_Acta(__: ActaRecibido, Estado: number): HistoricoActa {

    const Historico_ = new HistoricoActa();

    Historico_.Id = null;
    Historico_.ActaRecibidoId = __;
    Historico_.Activo = true;
    Historico_.EstadoActaId = this.Estados_Acta.find(estado => estado.Id === Estado);
    Historico_.FechaCreacion = new Date();
    Historico_.FechaModificacion = new Date();

    return Historico_;
  }
  Registrar_Soporte(Datos: any, Elementos_: any, __: ActaRecibido): TransaccionSoporteActa {

    const Soporte_Acta = new SoporteActa();
    const Transaccion = new TransaccionSoporteActa();
    const proveedor___ = Datos.Proveedor.split(' ');
    Soporte_Acta.Id = parseFloat(Datos.Id);
    Soporte_Acta.ActaRecibidoId = __;
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

      Elemento__.Id = parseFloat(Datos.Id);
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
    //   return any.replace(/[$,]/g, '');
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
    // console.log(this.Elementos__Soporte);
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
      title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.CargaElementosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.CargaElementos'),
    });
  }
  Revisar_Totales2() {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.DatosVeridicosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.DatosVeridicos'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        this.onFirstSubmit();
      }
    });
  }
  Revisar_Totales3() {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.DatosVeridicosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.DatosVeridicos2'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        this.onFirstSubmit2();
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
      sessionStorage.setItem('Formulario_Edicion', JSON.stringify(this.firstForm.value));
      sessionStorage.setItem('Elementos_Formulario_Edicion', JSON.stringify(this.Elementos__Soporte));
    } else {
      sessionStorage.setItem('Formulario_Edicion', JSON.stringify(this.firstForm.value));
      sessionStorage.setItem('Elementos_Formulario_Edicion', JSON.stringify(this.Elementos__Soporte));
    }
  }
}
