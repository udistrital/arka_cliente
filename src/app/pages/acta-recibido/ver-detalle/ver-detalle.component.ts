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
import { DocumentoService } from '../../../@core/data/documento.service';


@Component({
  selector: 'ngx-ver-detalle',
  templateUrl: './ver-detalle.component.html',
  styleUrls: ['./ver-detalle.component.scss'],
})
export class VerDetalleComponent implements OnInit {


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
  Tarifas_Iva: Impuesto[];
  Ubicaciones: Ubicacion[];
  Proveedores: Proveedor[];
  Totales: any;
  Acta: TransaccionActaRecibido;
  fileDocumento: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private cp: CurrencyPipe,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,

  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
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
      this.Traer_IVA(ParametrosActa[0].IVA);
      this.Traer_Proveedores_(Proveedores);
      this.Traer_Ubicaciones(ParametrosSoporte[0].Ubicaciones);
      this.Cargar_Formularios(Acta[0]);
    });
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
  ];

  loadSoporte() {
    this.Actas_Recibido.getSoporte(this._ActaId).subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;

        const filesToGet = [
          {
            Id: data[0].DocumentoId,
            key: data[0].DocumentoId,
          },
        ];

        this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService)
          .subscribe(response => {
            const filesResponse = <any>response;
            this.fileDocumento = filesResponse;
            console.log(filesResponse)
            if (Object.keys(filesResponse).length === filesToGet.length) {
              // console.log("files", filesResponse);
              filesToGet.forEach((file: any) => {
                const url = filesResponse[file.Id];
                // let newWindow = window.open('','_blank')
                const new_tab = window.open(url);
                new_tab.onload = () => {
                  new_tab.location = url;
                };
                new_tab.focus();
              });
            }
          });
      }
    });
  }

  Pipe2Number(any: String) {
    if (any !== null) {
      return any.replace(/[$,]/g, '');
    } else {
      return '0';
    }
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
    window.location.reload();
  }
}
