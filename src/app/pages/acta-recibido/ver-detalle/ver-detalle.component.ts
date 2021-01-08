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
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer } from '@angular/platform-browser';
import { CompleterData, CompleterService } from 'ng2-completer';
import { HttpErrorResponse } from '@angular/common/http';


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


  _ActaId: number;
  Estados_Acta: any;
  Tipos_Bien: any;
  Estados_Elemento: any;
  @Input('Id_Acta')
  set name(id: any) {
    this._ActaId = id;
    this.loadLists();
  }

  // Modelos

  Acta__: ActaRecibido;
  Elementos__Soporte: Array<Elemento>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Transaccion__: TransaccionActaRecibido;
  Unidades: any;
  Tarifas_Iva: any;
  Ubicaciones: any;
  Proveedores: any;
  Totales: any;
  Acta: TransaccionActaRecibido;
  fileDocumento: any;
  Dependencias: any;
  Sedes: any;
  ActaEspecial: boolean;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private cp: CurrencyPipe,
    private nuxeoService: NuxeoService,
    private completerService: CompleterService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,


  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findProveedores();
    this.listService.findDependencias();
    this.listService.findSedes();
    // this.listService.findUbicaciones();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
  }
  ngOnInit() {

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
        // console.log(this.Proveedores)
        // this.dataService = this.completerService.local(this.Ubicaciones, 'Nombre', 'Nombre');
        if (this.Estados_Acta !== undefined && this.Estados_Elemento !== undefined &&
          this.Tipos_Bien !== undefined && this.Unidades !== undefined &&
          this.Tarifas_Iva !== undefined && this.Proveedores !== undefined &&
          this.Dependencias !== undefined && this.Sedes !== undefined &&
          this._ActaId !== undefined) {
          // console.log(this._ActaId);
          this.Actas_Recibido.getTransaccionActa(this._ActaId).subscribe(Acta => {
            // console.log(Acta);
            this.Cargar_Formularios(Acta[0]);
            // console.log('ok');
          });
        }
      },
    );
  }

  T_V(valor: string): string {
    return this.cp.transform(valor);
  }
  Cargar_Formularios(transaccion_: TransaccionActaRecibido) {

    this.Actas_Recibido.getSedeDependencia(transaccion_.ActaRecibido.UbicacionId).subscribe(res => {
      // console.log(res)
      const valor = res[0].EspacioFisicoId.Codigo.substring(0, 4);
      this.Acta = transaccion_;

      // console.log(this.Proveedores);

      const Form2 = this.fb.array([]);

      for (const Soporte of transaccion_.SoportesActa) {

        const Formulario__2 = this.fb.group({
          Id: [Soporte.SoporteActa.Id],
          Proveedor: [
            Soporte.SoporteActa.ProveedorId === 0 ? this.ActaEspecial = true :
              this.Proveedores.find((proveedor) =>
                proveedor.Id.toString() === Soporte.SoporteActa.ProveedorId.toString()).compuesto,
          ],
          Consecutivo: [Soporte.SoporteActa.Consecutivo],
          Fecha_Factura: [Soporte.SoporteActa.FechaSoporte],
          Soporte: [Soporte.SoporteActa.DocumentoId],
          Elementos: this.fb.array([]),
        });
        for (const _Elemento of Soporte.Elementos) {

          const Elemento___ = this.fb.group({
            Id: [_Elemento.Id],
            TipoBienId: [
              _Elemento.TipoBienId !== null ? this.Tipos_Bien.find(bien => bien.Id.toString() === _Elemento.TipoBienId.Id.toString()).Nombre : '',
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
              this.Tarifas_Iva.find(iva => iva.Id.toString() === _Elemento.PorcentajeIvaId.toString()).Nombre,
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
          Sede: [this.Sedes.find(x => x.CodigoAbreviacion === valor.toString()).Nombre],
          Dependencia: [this.Dependencias.find(x => x.Id === res[0].DependenciaId.Id).Nombre],
          Ubicacion: [transaccion_.ActaRecibido.UbicacionId],
        }),
        Formulario2: Form2,
        Formulario3: this.fb.group({
          Datos_Adicionales: [transaccion_.ActaRecibido.Observaciones],
        }),
      });
      this.Traer_Relacion_Ubicaciones(valor, res[0].DependenciaId.Id, transaccion_.ActaRecibido.UbicacionId);
      this.carga_agregada = true;

    });
  }

  Traer_Relacion_Ubicaciones(sede_, dependencia_, ubicacion_) {

    const transaccion: any = {};
    transaccion.Sede = this.Sedes.find((x) => x.CodigoAbreviacion === sede_.toString());
    transaccion.Dependencia = this.Dependencias.find((x) => x.Id === dependencia_);
    // console.log(this.Sedes);
    if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
      this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
        // console.log(res)
        if (Object.keys(res[0]).length !== 0) {
          this.Ubicaciones = res[0].Relaciones;
          this.firstForm.get('Formulario1').get('Ubicacion').setValue(
            this.Ubicaciones.find(x => x.Id === ubicacion_).Nombre);
        } else {
          this.Ubicaciones = undefined;
        }
      });
    }
  }

  downloadFile(index: any) {

    const id_documento = (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').value;

    const filesToGet = [
      {
        Id: id_documento,
        key: id_documento,
      },
    ];
    this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService)
      .subscribe(response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          // console.log("files", filesResponse);
          filesToGet.forEach((file: any) => {
            const url = filesResponse[file.Id];
            window.open(url);
          });
        }
      },
        (error: HttpErrorResponse) => {
          Swal({
            type: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
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
            // console.log(filesResponse);
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
