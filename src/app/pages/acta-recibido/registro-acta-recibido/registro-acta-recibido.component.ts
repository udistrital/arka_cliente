import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { scheduled, asyncScheduler, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { MatTable } from '@angular/material/table';
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
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserService } from '../../../@core/data/users.service';
import { TipoActa } from '../../../@core/data/models/acta_recibido/tipo_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { debounceTime, distinctUntilChanged, filter, mergeAll, switchMap } from 'rxjs/operators';
import { ActaValidators } from '../validators';
import { CommonActas } from '../shared';
import { GestorDocumentalService } from '../../../helpers/gestor_documental/gestorDocumentalHelper';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';

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

  // Modelos
  Ubicaciones: any[] = [];
  Sedes: any = [];
  dependencias: any[] = [];
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
    private documento: GestorDocumentalService,
    private userService: UserService,
    private route: ActivatedRoute,
    private oikosHelper: OikosHelper,
  ) {
    this.maxDate = new Date();
    this.minDate = new Date(-1);
    this.fileDocumento = [];
    this.idDocumento = [];
    this.errores = new Map<string, boolean>();
    this.firstForm = this.baseForm;
  }

  ngOnInit() {
    this.listService.findSedes();
    this.listService.findEstadosActa();
    this.listService.findUnidadesEjecutoras();
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
        if (list.listEstadosActa.length && list.listEstadosActa[0] &&
          list.listSedes.length && list.listSedes[0] &&
          list.listUnidadesEjecutoras.length && list.listUnidadesEjecutoras[0]) {
          this.Sedes = list.listSedes[0];
          this.Estados_Acta = list.listEstadosActa[0];
          this.unidadesEjecutoras = list.listUnidadesEjecutoras[0];
          resolve();
        }
      });
    });
  }

  private queryContratistas(query: string = '') {
    this.cargandoContratistas = true;
    return this.tercerosHelper.getTercerosByCriterio('contratista', 0, query);
  }
  muestraContratista = CommonActas.muestraContratista;

  private queryProveedores(query: string = '') {
    this.Proveedores = [];
    this.cargandoProveedores = true;
    return this.tercerosHelper.getAllTercero_(query, 0);
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
          file.nombre = file.name;
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
    if (transaccion_.Formulario1.Sede, transaccion_.Formulario1.Dependencia) {
      const sede_ = this.Sedes.find((x) => x.Id === transaccion_.Formulario1.Sede);
      this.oikosHelper.getAsignacionesBySedeAndDependencia(sede_.CodigoAbreviacion, transaccion_.Formulario1.Dependencia.Id)
        .subscribe((res: any) => {
          this.Ubicaciones = res;
          this.firstForm.setValue(transaccion_);
        });
    } else {
      this.firstForm.setValue(transaccion_);
    }
  }

  private get baseForm() {
    return this.fb.group({
      Formulario1: this.fb.group({
        Contratista: [''],
        UnidadEjecutora: [0],
        Proveedor: ['', [ActaValidators.validarTercero]],
        Sede: [0],
        Dependencia: [''],
        Ubicacion: [0],
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
    this.controlSede.setValidators(this.ae ? [Validators.min(1)] : []);
    this.controlDependencia.setValidators(this.ae ? [Validators.required] : []);
    this.controlUbicacion.setValidators(this.ae ? [Validators.min(1)] : []);
    this.controlContratista.setValidators(this.ae ? [] : [Validators.required, ActaValidators.validarTercero]);
  }

  private setFormEvents() {
    this.oikosHelper.cambiosDependencia(this.controlSede, this.controlDependencia).subscribe((response: any) => {
      this.dependencias = response.queryOptions;
    });

    this.firstForm.valueChanges
    .pipe(debounceTime(200))
    .subscribe((form: any) => {
      // console.debug({form});
      this.actualizarStorage();
    });

    this.controlContratista.valueChanges
    .pipe(
      debounceTime(200), distinctUntilChanged(),
      filter((query: any) => query.length && query.length >= this.minLength),
      switchMap((d: string) => this.queryContratistas(d)),
    )
    .subscribe(data => {
      this.Contratistas = data;
      this.cargandoContratistas = false;
    });

    this.controlProveedor.valueChanges
    .pipe(
      debounceTime(200), distinctUntilChanged(),
      filter((query: any) => query.length && query.length >= this.minLength),
      switchMap((d: string) => this.queryProveedores(d)),
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
    .subscribe(() => {
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

  async postFile(file: any) {
    if (!file) {
      return;
    }

    const rolePromise = new Promise<number>((resolve, reject) => {
      this.documento.uploadFiles([file]).subscribe((data: any) => {
        if (data && data.length) {
          resolve(+data[0].res.Id);
        }
      });
    });

    return rolePromise;
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
        const docId = await this.postFile(file);
        this.idDocumento.push(docId);
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

  Traer_Relacion_Ubicaciones(
    sede = this.controlSede.value,
    dependencia = this.controlDependencia.value) {

    if (!sede || !dependencia) {
      this.Ubicaciones = [];
      this.controlUbicacion.patchValue(0);
      return;
    }

    const sede_ = this.Sedes.find((x) => x.Id === sede);
    this.oikosHelper.getAsignacionesBySedeAndDependencia(sede_.CodigoAbreviacion, dependencia.Id).subscribe((res: any) => {
      this.Ubicaciones = res;
    });
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
