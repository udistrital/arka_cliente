import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { scheduled, asyncScheduler } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { MatTable } from '@angular/material';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { TerceroCriterioContratista, TerceroCriterioProveedor } from '../../../@core/data/models/terceros_criterio';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import Swal from 'sweetalert2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { AutocompleterOption } from '../../../@theme/components';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from '../../../@core/data/documento.service';
import { UserService } from '../../../@core/data/users.service';
import { AbstractControl } from '@angular/forms/src/model';
import { TipoActa } from '../../../@core/data/models/acta_recibido/tipo_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { debounceTime, distinctUntilChanged, filter, mergeAll, switchMap } from 'rxjs/operators';
import { ActaValidators } from '../validators';
import { CommonActas } from '../shared';

@Component({
  selector: 'ngx-registro-acta-recibido',
  templateUrl: './registro-acta-recibido.component.html',
  styleUrls: ['./registro-acta-recibido.component.scss'],
})
export class RegistroActaRecibidoComponent implements OnInit {

  Contratistas: TerceroCriterioContratista[];
  cargandoContratistas: boolean;
  Proveedores: Partial<TerceroCriterioProveedor>[];
  cargandoProveedores: boolean;
  spinnerSize = 20;

  // Mensajes de error
  errMess: any;

  // Decorador para renderizar los cambios en las tablas de elementos
  @ViewChildren(MatTable) _matTable: QueryList<MatTable<any>>;

  // Variables de Formulario
  firstForm: FormGroup;
  tipoActa: string = 'regular';
  selectedTab: number = 0;
  // Tablas parametricas

  Estados_Acta: any;
  Tipos_Bien: any;
  Estados_Elemento: any;

  // Modelos
  Acta: ActaRecibido;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Ubicaciones: any[] = [];
  Sedes: any[] = [];
  Dependencias: any[] = [];
  Dependencias2: AutocompleterOption[] = [];
  DatosTotales: any;
  Totales: Array<any>;
  fileDocumento: any[];
  idDocumento: number[];
  Nombre: any;
  maxDate: Date;
  minDate: Date;
  Registrando: Boolean;
  cargarTab: boolean;
  DatosElementos: Array<any>;
  errores: Map<string, boolean>;
  public validarElementos: boolean;
  totales: any;
  minLength: number = 4;
  sizeSoporte: number = 5;
  unidadesEjecutoras: any;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {
    this.maxDate = new Date();
    this.minDate = new Date(-1);
    this.fileDocumento = [];
    this.idDocumento = [];
    this.errores = new Map<string, boolean>();
    this.firstForm = this.baseForm;
    this.Actas_Recibido.getUnidadEjecutoraByID('?query=TipoParametroId__CodigoAbreviacion:UE').subscribe(res => {
      if (res) {
        this.unidadesEjecutoras = res.Data;
      }
    });
  }

  ngOnInit() {
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findEstadosActa();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.route.data.subscribe(data => {
      if (data && data.tipoActa) {
        this.tipoActa = data.tipoActa;
      }
      this.initForms();
    });
    if (!this.userService.getPersonaId()) {
      this.errores.set('terceros', true);
    }
  }

  private async initForms() {
    await Promise.all([this.loadLists()]);
    const values = this.formValuesFromStorage;
    if (values) {
      if (await this.retomarValores()) {
        this.llenarFormularios(values);
      } else {
        this.limpiarStorage();
      }
    }
    this.setFormValidators();
    this.setFormEvents();
  }

  private async retomarValores(): Promise<boolean> {
    let result = await (Swal as any).fire({
      type: 'warning',
      title: 'Registro sin completar',
      text: 'Existe un registro nuevo sin terminar, que desea hacer?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Seguir con anterior',
      cancelButtonText: 'Nuevo Registro, se eliminara el registro anterior',
    });
    if (result.value) {
      return true;
    }
    result = await (Swal as any).fire({
      type: 'warning',
      title: 'Ultima Palabra?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Si, Nuevo Registro',
      cancelButtonText: 'No, Usar Anterior',
    });
    return !result.value;
  }

  public loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe(list => {
        list.listSedes[0] && list.listDependencias[0] && list.listEstadosActa[0] ? (
          this.Sedes = CommonActas.preparaSedes(list.listSedes[0]),
          this.Dependencias = CommonActas.preparaDependencias(list.listDependencias[0]),
          this.Dependencias2 = CommonActas.convierteDependencias(this.Dependencias),
          this.Estados_Acta = list.listEstadosActa[0],
          resolve()) : null;
      });
    });
  }

  private queryContratistas(query: string = '') {
    this.cargandoContratistas = true;
    return this.tercerosHelper.getTercerosByCriterio('contratista', 0, query);
  }
  muestraContratista = CommonActas.muestraContratista;

  private queryProveedores(query: string = '') {
    this.cargandoProveedores = true;
    return this.tercerosHelper.getTercerosByCriterio('proveedor', 0, query);
  }
  muestraProveedor = CommonActas.muestraProveedor;

  download(index) {
    const new_tab = window.open(this.fileDocumento[index].urlTemp, this.fileDocumento[index].urlTemp, '_blank');
    new_tab.onload = () => {
      new_tab.location = this.fileDocumento[index].urlTemp;
    };
    new_tab.focus();
  }

  onInputFileDocumento(event, index) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {

        if (file.size < this.sizeSoporte * 1024000) {

          file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
          file.url = this.cleanURL(file.urlTemp);
          file.IdDocumento = 13; // tipo de documento (API documentos_crud)
          file.file = event.target.files[0];
          this.controlSoportes.at(index).get('Soporte').setValue(file.name);
          this.fileDocumento[index] = file;
        } else {
          (Swal as any).fire({
            title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.ErrorSizeSoporteTitle'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.ErrorSizeSoporteText', { SIZE: this.sizeSoporte }),
            type: 'warning',
          });
        }
      } else {
        this.pUpManager.showErrorAlert('error' + this.translate.instant('GLOBAL.error'));
      }
    }
  }

  clearFile(index) {
    this.controlSoportes.at(index).get('Soporte').setValue('');
    this.fileDocumento.splice(index, 1);
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  // Si se quieren usar los datos en cache
  private llenarFormularios(transaccion_: any) {
    if (transaccion_.Formulario2 && transaccion_.Formulario2.length) {
      let diff = transaccion_.Formulario2.length - this.controlSoportes.length;
      while (diff-- > 0) {
        this.controlSoportes.push(this.newSoporte);
      }
    }
    this.firstForm.setValue(transaccion_);
  }

  private get baseForm() {
    return this.fb.group({
      Formulario1: this.fb.group({
        Contratista: [''],
        UnidadEjecutora: [''],
        Proveedor: ['', [ActaValidators.validarTercero]],
        Sede: [''],
        Dependencia: [''],
        Ubicacion: [''],
      }),
      Formulario2: this.fb.array([this.newSoporte]),
      Formulario3: this.fb.group({
        Datos_Adicionales: [''],
      }),
    }, {
      validators: this.checkValidness,
    });
  }

  private setFormValidators() {
    this.controlSede.setValidators(this.ae ? [Validators.required] : []);
    this.controlDependencia.setValidators(this.ae ? [Validators.required] : []);
    this.controlUbicacion.setValidators(this.ae ? [Validators.required] : []);
    this.controlContratista.setValidators(this.ae ? [] : [Validators.required, ActaValidators.validarTercero] );
  }

  private setFormEvents() {
    // Ante cualquier cambio en el formulario
    this.firstForm.valueChanges
    .pipe(debounceTime(200))
    .subscribe((form: any) => {
      // console.debug({form});
      this.actualizarStorage();
    });

    this.controlContratista.valueChanges
    .pipe(
      debounceTime(200), distinctUntilChanged(),
      filter(query => query.length && query.length >= this.minLength),
      switchMap(d => this.queryContratistas(d)),
    )
    .subscribe(data => {
      this.Contratistas = data;
      this.cargandoContratistas = false;
    });

    this.controlProveedor.valueChanges
    .pipe(
      debounceTime(200), distinctUntilChanged(),
      filter(query => query.length && query.length >= this.minLength),
      switchMap(d => this.queryProveedores(d)),
    )
    .subscribe(data => {
      this.Proveedores = data;
      this.cargandoProveedores = false;
    });

    scheduled([ // Porque merge está deprecado
      this.controlSede.valueChanges,
      this.controlDependencia.valueChanges,
    ], asyncScheduler)
    .pipe(mergeAll(), debounceTime(200), distinctUntilChanged())
    .subscribe((change: any) => {
      // console.debug({change});
      this.Traer_Relacion_Ubicaciones();
    });
  }

  get newSoporte(): FormGroup {
    const form2 = this.fb.group({
      Consecutivo: [''],
      FechaSoporte: [''],
      Soporte: ['', Validators.required],
    });
    this.fileDocumento.push(undefined);
    return form2;
  }

  tab() {
    if (this.cargarTab) {
      this.selectedTab = this.controlSoportes.value.length - 1;
      this.cargarTab = false;
    }
  }

  addTab($event) {
    if ($event === this.controlSoportes.value.length && !this.cargarTab) {
      this.controlSoportes.push(this.newSoporte);
      this.selectedTab = this.controlSoportes.value.length;
      this.cargarTab = true;
    }
  }

  removeTab(i: number) {
    this.selectedTab = i - 1;
    this.controlSoportes.removeAt(i);
    this.fileDocumento.splice(i, 1);
  }

  async postSoporteNuxeo(files: any) {
    return new Promise<void>(async (resolve, reject) => {
      files.forEach((file) => {
        file.Id = file.nombre;
        file.nombre = 'soporte_' + file.IdDocumento + '_acta_recibido';
        file.key = 'soporte_' + file.IdDocumento;
      });
      this.nuxeoService.getDocumentos$(files, this.documentoService)
        .subscribe(response => {
          if (Object.keys(response).length === files.length) {
            files.forEach((file) => {
              const a = this.idDocumento[this.idDocumento.length - 1] === response[file.key].Id;
              if (!a) {
                this.idDocumento.push(response[file.key].Id);
              }
              resolve();
            });
          }
        }, error => {
          reject(error);
        });
    });
  }

  eventoTotales(event) {
    this.totales = event;
  }

  eventoListaElementos(event: any) {
    this.DatosElementos = event;
    sessionStorage.setItem('Elementos_Acta_Especial', JSON.stringify(this.DatosElementos));
  }

  setElementosValidos(event: any): void {
    this.validarElementos = event;
    !this.validarElementos ? this.errores.set('clases', true) : this.errores.delete('clases');
  }

  async onFirstSubmit() {
    this.Registrando = true;
    const start = async () => {
      await CommonActas.asyncForEach(this.fileDocumento, async (file) => {
        await this.postSoporteNuxeo([file]);
      });
    };
    await start();
    const transaccionActa = new TransaccionActaRecibido();

    const Datos = this.firstForm.value;
    transaccionActa.ActaRecibido = this.generarActa(Datos);
    transaccionActa.UltimoEstado = this.generarEstadoActa(Datos, this.ae ? EstadoActa_t.Aceptada : EstadoActa_t.Registrada);
    transaccionActa.Elementos = <Elemento[]>[];
    this.ae ? transaccionActa.Elementos = this.generarElementos() : null;

    const Soportes: SoporteActa[] = Datos.Formulario2
      .map((soporte, index) => this.generarSoporte(soporte, index));
    transaccionActa.SoportesActa = Soportes;

    this.Actas_Recibido.postTransaccionActa(transaccionActa).subscribe((res: any) => {
      if (res !== null) {
        (Swal as any).fire({
          title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaTitle', { ID: res.ActaRecibido.Id }),
          text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Registrada', { ID: res.ActaRecibido.Id }),
          type: 'success',
          showConfirmButton: false,
          timer: 4000,
        });
        this.limpiarStorage();
        this.router.navigate(['/pages/acta_recibido/consulta_acta_recibido']);
        this.Registrando = false;
      } else {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaTitleNO'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaNO'),
        });
      }
    });
  }

  private generarActa(Datos: any): ActaRecibido {
    const ta = this.ae ? 2 : 1;
    const actaRecibido = new ActaRecibido;
    actaRecibido.Id = null;
    actaRecibido.Activo = true;
    actaRecibido.TipoActaId = <TipoActa>{Id: ta};
    actaRecibido.UnidadEjecutoraId = Datos.Formulario1.UnidadEjecutora;

    return actaRecibido;
  }

  private generarEstadoActa(Datos: any, Estado: number): HistoricoActa {

    const historico = new HistoricoActa;

    historico.Id = null;
    historico.ProveedorId = Datos.Formulario1.Proveedor ? Datos.Formulario1.Proveedor.Tercero.Id : null;
    historico.UbicacionId = Datos.Formulario1.Ubicacion ? Datos.Formulario1.Ubicacion : null;
    historico.RevisorId = this.userService.getPersonaId();
    historico.PersonaAsignadaId = this.ae ? this.userService.getPersonaId() : Datos.Formulario1.Contratista.Tercero.Id;
    historico.Observaciones = null;
    historico.FechaVistoBueno = null;
    historico.ActaRecibidoId = new ActaRecibido;
    historico.EstadoActaId = this.Estados_Acta.find(estado => estado.Id === Estado);
    historico.Activo = true;

    return historico;
  }

  private generarSoporte(Datos: any, index: number): SoporteActa {

    const soporteActa = new SoporteActa;

    soporteActa.Id = null;
    soporteActa.Consecutivo = Datos.Consecutivo;
    soporteActa.DocumentoId = this.idDocumento[index];
    soporteActa.FechaSoporte = Datos.FechaSoporte ? Datos.FechaSoporte : null;
    soporteActa.ActaRecibidoId = new ActaRecibido;
    soporteActa.Activo = true;

    return soporteActa;
  }

  private generarElementos(): Array<Elemento> {
    const ee = this.ae ? 2 : 1;
    const elementosActa = new Array<Elemento>();

    if (this.DatosElementos && this.DatosElementos.length > 0) {

      for (const datos of this.DatosElementos) {

        const elemento = new Elemento;
        const subgrupo = datos.SubgrupoCatalogoId ? datos.SubgrupoCatalogoId.SubgrupoId.Id : null;
        const tipoBien = datos.TipoBienId ? datos.TipoBienId.Id : null;

        elemento.Id = null;
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
        elemento.EstadoElementoId = <EstadoElemento>{Id: ee};
        elemento.ActaRecibidoId = new ActaRecibido;
        elemento.Activo = true;
        elementosActa.push(elemento);
      }
    }
    return elementosActa;
  }

  Revisar_Totales() {
    if (!this.userService.TerceroValido()) {
      return;
    }
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
      }
    });
  }

  actualizarStorage() { // PUT-POST
    const datos = this.firstForm.value;
    sessionStorage
      .setItem(this.keyStorage, JSON.stringify(datos));
  }
  private get formValuesFromStorage() { // GET
    const source = sessionStorage.getItem(this.keyStorage);
    return source ? JSON.parse(source) : undefined;
  }
  private limpiarStorage() { // DELETE
    sessionStorage.removeItem(this.keyStorage);
  }
  private get keyStorage() {
    return this.ae ? 'Formulario_Acta_Especial' : 'Formulario_Registro';
  }

  Traer_Relacion_Ubicaciones() {
    const sede = this.controlSede;
    const dependencia = this.controlDependencia;

    if (sede.value && dependencia.value && dependencia.value.value) {
      const sede_ = this.Sedes.find((x) => x.Id === parseFloat(sede.value));
      const dependencia_ = dependencia.value.value;
      this.Actas_Recibido.getAsignacionesBySedeAndDependencia(sede_.CodigoAbreviacion, dependencia_.Id).subscribe((res: any) => {
        this.Ubicaciones = res;
      });
    }

  }

  private checkValidness: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const errors = !(
      control.get('Formulario1').valid &&
      control.get('Formulario2').valid &&
      control.get('Formulario3').valid);
    errors ? this.errores.set('formularios', true) : this.errores.delete('formularios');
    return errors ? { formularios: true } : null;
  }

  get ae() {
    return this.tipoActa === 'especial';
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
  get controlSede() {
    return this.controlDatosBasicos.get('Sede');
  }
  get controlDependencia() {
    return this.controlDatosBasicos.get('Dependencia');
  }
  get controlUbicacion() {
    return this.controlDatosBasicos.get('Ubicacion');
  }

  get controlSoportes() {
    return this.firstForm.get('Formulario2') as FormArray;
  }

  get controlForm3() {
    return this.firstForm.get('Formulario3');
  }
  get controlDatosAdicionales() {
    return this.controlForm3.get('Datos_Adicionales');
  }

}
