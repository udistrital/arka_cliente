import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { TerceroCriterioContratista, TerceroCriterioProveedor } from '../../../@core/data/models/terceros_criterio';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import Swal from 'sweetalert2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { DocumentoService } from '../../../@core/data/documento.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../@core/data/users.service';
import { TipoActa } from '../../../@core/data/models/acta_recibido/tipo_acta';
import { map, startWith } from 'rxjs/operators';
import { isObject } from 'util';
import { CompleterData, CompleterService } from 'ng2-completer';

@Component({
  selector: 'ngx-ver-acta-recibido',
  templateUrl: './ver-acta-recibido.component.html',
  styleUrls: ['./ver-acta-recibido.component.scss'],
})

export class VerActaRecibidoComponent implements OnInit {

  Verificar_tabla: boolean[];
  // Mensajes de error
  errMess: any;
  estadoActa: string = '';

  // Variables de Formulario
  firstForm: FormGroup;
  @ViewChild('fform') firstFormDirective;
  carga_agregada: boolean;
  index;
  selected = new FormControl(0);

  // Tablas parametricas

  @Input('Id_Acta') _ActaId: number;
  @Input() Modo: string = 'ver';
  Estados_Acta: any;
  Estados_Elemento: any;

  // Modelos

  Acta: TransaccionActaRecibido;
  Dependencias: any;
  Sedes: any;
  bandera: boolean;
  Proveedores: Partial<TerceroCriterioProveedor>[];
  Contratistas: TerceroCriterioContratista[];
  sedeDependencia: any;
  elementos: any;
  totales: any;
  contratistaId: number;
  proveedorId: number;
  UbicacionesFiltradas: any;
  dataService3: CompleterData;
  minLength: number = 4;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private cp: CurrencyPipe,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private listService: ListService,
    private userService: UserService,
    private completerService: CompleterService,
    private route: ActivatedRoute) {
    this.Contratistas = [];
    this.Proveedores = [];
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
    const data = [this.loadLists(), this.loadActa()];
    await Promise.all(data);
    this.Cargar_Formularios(this.Acta);
  }

  public loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe((list) => {
        this.Estados_Acta = list.listEstadosActa[0],
          this.Estados_Elemento = list.listEstadosElemento[0],
          this.Dependencias = list.listDependencias[0],
          this.Sedes = list.listSedes[0],
          this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre'),

          (this.Sedes && this.Sedes.length && this.Dependencias && this.Dependencias.length &&
            this.Estados_Elemento &&  this.Estados_Elemento.length &&
            this.Estados_Acta && this.Estados_Acta.length > 0) ? resolve() : null;
      });
    });
  }

  private loadProveedores(query: string = '', id: number= 0): Promise<void> {
    if (id === 0) {
      return new Promise<void>(resolve => {
        resolve();
      });
    }
    return new Promise<void>(resolve => {
      this.tercerosHelper.getTercerosByCriterio('proveedor', id, query).toPromise().then(res => {
        this.Proveedores = res;
        resolve();
      });
    });
  }

  private loadContratistas(query: string= '', id: number= 0): Promise<void> {
    if (id === 0) {
      return new Promise<void>(resolve => {
        resolve();
      });
    }
    return new Promise<void>(resolve => {
      this.tercerosHelper.getTercerosByCriterio('contratista', id, query).toPromise().then(res => {
        this.Contratistas = res;
        resolve();
      });
    });
  }

  private loadActa(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this._ActaId) {
        this.Actas_Recibido.getTransaccionActa(this._ActaId, false).toPromise().then(res => {
          // console.log('respuesta acta', res);
          this.Acta.UltimoEstado = res.UltimoEstado;
          this.estadoActa = this.Acta.UltimoEstado.EstadoActaId.Nombre;
          this.proveedorId = this.Acta.UltimoEstado.ProveedorId;
          this.contratistaId = this.Acta.UltimoEstado.PersonaAsignadaId;
          this.Acta.ActaRecibido = res.ActaRecibido;
          this.Acta.SoportesActa = res.SoportesActa;
          Promise.all([this.loadProveedores('', this.proveedorId), this.loadContratistas('', this.contratistaId)]);
          resolve();
        });
      } else if (!this._ActaId && this.route.snapshot.paramMap.get('id')) {
        this._ActaId = +this.route.snapshot.paramMap.get('id');
        this.Actas_Recibido.getTransaccionActa(this._ActaId, false).toPromise().then(res => {
          this.Acta.UltimoEstado = res.UltimoEstado;
          this.estadoActa = this.Acta.UltimoEstado.EstadoActaId.Nombre;
          this.proveedorId = this.Acta.UltimoEstado.ProveedorId;
          this.contratistaId = this.Acta.UltimoEstado.PersonaAsignadaId;
          this.Acta.ActaRecibido = res.ActaRecibido;
          this.Acta.SoportesActa = res.SoportesActa;
          Promise.all([this.loadProveedores('', this.proveedorId), this.loadContratistas('', this.contratistaId)]);
          resolve();
        });
      }
    });
  }

  private async filtroProveedores() {
    await this.loadProveedores(this.controlProveedor.value);
  }

  muestraProveedor(prov: Partial<TerceroCriterioProveedor>): string {
    if (prov) {
      const str = prov.Identificacion ? prov.Identificacion.TipoDocumentoId.CodigoAbreviacion + ':' + prov.Identificacion.Numero + ' - ' : '';
      return str + prov.Tercero.NombreCompleto;
    }
  }

  private async filtroContratistas() {
    await this.loadContratistas(this.controlContratista.value);
  }

  muestraContratista(contr: TerceroCriterioContratista): string {
    if (contr && contr.Identificacion) {
      return contr.Identificacion.TipoDocumentoId.CodigoAbreviacion + ':' + contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    } else {
      if (contr) {
        return contr.Tercero.NombreCompleto;
      }
    }
  }

  T_V(valor: string): string {
    return this.cp.transform(valor);
  }

  eventoElementosSeleccionados(event) {
    this.bandera = event;
  }

  eventoElementos(event) {
    this.elementos = event;
  }

  async Cargar_Formularios(transaccion_: TransaccionActaRecibido) {

    if (transaccion_.UltimoEstado.UbicacionId) {
      await this.getSedeDepencencia(transaccion_.UltimoEstado.UbicacionId);
    }

    this.Acta = transaccion_;
    const Form2 = this.fb.array([]);

    for (const Soporte of transaccion_.SoportesActa) {
      const Formulario__2 = this.fb.group({
        Id: [Soporte.Id],
        Consecutivo: [{
          value: Soporte.Consecutivo,
          disabled: true,
        }],
        Fecha_Factura: [{
          value: new Date(Soporte.FechaSoporte) > new Date('1945') ?
            new Date(Soporte.FechaSoporte.toString().split('Z')[0]) : '',
          disabled: true,
        }],
        Soporte: [Soporte.DocumentoId],
      });
      Form2.push(Formulario__2);
      this.Verificar_tabla.push(false);
    }


    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [transaccion_.ActaRecibido.Id],
        Sede: [{
          value: this.sedeDependencia ? this.sedeDependencia.sede : '',
          disabled: true,
        }],
        Dependencia: [{
          value: this.sedeDependencia ? this.sedeDependencia.dependencia : '',
          disabled: true,
        }],
        Ubicacion: [{
          value: transaccion_.UltimoEstado.UbicacionId === 0 ? '' : transaccion_.UltimoEstado.UbicacionId,
          disabled: true,
        }],
        Proveedor: [{
          value: transaccion_.UltimoEstado.ProveedorId === 0 ? null :
            this.Proveedores.find((proveedor) =>
              proveedor.Tercero.Id === transaccion_.UltimoEstado.ProveedorId),
          disabled: true,
        }],
        Contratista: [{
          value: (() => {
            const criterio = (contratista: TerceroCriterioContratista) =>
              contratista &&
              contratista.Tercero.Id === transaccion_.UltimoEstado.PersonaAsignadaId;
            return this.Contratistas.some(criterio) ? this.Contratistas.find(criterio) : '';
          })(),
          disabled: true,
        }],
      }),
      Formulario2: Form2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [{
          value: transaccion_.UltimoEstado.Observaciones,
          disabled: true,
        }],
      }),
    });
    this.carga_agregada = true;
  }

  async getSedeDepencencia(ubicacionId: number): Promise<void> {

    return new Promise<void>(resolve => {
      this.Actas_Recibido.getSedeDependencia(ubicacionId).toPromise().then(res => {

        const espacioFisico = res[0].EspacioFisicoId.CodigoAbreviacion.replace(/[0-9]/g, '');
        const _dependencia = res[0].DependenciaId.Id;

        const sede = (() => {
          const criterio = x => x && x.CodigoAbreviacion === espacioFisico.toString();
          if (this.Sedes.some(criterio)) {
            return this.Sedes.find(criterio);
          }
          return '';
        })();

        const dependencia = (() => {
          const criterio = x => _dependencia && x.Id === _dependencia;
          if (this.Dependencias.some(criterio)) {
            return this.Dependencias.find(criterio);
          }
          return '';
        })();

        const transaccion: any = {};
        transaccion.Sede = this.Sedes.find((x) => x.Id === sede.Id);
        transaccion.Dependencia = this.Dependencias.find((x) => x.Id === dependencia.Id);

        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res_: any) => {
          if (isObject(res_[0].Relaciones)) {
            this.UbicacionesFiltradas = res_[0].Relaciones;
          }
        });

        this.sedeDependencia = { sede: sede.Id, dependencia: dependencia.Nombre };

        resolve();
      });
    });
  }

  downloadFile(index: any) {

    const id_documento = (this.controlSoportes as FormArray).at(index).get('Soporte').value;

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
            url ? window.open(url) : null;
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

    const transaccionActa = new TransaccionActaRecibido();
    transaccionActa.ActaRecibido = this.generarActa();
    const nuevoEstado = aceptar ? EstadoActa_t.Aceptada : EstadoActa_t.EnModificacion;
    transaccionActa.UltimoEstado = this.generarEstadoActa(nuevoEstado, aceptar);

    const Soportes: SoporteActa[] = (this.controlSoportes as FormArray).controls
      .map((soporte, index) => this.generarSoporte(soporte, index));

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
        (Swal as any).fire({
          title: title,
          text: text,
          type: 'success',
          showConfirmButton: false,
          timer: 2000,
        });
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigateByUrl('/pages/acta_recibido/consulta_acta_recibido');
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


  private generarEstadoActa(Estado: number, aceptar: boolean): HistoricoActa {

    const proveedor = this.controlProveedor.value;
    const ubicacionId = this.controlUbicacion.value;
    const contratista = this.controlContratista.value;
    const observaciones = this.controlDatosAdicionales.value;
    const historico = new HistoricoActa();

    historico.Id = null;
    historico.ProveedorId = proveedor ? proveedor.Tercero.Id : null;
    historico.UbicacionId = ubicacionId ? ubicacionId : null;
    historico.PersonaAsignadaId = contratista ? contratista.Tercero.Id : null;
    historico.RevisorId = this.userService.getPersonaId();
    historico.Observaciones = observaciones;
    historico.FechaVistoBueno = aceptar ? new Date() : null;
    historico.ActaRecibidoId = <ActaRecibido>{ Id: +this._ActaId };
    historico.EstadoActaId = this.Estados_Acta.find(estado => estado.Id === Estado);
    historico.Activo = true;

    return historico;
  }

  private generarSoporte(form2: AbstractControl, index: any): SoporteActa {

    const soporteActa = new SoporteActa();

    soporteActa.Id = form2.get('Id').value;
    soporteActa.Consecutivo = form2.get('Consecutivo').value;
    soporteActa.DocumentoId = form2.get('Soporte').value;
    soporteActa.FechaSoporte = form2.get('Fecha_Factura').value ? form2.get('Fecha_Factura').value : null;
    soporteActa.ActaRecibidoId = <ActaRecibido>{ Id: +this._ActaId };
    soporteActa.Activo = true;

    return soporteActa;
  }

  private generarElementos(aceptar: boolean): Array<Elemento> {

    const elementosActa = new Array<Elemento>();
    const estadoId = aceptar ? 2 : 1;

    for (const datos of this.elementos) {

      const elemento = new Elemento;
      const subgrupo = datos.SubgrupoCatalogoId.SubgrupoId.Id;

      elemento.Id = datos.Id;
      elemento.Nombre = datos.Nombre;
      elemento.Cantidad = parseInt(datos.Cantidad, 10);
      elemento.Marca = datos.Marca;
      elemento.Serie = datos.Serie;
      elemento.UnidadMedida = parseInt(datos.UnidadMedida, 10);
      elemento.ValorUnitario = parseFloat(datos.ValorUnitario);
      elemento.Subtotal = parseFloat(datos.Subtotal);
      elemento.Descuento = parseFloat(datos.Descuento);
      elemento.ValorTotal = parseFloat(datos.ValorTotal);
      elemento.PorcentajeIvaId = parseInt(datos.PorcentajeIvaId, 10);
      elemento.ValorIva = parseFloat(datos.ValorIva);
      elemento.ValorFinal = parseFloat(datos.ValorTotal);
      elemento.SubgrupoCatalogoId = subgrupo ? subgrupo : null;
      elemento.EstadoElementoId = <EstadoElemento>{ Id: estadoId };
      elemento.ActaRecibidoId = <ActaRecibido>{ Id: +this._ActaId };
      elemento.Activo = true;

      elementosActa.push(elemento);

    }
    return elementosActa;
  }

  // Validar Acta? (Aprobar?)
  Revisar_Totales() {
    if (!this.userService.TerceroValido()) {
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
    if (!this.userService.TerceroValido()) {
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
            const obs = this.controlDatosAdicionales.value;
            this.controlDatosAdicionales.setValue(
              obs + ' // Razón de rechazo: ' + result2.value,
              );
            this.onFirstSubmit(false);
          }
        });

      }
    });
  }

  eventoTotales(event) {
    this.totales = event;
  }

  get controlDatosBasicos() {
    return this.firstForm.get('Formulario1');
  }
  get controlContratista() {
    return this.controlDatosBasicos.get('Contratista');
  }
  get controlProveedor() {
    return this.controlDatosBasicos.get('Proveedor');
  }
  get controlUbicacion() {
    return this.controlDatosBasicos.get('Ubicacion');
  }

  get controlSoportes() {
    return this.firstForm.get('Formulario2');
  }

  get controlForm3() {
    return this.firstForm.get('Formulario3');
  }
  get controlDatosAdicionales() {
    return this.controlForm3.get('Datos_Adicionales');
  }

}
