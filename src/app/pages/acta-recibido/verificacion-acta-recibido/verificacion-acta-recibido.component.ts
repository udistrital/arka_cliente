import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';

import { MatTable } from '@angular/material';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { TerceroCriterioProveedor } from '../../../@core/data/models/terceros_criterio';
import { Elemento, Impuesto } from '../../../@core/data/models/acta_recibido/elemento';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SoporteActa, Ubicacion } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
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
import { UserService } from '../../../@core/data/users.service';

@Component({
  selector: 'ngx-verificacion-acta-recibido',
  templateUrl: './verificacion-acta-recibido.component.html',
  styleUrls: ['./verificacion-acta-recibido.component.scss'],
})
export class VerificacionActaRecibidoComponent implements OnInit {


  config: ToasterConfig;
  Verificar_tabla: boolean[];
  Verificar_tabla2: boolean;
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
  Estados_Acta: any;
  Tipos_Bien: any;
  Estados_Elemento: any;

  // Modelos

  Acta__: ActaRecibido;
  Elementos__Soporte: Array<Elemento>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Transaccion__: TransaccionActaRecibido;
  Unidades: any;
  Acta: TransaccionActaRecibido;
  Proveedores: Partial<TerceroCriterioProveedor>[];
  Ubicaciones: any;
  Tarifas_Iva: any;
  Dependencias: any;
  Sedes: any;
  bandera: boolean;
  bandera2: boolean;
  respuesta: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private toasterService: ToasterService,
    private cp: CurrencyPipe,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private userService: UserService,

  ) {
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findUbicaciones();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
    this.loadDependencias();
    this.Verificar_tabla = new Array<boolean>();
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

  T_V(valor: string): string {
    return this.cp.transform(valor);
  }


  Verificar_Tabla(event, index) {
    // console.log(event)
    // console.log(index)
    this.Verificar_tabla[index] = event;
    // console.log(this.Verificar_tabla)
    this.bandera = false;
    // console.log(this.source);
    for (const datos of this.Verificar_tabla) {
      // console.log(datos)
      if (datos !== true) {
        this.bandera = true;
        break;
      }
    }
    if (this.bandera === false) {
      this.bandera2 = true;
    } else {
      this.bandera = false;
      this.bandera2 = false;
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
      this.Verificar_tabla.push(false);
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

  private onFirstSubmit(aceptar: boolean = false) {

    this.Datos = this.firstForm.value;
    this.Datos.Formulario3 = this.firstForm.get('Formulario3').get('Datos_Adicionales').value;
    const transaccionActa = new TransaccionActaRecibido();
    transaccionActa.ActaRecibido = this.generarActa();
    const nuevoEstado = aceptar ? EstadoActa_t.Aceptada : EstadoActa_t.EnModificacion;
    transaccionActa.UltimoEstado = this.generarEstadoActa(this.Datos.Formulario1, this.Datos.Formulario3, nuevoEstado, aceptar);

    const Soportes = new Array<SoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => { Soportes.push(this.generarSoporte(soporte, index)); });

    transaccionActa.SoportesActa = Soportes;
    transaccionActa.Elementos = <Elemento[]>[];

    transaccionActa.Elementos = this.generarElementos(aceptar);

    this.Actas_Recibido.putTransaccionActa(transaccionActa, transaccionActa.ActaRecibido.Id).subscribe((res: any) => {
      const base_i18n = 'GLOBAL.Acta_Recibido.VerificacionActa.';
      let title: string;
      let text: string;
      const ID = res.ActaRecibido.Id;
      if (res) {
        title = this.translate.instant(base_i18n + (aceptar ? 'VerificadaTitle' : 'RechazadaTitle'), {ID});
        text = this.translate.instant(base_i18n + (aceptar ? 'Verificada' : 'Rechazada'), {ID});
      } else {
        title = this.translate.instant(base_i18n + (aceptar ? 'VerificadaTitleNO' : 'RechazadaTitleNO'));
        text = this.translate.instant(base_i18n + (aceptar ? 'VerificadaNO' : 'RechazadaNO'));
      }
      if (res !== null) {
        (Swal as any).fire({type: 'success', title, text}).then((willDelete) => {
          if (willDelete.value) {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigateByUrl('/pages/acta_recibido/consulta_acta_recibido');
            });
          }
        });
      } else {
        (Swal as any).fire({type: 'error', title, text});
      }
    });
  }

  private generarActa(): ActaRecibido {

    const actaRecibido = new ActaRecibido;

    actaRecibido.Id = +this._ActaId;
    actaRecibido.Activo = true;
    actaRecibido.TipoActaId = <TipoActa>{ Id: this.Acta.ActaRecibido.TipoActaId.Id };

    return actaRecibido;
  }


  private generarEstadoActa(form1: any, form3: any, Estado: number, aceptar: boolean): HistoricoActa {

    const historico = new HistoricoActa();
    historico.Id = null;
    historico.ProveedorId = form1.Proveedor ? this.Proveedores.find(prov => this.muestraProveedor(prov) === form1.Proveedor).Tercero.Id : null;
    historico.UbicacionId = form1.Ubicacion ? this.Ubicaciones.find(ubc => ubc.EspacioFisicoId.Nombre === form1.Ubicacion).Id : 0;
    historico.PersonaAsignadaId = form1.Contratista ?
      this.Contratistas.find(contr => this.muestraContratista(contr) === form1.Contratista).Tercero.Id : 0;
    historico.RevisorId = this.userService.getPersonaId();
    historico.Observaciones = form3;
    historico.FechaVistoBueno = aceptar ? new Date() : null;
    historico.ActaRecibidoId = <ActaRecibido>{ Id: +this._ActaId };
    historico.EstadoActaId = this.Estados_Acta.find(estado => estado.Id === Estado);
    historico.Activo = true;

    return historico;
  }

  private generarSoporte(form2: any, index: any): SoporteActa {

    const soporteActa = new SoporteActa();

    soporteActa.Id = form2.Id;
    soporteActa.Consecutivo = form2.Consecutivo;
    soporteActa.DocumentoId = 2400; // this.idDocumento[index];
    soporteActa.FechaSoporte = form2.Fecha_Factura ? form2.Fecha_Factura : null;
    soporteActa.ActaRecibidoId = <ActaRecibido>{ Id: +this._ActaId };
    soporteActa.Activo = true;

    return soporteActa;
  }

  private generarElementos(aceptar: boolean): Array<Elemento> {

    const elementosActa = new Array<Elemento>();
    const estadoId = aceptar ? 2 : 1;

    for (const datos of this.elementos.value) {

      const elemento = new Elemento;
      const valorTotal = parseFloat(this.currency2Number(datos.Subtotal)) - parseFloat(this.currency2Number(datos.Descuento));

      elemento.Id = datos.Id;
      elemento.Nombre = datos.Nombre;
      elemento.Cantidad = parseInt(datos.Cantidad, 10);
      elemento.Marca = datos.Marca;
      elemento.Serie = datos.Serie;
      elemento.UnidadMedida = this.Unidades.find(unidad => unidad.Unidad === datos.UnidadMedida).Id,
      elemento.ValorUnitario = parseFloat(this.currency2Number(datos.ValorUnitario));
      elemento.Subtotal = parseFloat(this.currency2Number(datos.Subtotal));
      elemento.Descuento = parseFloat(this.currency2Number(datos.Descuento));
      elemento.ValorTotal = valorTotal;
      elemento.PorcentajeIvaId = this.Tarifas_Iva.find(iva => iva.Nombre === datos.PorcentajeIvaId).Tarifa;
      elemento.ValorIva = parseFloat(this.currency2Number(datos.ValorIva));
      elemento.ValorFinal = parseFloat(this.currency2Number(datos.ValorTotal));
      elemento.SubgrupoCatalogoId = +datos.SubgrupoCatalogoId.SubgrupoId.Id;
      elemento.EstadoElementoId = <EstadoElemento>{Id: estadoId};
      elemento.ActaRecibidoId = <ActaRecibido>{ Id: +this._ActaId };
      elemento.Activo = true;

      elementosActa.push(elemento);

    }
    return elementosActa;
  }

  currency2Number(any: String) {
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

  revisorValido(): boolean {
    if (!this.userService.getPersonaId()) {
      (Swal as any).fire({
        title: this.translate.instant('GLOBAL.error'),
        text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.ErrorRevisorMsg'),
        type: 'error',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok',
      });
      return false;
    } else {
      return true;
    }
  }

  // Validar Acta? (Aprobar?)
  Revisar_Totales() {
    if (!this.revisorValido()) {
      return;
    }

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
        this.onFirstSubmit(true);
      }
    });
  }

  // Rechazar Acta?
  Revisar_Totales2() {
    if (!this.revisorValido()) {
      return;
    }

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
        (Swal as any).mixin({
          input: 'text',
          confirmButtonText: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Rechazar'),
          showCancelButton: true,
          progressSteps: ['1'],
        }).queue([
          {
            title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Observaciones'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.RechazadaRazon'),
          },
        ]).then((result2) => {
          if (result2.value) {
            const obs = this.firstForm.get('Formulario3').get('Datos_Adicionales').value;
            this.firstForm.get('Formulario3').get('Datos_Adicionales').setValue(
              obs + ' // Razón de rechazo: ' + result2.value,
              );
            this.onFirstSubmit(false);
          }
        });

      }
    });
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
