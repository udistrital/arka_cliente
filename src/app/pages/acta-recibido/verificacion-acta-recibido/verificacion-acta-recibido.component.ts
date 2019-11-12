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
import { SoporteActa, Ubicacion } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionSoporteActa, TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import Swal from 'sweetalert2';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';



@Component({
  selector: 'ngx-verificacion-acta-recibido',
  templateUrl: './verificacion-acta-recibido.component.html',
  styleUrls: ['./verificacion-acta-recibido.component.scss'],
})
export class VerificacionActaRecibidoComponent implements OnInit {


  config: ToasterConfig;

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

  // Tablas parametricas

  @Input('Id_Acta') _ActaId: number;
  Estados_Acta: Array<EstadoActa>;
  Tipos_Bien: Array<TipoBien>;
  Estados_Elemento: Array<EstadoElemento>;

  // Modelos

  Acta__: ActaRecibido;
  Elementos__Soporte: Array<Elemento>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Transaccion__: TransaccionActaRecibido;
  Unidades: Unidad[];
  Acta: TransaccionActaRecibido;
  Proveedores: Proveedor[];
  Ubicaciones: Ubicacion[];
  Tarifas_Iva: Impuesto[];

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private toasterService: ToasterService,
    private cp: CurrencyPipe,

  ) {
  }
  ngOnInit() {
    const observable = combineLatest([
      this.Actas_Recibido.getParametros(),
      this.Actas_Recibido.getParametrosSoporte(),
      this.Actas_Recibido.getProveedores(),
      this.Actas_Recibido.getTransaccionActa(this._ActaId),
    ]);
    observable.subscribe(([ParametrosActa, ParametrosSoporte, Proveedores, Acta]) => {
      // console.log([ParametrosActa, ParametrosSoporte, Proveedores, Acta]);
      this.Traer_Tipo_Bien(ParametrosActa[0].TipoBien);
      this.Traer_Unidades(ParametrosActa[0].Unidades);
      this.Traer_Estados_Acta(ParametrosActa[0].EstadoActa);
      this.Traer_Estados_Elemento(ParametrosActa[0].EstadoElemento);
      this.Traer_IVA(ParametrosActa[0].IVA);
      this.Traer_Proveedores_(Proveedores);
      this.Traer_Ubicaciones(ParametrosSoporte[0].Ubicaciones);
      this.Cargar_Formularios(Acta[0]);
    });
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
  Traer_Proveedores_(res: any) {
    this.Proveedores = new Array<Proveedor>();

    for (const index in res) {
      if (res.hasOwnProperty(index)) {
        const proveedor = new Proveedor;
        proveedor.Id = res[index].Id;
        proveedor.NomProveedor = res[index].NomProveedor;
        proveedor.NumDocumento = res[index].NumDocumento;
        proveedor.compuesto = res[index].NumDocumento + ' - ' + res[index].NomProveedor;
        this.Proveedores.push(proveedor);
      }
    }
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
  T_V(valor: string): string {
    return this.cp.transform(valor);
  }
  Cargar_Formularios(transaccion_: TransaccionActaRecibido) {
    this.Acta = transaccion_;
    this.firstForm = new FormGroup({});
    // console.log(this.Acta);

    const Form2 = this.fb.array([]);

    for (const Soporte of transaccion_.SoportesActa) {

      const Formulario__2 = this.fb.group({
        Id: [Soporte.SoporteActa.Id],
        Proveedor: [
          this.Proveedores.find(proveedor => proveedor.Id.toString() === Soporte.SoporteActa.ProveedorId.toString()).compuesto,
        ],
        Consecutivo: [Soporte.SoporteActa.Consecutivo],
        Fecha_Factura: [Soporte.SoporteActa.FechaSoporte],
        Soporte: [''],
        Elementos: this.fb.array([]),
      });
        for (const _Elemento of Soporte.Elementos ) {

          const Elemento___ = this.fb.group({
            Id: [_Elemento.Id],
            TipoBienId: [
              this.Tipos_Bien.find(bien => bien.Id.toString() === _Elemento.TipoBienId.Id.toString()).Nombre,
            ],
            SubgrupoCatalogoId: [_Elemento.SubgrupoCatalogoId],
            Nombre: [_Elemento.Nombre],
            Cantidad: [_Elemento.Cantidad],
            Marca: [_Elemento.Marca],
            Serie: [_Elemento.Serie],
            UnidadMedida: [
              this.Unidades.find(unidad => unidad.Id.toString() === _Elemento.UnidadMedida.toString()).Unidad,
            ],
            ValorUnitario: [this.T_V(_Elemento.ValorUnitario.toString())],
            Subtotal: [this.T_V(_Elemento.ValorTotal.toString())],
            Descuento: [this.T_V(_Elemento.Descuento.toString())],
            PorcentajeIvaId: [
              this.Tarifas_Iva.find( iva => iva.Id.toString() === _Elemento.PorcentajeIvaId.toString()).Nombre,
            ],
            ValorIva: [this.T_V(_Elemento.ValorIva.toString())],
            ValorTotal: [this.T_V(_Elemento.ValorFinal.toString())],
            Verificado: [false],
          });

        (Formulario__2.get('Elementos') as FormArray).push(Elemento___);
        }

      Form2.push(Formulario__2);
    }

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [transaccion_.ActaRecibido.Id],
        Sede: [''],
        Dependencia: [''],
        Ubicacion: [ this.Ubicaciones.find(ubicacion => ubicacion.Id.toString() === transaccion_.ActaRecibido.UbicacionId.toString()).Nombre],
      }),
      Formulario2: Form2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [transaccion_.ActaRecibido.Observaciones, Validators.required],
      }),
    });

    this.carga_agregada = true;
  }


  onFirstSubmit() {
    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, 5);
    const Soportes = new Array<TransaccionSoporteActa>();
    for (const soporte of this.Datos.Formulario2) {
      Soportes.push(this.Registrar_Soporte(soporte, soporte.Elementos, Transaccion_Acta.ActaRecibido));
    }
    Transaccion_Acta.SoportesActa = Soportes;
    this.Actas_Recibido.putTransaccionActa(Transaccion_Acta, Transaccion_Acta.ActaRecibido.Id).subscribe((res: any) => {
      if (res !== null) {
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Acta') +
            `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.VerificadaTitle'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Acta') +
            `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Verificada'),
        }).then((willDelete) => {
          if (willDelete.value) {
            window.location.reload();
          }
        });
      } else {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.VerificadaTitleNO'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.VerificadaNO'),
        });
      }
    });
  }

  onFirstSubmit2() {

    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, 3);
    const Soportes = new Array<TransaccionSoporteActa>();
    for (const soporte of this.Datos.Formulario2) {
      Soportes.push(this.Registrar_Soporte(soporte, soporte.Elementos, Transaccion_Acta.ActaRecibido));
    }
    Transaccion_Acta.SoportesActa = Soportes;
    this.Actas_Recibido.putTransaccionActa(Transaccion_Acta, Transaccion_Acta.ActaRecibido.Id).subscribe((res: any) => {
      if (res !== null) {
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Acta') +
            `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.RechazadaTitle'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Acta') +
            `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Rechazada'),
        }).then((willDelete) => {
          if (willDelete.value) {
            window.location.reload();
          }
        });
      } else {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.RechazadaTitleNO'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.RechazadaNO'),
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
    Acta_de_Recibido.FechaVistoBueno =  new Date();
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
    const _ = new Array<Elemento>();

    for (const datos of Datos) {

      const Elemento__ = new Elemento;
      const valorTotal = (parseFloat(this.Pipe2Number(datos.Subtotal)) - parseFloat(this.Pipe2Number(datos.Descuento)));

      Elemento__.Id = parseFloat(Datos.Id);
      Elemento__.Nombre = datos.Nombre;
      Elemento__.Cantidad = datos.Cantidad;
      Elemento__.Marca = datos.Marca;
      Elemento__.Serie = datos.Serie;
      Elemento__.UnidadMedida =  this.Unidades.find(unidad => unidad.Unidad.toString() === datos.UnidadMedida.toString()).Id,
      Elemento__.ValorUnitario = parseFloat(this.Pipe2Number(datos.ValorUnitario));
      Elemento__.Subtotal = parseFloat(this.Pipe2Number(datos.Subtotal));
      Elemento__.Descuento = parseFloat(this.Pipe2Number(datos.Descuento));
      Elemento__.ValorTotal = valorTotal;
      Elemento__.PorcentajeIvaId = this.Tarifas_Iva.find(tarifa => tarifa.Nombre === datos.PorcentajeIvaId).Id;
      Elemento__.ValorIva = parseFloat(this.Pipe2Number(datos.ValorIva));
      Elemento__.ValorFinal = parseFloat(this.Pipe2Number(datos.ValorTotal));
      Elemento__.SubgrupoCatalogoId = parseFloat(datos.SubgrupoCatalogoId);
      Elemento__.Verificado = datos.Verificado;
      Elemento__.TipoBienId = this.Tipos_Bien.find(bien => bien.Nombre.toString() === datos.TipoBienId.toString());
      Elemento__.EstadoElementoId = this.Estados_Acta.find(estado => estado.Id === 2);
      Elemento__.SoporteActaId = Soporte;
      Elemento__.Activo = true;
      Elemento__.FechaCreacion = new Date();
      Elemento__.FechaModificacion = new Date();

      _.push(Elemento__);

    }
    return _;
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
  Pipe2Number(any: String) {
    if (any !== null) {
      return any.replace(/[$,]/g, '');
    } else {
      return '0';
    }
  }
  valortotal(subtotal: string, descuento: string, iva: string) {
    return (parseFloat(subtotal) - parseFloat(descuento) + parseFloat(iva));
  }
  valorXcantidad(valor_unitario: string, cantidad: string) {
    return (parseFloat(valor_unitario) * parseFloat(cantidad)).toString();
  }
  valor_iva(subtotal: string, descuento: string, porcentaje_iva: string) {
    return ((parseFloat(subtotal) - parseFloat(descuento)) * parseFloat(porcentaje_iva) / 100);
  }
  Revisar_Totales() {

    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.DatosVeridicosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.VerificadaPre'),
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
  Revisar_Totales2() {

    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.DatosVeridicosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.RechazadaPre'),
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

    if (this.Acta !== undefined) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorTotal).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
  getGranDescuentos() {

    if (this.Acta !== undefined) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.Descuento).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
  getGranValorIva() {

    if (this.Acta !== undefined) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorIva).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
  getGranTotal() {

    if (this.Acta !== undefined) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorFinal).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
  volver() {
  }
}
