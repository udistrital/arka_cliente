import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';

import { MatTable } from '@angular/material';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Elemento, Impuesto } from '../../../@core/data/models/acta_recibido/elemento';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SoporteActa, Ubicacion } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { TerceroCriterioProveedor } from '../../../@core/data/models/terceros_criterio';
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
  @Output() mostrarData = new EventEmitter<boolean>();

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
  Proveedores: Partial<TerceroCriterioProveedor>[];
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
    private tercerosHelper: TercerosHelper,
    private cp: CurrencyPipe,
    private nuxeoService: NuxeoService,
    private completerService: CompleterService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
  ) {
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
    this.listService.findUbicaciones();
    this.loadDependencias();
    this.Acta = new TransaccionActaRecibido;
  }

  async loadDependencias() {
    const data = [this.loadLists(), this.loadProveedores(), this.loadContratistas(), this.loadActa(), this.loadElementos()];
    await Promise.all(data);
    this.Cargar_Formularios(this.Acta);
  }

  public loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe((list) => {
        this.Estados_Acta = list.listEstadosActa[0],
          this.Estados_Elemento = list.listEstadosElemento[0],
          this.Tipos_Bien = list.listTipoBien[0],
          this.Unidades = list.listUnidades[0],
          this.Tarifas_Iva = list.listIVA[0],
          this.Dependencias = list.listDependencias[0],
          this.Sedes = list.listSedes[0],
          this.Ubicaciones = list.listUbicaciones[0],

          (this.Sedes && this.Sedes.length > 0 && this.Dependencias && this.Dependencias.length > 0 &&
            this.Tarifas_Iva && this.Tarifas_Iva.length > 0 && this.Unidades && this.Unidades.length &&
            this.Tipos_Bien && this.Tipos_Bien.length > 0 && this.Estados_Elemento &&
            this.Estados_Elemento.length > 0 && this.Ubicaciones && this.Ubicaciones.length > 0 &&
            this.Estados_Acta && this.Estados_Acta.length > 0) ? resolve() : null;
      });
    });
  }

  private loadProveedores(): Promise<void> {
    return new Promise<void>(resolve => {
      this.tercerosHelper.getTercerosByCriterio('proveedor').toPromise().then(res => {
        this.Proveedores = res;
        resolve();
      });
    });
  }

  private loadContratistas(): Promise<void> {
    return new Promise<void>(resolve => {
      this.tercerosHelper.getTercerosByCriterio('contratista').toPromise().then(res => {
        this.Contratistas = res;
        resolve();
      });
    });
  }

  private loadActa(): Promise<void> {
    return new Promise<void>(resolve => {
      this.Actas_Recibido.getTransaccionActa(this._ActaId, false).toPromise().then(res => {
        this.Acta.UltimoEstado = res.UltimoEstado;
        this.Acta.ActaRecibido = res.ActaRecibido;
        this.Acta.SoportesActa = res.SoportesActa;
        resolve();
      });
    });
  }

  private loadElementos(): Promise<void> {
    return new Promise<void>(resolve => {
      this.Actas_Recibido.getElementosActa(this._ActaId).toPromise().then(res => {
        this.Acta.Elementos = res;
        resolve();
      });
    });
  }


  T_V(valor: string): string {
    return this.cp.transform(valor);
  }

  muestraProveedor(prov: Partial<TerceroCriterioProveedor>): string {
    if (prov) {
      const str = prov.Identificacion ? prov.Identificacion.Numero + ' - ' : '';
      return str + prov.Tercero.NombreCompleto;
    }
  }

  muestraContratista(contr: TerceroCriterioContratista): string {
    if (contr && contr.Identificacion) {
      return contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    } else {
      if (contr) {
        return contr.Tercero.NombreCompleto;
      }
    }
  }

  async Cargar_Formularios(transaccion_: TransaccionActaRecibido) {

    this.Acta = transaccion_;
    const Form2 = this.fb.array([]);

    for (const Soporte of transaccion_.SoportesActa) {
      const Formulario__2 = this.fb.group({
        Id: [Soporte.Id],
        Consecutivo: [Soporte.Consecutivo],
        Fecha_Factura: [
          new Date(Soporte.FechaSoporte) > new Date('1945') ?
            new Date(Soporte.FechaSoporte.toString().split('Z')[0]) : ''],
        Soporte: [Soporte.DocumentoId],
      });
      Form2.push(Formulario__2);
    }

    const formElementos = this.fb.array([]);
    if (Array.isArray(transaccion_.Elementos))
    for (const _Elemento of transaccion_.Elementos) {
      const Elemento___ = this.fb.group({
        Id: [_Elemento.Id],
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
          this.Tarifas_Iva.find(iva => iva.Tarifa === _Elemento.PorcentajeIvaId) ?
          this.Tarifas_Iva.find(iva => iva.Tarifa === _Elemento.PorcentajeIvaId).Nombre : '',
        ],
        ValorIva: [this.T_V(_Elemento.ValorIva.toString())],
        ValorTotal: [this.T_V(_Elemento.ValorFinal.toString())],
        Verificado: [false],
      });
      formElementos.push(Elemento___);
    }

    this.elementos = formElementos;
    transaccion_.UltimoEstado.UbicacionId ? await this.getSedeDepencencia(transaccion_.UltimoEstado.UbicacionId) : null;

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [transaccion_.ActaRecibido.Id],
        Sede: [this.sedeDependencia ? this.sedeDependencia.sede : ''],
        Dependencia: [this.sedeDependencia ? this.sedeDependencia.dependencia : ''],
        Ubicacion: [
          transaccion_.UltimoEstado.UbicacionId === 0 ? '' :
          this.Ubicaciones.find(x => x.Id === transaccion_.UltimoEstado.UbicacionId).EspacioFisicoId.Nombre],
        Proveedor: [
          transaccion_.UltimoEstado.ProveedorId === 0 ? null :
            this.muestraProveedor(this.Proveedores.find((proveedor) =>
            proveedor.Tercero.Id === transaccion_.UltimoEstado.ProveedorId)),
        ],
        Contratista: [
          transaccion_.UltimoEstado.PersonaAsignadaId === 0 ? null :
            this.muestraContratista(this.Contratistas.find((proveedor) =>
            proveedor.Tercero.Id === transaccion_.UltimoEstado.PersonaAsignadaId)),
        ],
      }),
      FormularioE: formElementos,
      Formulario2: Form2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [transaccion_.UltimoEstado.Observaciones],
      }),
    });
    this.carga_agregada = true;
    this.mostrarData.emit(true);
  }

  async getSedeDepencencia(ubicacionId: number): Promise<void> {

    return new Promise<void>(resolve => {
      this.Actas_Recibido.getSedeDependencia(ubicacionId).toPromise().then(res => {

        const espacioFisico = res[0].EspacioFisicoId.Codigo.substring(0, 4);
        const _dependencia = res[0].DependenciaId.Id;

        const sede = (() => {
          const criterio = x => x && x.CodigoAbreviacion === espacioFisico.toString();
          if (this.Sedes.some(criterio)) {
            return this.Sedes.find(criterio).Nombre;
          }
          return '';
        })();

        const dependencia = (() => {
          const criterio = x => _dependencia && x.Id === _dependencia;
          if (this.Dependencias.some(criterio)) {
            return this.Dependencias.find(criterio).Nombre;
          }
          return '';
        })();

        this.sedeDependencia = { sede: sede, dependencia: dependencia };

        resolve();
      });
    });
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

  private hayElementos(): boolean {
    return (this.Acta
    && this.Acta.hasOwnProperty('SoportesActa')
    && Array.isArray(this.Acta.SoportesActa)
    && this.Acta.SoportesActa.some(sop => Array.isArray(sop.Elementos))
    );
  }

  getGranSubtotal() {
    if (this.hayElementos()) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorTotal).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }

  getGranDescuentos() {
    if (this.hayElementos()) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.Descuento).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }

  getGranValorIva() {
    if (this.hayElementos()) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorIva).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }

  getGranTotal() {
    if (this.hayElementos()) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorFinal).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
}
