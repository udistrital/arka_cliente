import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, AbstractControl } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { TerceroCriterioContratista, TerceroCriterioProveedor } from '../../../@core/data/models/terceros_criterio';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento, EstadoElemento_t } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import Swal from 'sweetalert2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { UserService } from '../../../@core/data/users.service';
import { Acta_t, TipoActa } from '../../../@core/data/models/acta_recibido/tipo_acta';
import { CommonActas } from '../shared';
import { GestorDocumentalService } from '../../../helpers/gestor_documental/gestorDocumentalHelper';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';

@Component({
  selector: 'ngx-ver-acta-recibido',
  templateUrl: './ver-acta-recibido.component.html',
  styleUrls: ['./ver-acta-recibido.component.scss'],
})

export class VerActaRecibidoComponent implements OnInit {

  // Mensajes de error
  estadoActa: string = '';

  // Variables de Formulario
  firstForm: FormGroup;
  carga_agregada: boolean;
  selected = new FormControl(0);

  // Tablas parametricas

  @Input('Id_Acta') _ActaId: number;
  @Input() Modo: string = 'ver';
  Estados_Acta: any;
  Estados_Elemento: any;

  // Modelos

  Acta: TransaccionActaRecibido;
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
  minLength: number = 4;
  unidadesEjecutoras: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private cp: CurrencyPipe,
    private store: Store<IAppState>,
    private listService: ListService,
    private userService: UserService,
    private route: ActivatedRoute,
    private documento: GestorDocumentalService,
    private oikosHelper: OikosHelper,
  ) {
    this.Contratistas = [];
    this.Proveedores = [];
    this.Acta = new TransaccionActaRecibido;
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findSedes();
    this.listService.findListsActa();
    this.listService.findUnidadesEjecutoras();
    this.loadDependencias();
  }

  async loadDependencias() {
    await Promise.all([this.loadLists(), this.loadActa()]);
    this.Cargar_Formularios(this.Acta);
  }

  public loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe((list) => {
        if (list.listEstadosActa.length && list.listEstadosActa[0] &&
          list.listEstadosElemento.length && list.listEstadosElemento[0] &&
          list.listSedes.length && list.listSedes[0] &&
          list.listUnidadesEjecutoras.length && list.listUnidadesEjecutoras[0]) {
          this.Estados_Acta = list.listEstadosActa[0];
          this.Estados_Elemento = list.listEstadosElemento[0];
          this.Sedes = list.listSedes[0];
          this.unidadesEjecutoras = list.listUnidadesEjecutoras[0];
          resolve();
        }
      });
    });
  }

  private loadProveedores(id: number = 0): Promise<void> {
    if (id === 0) {
      return new Promise<void>(resolve => {
        resolve();
      });
    }
    return new Promise<void>(resolve => {
      this.tercerosHelper.getAllTercero_('', id).toPromise().then(res => {
        this.Proveedores.push(res);
        resolve();
      }, (reason) => {
        resolve();
        this.Proveedores = [];
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
        this.Contratistas.push(res);
        resolve();
      }, (reason) => {
        this.Contratistas = [];
        resolve();
      });
    });
  }
  private loadActa(): Promise<void> {
    return new Promise<void>(resolve => {
      const finish = async () => {
        this.Actas_Recibido.getTransaccionActa(this._ActaId, false).toPromise().then(async (res) => {
          // console.log('respuesta acta', res);
          this.Acta.UltimoEstado = res.UltimoEstado;
          this.estadoActa = this.translate.instant(CommonActas.i18nEstado(this.Acta.UltimoEstado.EstadoActaId.Id));
          this.proveedorId = this.Acta.UltimoEstado.ProveedorId;
          this.contratistaId = this.Acta.UltimoEstado.PersonaAsignadaId;
          this.Acta.ActaRecibido = res.ActaRecibido;
          this.Acta.SoportesActa = res.SoportesActa;
          await Promise.all([this.loadProveedores(this.proveedorId),
          this.loadContratistas('', this.actaRegular ? this.contratistaId : 0)]);
          resolve();
        });
      };
      if (this._ActaId) {
        finish();
      } else if (!this._ActaId && this.route.snapshot.paramMap.get('id')) {
        this._ActaId = +this.route.snapshot.paramMap.get('id');
        finish();
      }
    });
  }

  muestraProveedor = CommonActas.muestraProveedor;
  muestraContratista = CommonActas.muestraContratista;

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
    }

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [transaccion_.ActaRecibido.Id],
        Sede: [{
          value: this.sedeDependencia ? this.sedeDependencia.sede : '',
          disabled: true,
        }],
        UnidadEjecutora: [{
          value: transaccion_.ActaRecibido.UnidadEjecutoraId,
          disabled: true,
        }],
        Dependencia: [{
          value: this.sedeDependencia ? this.sedeDependencia.dependencia : '',
          disabled: true,
        }],
        Ubicacion: [{
          value: transaccion_.UltimoEstado.UbicacionId,
          disabled: true,
        }],
        Proveedor: [{
          value: !transaccion_.UltimoEstado.ProveedorId ? null :
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
      this.oikosHelper.getSedeDependencia(ubicacionId).toPromise().then(res => {
        if (!res.length) {
          resolve();
          return;
        }

        const dependencia = res[0].DependenciaId;
        const sede_ = res[0].EspacioFisicoId.CodigoAbreviacion;
        const codigoSede = sede_.substring(0, 2) + sede_.substring(2).replace(/\d.*/g, '');
        const sede = this.Sedes.find(x => x && x.CodigoAbreviacion === codigoSede);

        if (!sede || !dependencia) {
          resolve();
          return;
        }

        this.oikosHelper.getAsignacionesBySedeAndDependencia(codigoSede, dependencia.Id).subscribe((res_: any) => {
          this.UbicacionesFiltradas = res_;
          this.sedeDependencia = { sede: sede.Id, dependencia: dependencia.Nombre };
          resolve();
        });

      });
    });
  }

  public downloadFile(index: number) {
    Swal({
      title: 'Por favor espera, cargando documento',
      allowOutsideClick: false,
      onBeforeOpen: () => {
        Swal.showLoading();
      },
    });

    const id_documento = (this.controlSoportes as FormArray).at(index).get('Soporte').value;
    const filesToGet = [{
      Id: id_documento,
    }];

    this.documento.get(filesToGet).subscribe((data: any) => {
      if (data && data.length && data[0].url) {
        window.open(data[0].url);
      }
      Swal.close();
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
    actaRecibido.TipoActaId = <TipoActa>{ Id: this.tipoActa };
    actaRecibido.UnidadEjecutoraId = this.controlUnidad.value;

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
    const estadoId = aceptar ? EstadoElemento_t.Verificado : EstadoElemento_t.Registrado;

    for (const datos of this.elementos) {

      const elemento = new Elemento;
      const subgrupo = datos.SubgrupoCatalogoId ? datos.SubgrupoCatalogoId.SubgrupoId.Id : null;
      const tipoBien = datos.TipoBienId ? datos.TipoBienId.Id : null;

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
      elemento.TipoBienId = tipoBien ? tipoBien : null;
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

  get tipoActa() {
    return this.Acta.ActaRecibido.TipoActaId.Id;
  }
  get actaRegular() {
    return this.tipoActa === Acta_t.Regular;
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
  get controlUnidad() {
    return this.controlDatosBasicos.get('UnidadEjecutora');
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
