import { AuthInterceptor } from './../../../@core/_Interceptor/auth.Interceptor';
import { Formulario } from './../edicion-acta-recibido/datos_locales';
import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { MatTable } from '@angular/material';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Elemento, Impuesto } from '../../../@core/data/models/acta_recibido/elemento';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SoporteActa, Ubicacion } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';

import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { TerceroCriterioContratista, TerceroCriterioProveedor } from '../../../@core/data/models/terceros_criterio';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionSoporteActa, TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import Swal from 'sweetalert2';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';
import { CompleterService, CompleterData } from 'ng2-completer';
import { HttpLoaderFactory } from '../../../app.module';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../@core/data/users.service';
import { AbstractControl } from '@angular/forms/src/model';
import { NbDateService } from '@nebular/theme';
import { map, startWith } from 'rxjs/operators';
import { isObject } from 'rxjs/internal-compatibility';

@Component({
  selector: 'ngx-registro-acta-recibido',
  templateUrl: './registro-acta-recibido.component.html',
  styleUrls: ['./registro-acta-recibido.component.scss'],
})
export class RegistroActaRecibidoComponent implements OnInit {

  config: ToasterConfig;
  searchStr: string;
  searchStr2: Array<string>;
  searchStr3: string;
  protected dataService: CompleterData;
  protected dataService2: CompleterData;
  protected dataService3: CompleterData;
  private Contratistas: TerceroCriterioContratista[];
  contratistasFiltrados: Observable<Partial<TerceroCriterioContratista>[]>;
  private Proveedores: Partial<TerceroCriterioProveedor>[];
  proveedoresFiltrados: Observable<Partial<TerceroCriterioProveedor>[]>;
  listo: Map<string, boolean>;

  // Mensajes de error
  errMess: any;
  private sub: Subscription;

  // Decorador para renderizar los cambios en las tablas de elementos
  @ViewChildren(MatTable) _matTable: QueryList<MatTable<any>>;

  // Variables de Formulario
  firstForm: FormGroup;
  @ViewChild('fform') firstFormDirective;
  Datos: any;
  index;
  selected = new FormControl(0);
  // Tablas parametricas

  Estados_Acta: any;
  Tipos_Bien: any;
  Estados_Elemento: any;

  // Modelos
  Acta: ActaRecibido;
  // Elementos__Soporte: Array<any>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  // Proveedores: any;
  Ubicaciones: any;
  UbicacionesFiltradas: any;
  Sedes: any;
  Dependencias: any;
  DatosTotales: any;
  Totales: Array<any>;
  fileDocumento: any[];
  uidDocumento: any;
  idDocumento: number[];
  validador: boolean;
  validador_soporte: number;
  Nombre: any;
  Validador: any;
  TodaysDate: any;
  Registrando: Boolean;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private toasterService: ToasterService,
    private completerService: CompleterService,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private userService: UserService,
  ) {
    this.TodaysDate = new Date();
    this.fileDocumento = [];
    this.Validador = [];
    this.uidDocumento = [];
    this.idDocumento = [];
  }

  ngOnInit() {
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findProveedores();
    this.listService.findEstadosActa();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.initForms();
    this.searchStr2 = new Array<string>();
  }

  private async initForms() {
    const data = [this.loadLists(), this.loadProveedores(), this.loadContratistas()];
    if (sessionStorage.Formulario_Registro == null) {
      await Promise.all(data);
      this.Cargar_Formularios();
    } else {
      const formulario = JSON.parse(sessionStorage.Formulario_Registro);
      (Swal as any).fire({
        type: 'warning',
        title: 'Registro sin completar',
        text: 'Existe un registro nuevo sin terminar, que desea hacer?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Seguir con anterior',
        cancelButtonText: 'Nuevo Registro, se eliminara el registro anterior',
      }).then(async (result) => {
        if (result.value) {
          await Promise.all(data);
          this.Cargar_Formularios2(formulario);
        } else {
          (Swal as any).fire({
            type: 'warning',
            title: 'Ultima Palabra?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Si, Nuevo Registro',
            cancelButtonText: 'No, Usar Anterior',
          }).then(async (result2) => {
            if (result2.value) {
              sessionStorage.removeItem('Formulario_Registro');
              await Promise.all(data);
              this.Cargar_Formularios();
            } else {
              await Promise.all(data);
              this.Cargar_Formularios2(formulario);
            }
          });
        }
      });
    }
  }
  public loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe(list => {
        list.listSedes[0] && list.listDependencias[0] && list.listEstadosActa[0] ? (
          this.Sedes = list.listSedes[0],
          this.Dependencias = list.listDependencias[0],
          this.Estados_Acta = list.listEstadosActa[0],
          this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre'),
          resolve()) : null;
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
  private filtroContratistas(nombre: string): TerceroCriterioContratista[] {
    if (nombre.length >= 4 && Array.isArray(this.Contratistas)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Contratistas.filter(contr => this.muestraContratista(contr).toLowerCase().includes(valorFiltrado));
    } else return [];
  }
  muestraContratista(contr: TerceroCriterioContratista): string {
    if (contr && contr.Identificacion && contr.Tercero) {
      return contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    } else if (contr && contr.Tercero) {
      return contr.Tercero.NombreCompleto;
    }
  }
  private cambiosContratista(control: AbstractControl): Observable<Partial<TerceroCriterioContratista>[]> {
    return control.valueChanges
      .pipe(
        startWith(''),
        map(val => typeof val === 'string' ? val : this.muestraContratista(val)),
        map(nombre => this.filtroContratistas(nombre)),
      );
  }
  private loadProveedores(): Promise<void> {
    return new Promise<void>(resolve => {
      this.tercerosHelper.getTercerosByCriterio('proveedor').toPromise().then(res => {
        this.Proveedores = res;
        resolve();
      });
    });
  }
  private filtroProveedores(nombre: string): Partial<TerceroCriterioProveedor>[] {
    if (nombre.length >= 4 && Array.isArray(this.Proveedores)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Proveedores.filter(prov => this.muestraProveedor(prov).toLowerCase().includes(valorFiltrado));
    } else return [];
  }
  muestraProveedor(prov: Partial<TerceroCriterioProveedor>): string {
    if (prov && prov.Identificacion && prov.Tercero) {
      return prov.Identificacion.Numero + ' - ' + prov.Tercero.NombreCompleto;
    } else if (prov && prov.Tercero) {
      return prov.Tercero.NombreCompleto;
    }
  }
  private cambiosProveedor(control: AbstractControl): Observable<Partial<TerceroCriterioProveedor>[]> {
    return control.valueChanges
      .pipe(
        startWith(''),
        map(val => typeof val === 'string' ? val : this.muestraProveedor(val)),
        map(nombre => this.filtroProveedores(nombre)),
      );
  }

  download(index) {

    const new_tab = window.open(this.fileDocumento[index].urlTemp, this.fileDocumento[index].urlTemp, '_blank');
    new_tab.onload = () => {
      new_tab.location = this.fileDocumento[index].urlTemp;
    };
    new_tab.focus();
  }

  onInputFileDocumento(event, index) {
    const max_size = 1;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {

        if (file.size < max_size * 1024000) {

          file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
          file.url = this.cleanURL(file.urlTemp);
          file.IdDocumento = 13; // tipo de documento (API documentos_crud)
          file.file = event.target.files[0];
          this.fileDocumento[index] = file;
          this.Validador[index] = true;
        } else {
          (Swal as any).fire({
            title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_title'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_placeholder'),
            type: 'warning',
          });
          this.Validador[index] = false;
        }
      } else {
        this.Validador[index] = false;
        this.pUpManager.showErrorAlert('error' + this.translate.instant('GLOBAL.error'));
      }
    }
  }

  clearFile(index) {
    (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').setValue('');
    this.fileDocumento[index] = undefined;
    this.Validador[index] = undefined;
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  Cargar_Formularios() {
    this.firstForm = this.fb.group({
      Formulario1: this.Formulario_1,
      Formulario2: this.fb.array([this.Formulario_2]),
    });
  }

  Cargar_Formularios2(transaccion_: any) {
    const Form2 = this.fb.array([]);
    for (const Soporte of transaccion_.Formulario2) {
      const Formulario__2 = this.fb.group({
        Consecutivo: [Soporte.Consecutivo],
        FechaSoporte: [Soporte.FechaSoporte ? new Date(Soporte.FechaSoporte.toString().split('Z')[0]) : ''],
        Soporte: ['', Validators.required],
      });
      Form2.push(Formulario__2);
    }

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Sede: [transaccion_.Formulario1.Sede],
        Dependencia: [transaccion_.Formulario1.Dependencia],
        Ubicacion: [transaccion_.Formulario1.Ubicacion],
        Contratista: [transaccion_.Formulario1.Contratista.Tercero ? transaccion_.Formulario1.Contratista : '',
          [Validators.required, this.validarTercero()]],
        Proveedor: [transaccion_.Formulario1.Proveedor.Tercero ? transaccion_.Formulario1.Proveedor : '',
          [this.validarTercero()]],
        }),
        Formulario2: Form2,
      });
    this.proveedoresFiltrados = this.cambiosProveedor(this.firstForm.get('Formulario1').get('Proveedor'));
    this.contratistasFiltrados = this.cambiosContratista(this.firstForm.get('Formulario1').get('Contratista'));
    this.Traer_Relacion_Ubicaciones(transaccion_.Formulario1.Ubicacion);
  }

  get Formulario_1(): FormGroup {
    const form1 = this.fb.group({
      Sede: [''],
      Dependencia: [''],
      Ubicacion: [''],
      Contratista: ['', [Validators.required, this.validarTercero()]],
      Proveedor: ['', [this.validarTercero()]],
    });
    this.contratistasFiltrados = this.cambiosContratista(form1.get('Contratista'));
    this.proveedoresFiltrados = this.cambiosProveedor(form1.get('Proveedor'));
    return form1;
  }
  get Formulario_2(): FormGroup {
    const form2 = this.fb.group({
      Consecutivo: [''],
      FechaSoporte: [''],
      Soporte: ['', Validators.required],
    });
    return form2;
  }

  addSoportes() {
    (this.firstForm.get('Formulario2') as FormArray).push(this.Formulario_2);
  }

  deleteSoportes(index: number) {
    (this.firstForm.get('Formulario2') as FormArray).removeAt(index);
  }

  addTab() {
    this.addSoportes();
    this.searchStr2.push();
    this.selected.setValue(this.firstForm.get('Formulario2').value.length - 1);
  }

  removeTab(i: number) {
    this.deleteSoportes(i);
    this.searchStr2.splice(i, 1);
    this.selected.setValue(i - 1);
  }

  async postSoporteNuxeo(files: any) {
    return new Promise(async (resolve, reject) => {
      files.forEach((file) => {
        file.Id = file.nombre;
        file.nombre = 'soporte_' + file.IdDocumento + '_acta_recibido';
        file.key = 'soporte_' + file.IdDocumento;
      });
      await this.nuxeoService.getDocumentos$(files, this.documentoService)
        .subscribe(response => {
          if (Object.keys(response).length === files.length) {
            files.forEach((file, index) => {
              this.uidDocumento[index] = file.uid;
              this.idDocumento[index] = response[file.key].Id;
              resolve(response[file.key].Id);
            });
          }
        }, error => {
          reject(error);
        });
    });
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  async onFirstSubmit() {
    this.Registrando = true;
    const start = async () => {
      await this.asyncForEach(this.fileDocumento, async (file) => {
        await this.postSoporteNuxeo([file]);
      });
    };
    await start();
    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, EstadoActa_t.Registrada);
    const Soportes = new Array<TransaccionSoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => {
      Soportes.push(this.Registrar_Soporte(soporte, Transaccion_Acta.ActaRecibido, index));
    });

    Transaccion_Acta.SoportesActa = Soportes;
    // console.log({Transaccion_Acta, validador: this.validador});
    if (this.validador === false) {
      this.Actas_Recibido.postTransaccionActa(Transaccion_Acta).subscribe((res: any) => {
        if (res !== null) {
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaTitle', { ID: res.ActaRecibido.Id }),
            text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Registrada', { ID: res.ActaRecibido.Id }),
          });
          sessionStorage.removeItem('Formulario_Registro');
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
    } else {
      (Swal as any).fire({
        type: 'error',
        title: 'Datos Erróneos',
        text: 'Existen datos no válidos',
      });
    }
  }

  Registrar_Acta(Datos: any): ActaRecibido {
    // console.log({Datos});
    const Acta_de_Recibido = new ActaRecibido();
    Acta_de_Recibido.Id = null;
    Acta_de_Recibido.Activo = true;
    Acta_de_Recibido.FechaCreacion = new Date();
    Acta_de_Recibido.FechaModificacion = new Date();
    Acta_de_Recibido.RevisorId = this.userService.getPersonaId();
    Acta_de_Recibido.UbicacionId = Datos.Ubicacion ? Datos.Ubicacion : null;
    Acta_de_Recibido.Observaciones = null;
    Acta_de_Recibido.PersonaAsignada = Datos.Contratista.Tercero.Id;
    return Acta_de_Recibido;
  }

  Registrar_Estado_Acta(Acta: ActaRecibido, Estado: number): HistoricoActa {

    const Historico_ = new HistoricoActa();

    Historico_.Id = null;
    Historico_.ActaRecibidoId = Acta;
    Historico_.Activo = true;
    Historico_.EstadoActaId = this.Estados_Acta.find(estado => estado.Id === Estado);
    Historico_.FechaCreacion = new Date();
    Historico_.FechaModificacion = new Date();

    return Historico_;
  }

  Registrar_Soporte(Datos: any, Acta: ActaRecibido, index: number): TransaccionSoporteActa {
    // console.log({Datos});

    const Soporte_Acta = new SoporteActa();
    const Transaccion = new TransaccionSoporteActa();

    Soporte_Acta.Id = null;
    Soporte_Acta.ActaRecibidoId = Acta;
    Soporte_Acta.Activo = true;
    Soporte_Acta.Consecutivo = Datos.Consecutivo;
    Soporte_Acta.FechaCreacion = new Date();
    Soporte_Acta.FechaModificacion = new Date();
    Soporte_Acta.FechaSoporte = Datos.Fecha_Factura ? Datos.Fecha_Factura : null;
    Soporte_Acta.ProveedorId = Datos.Proveedor ? Datos.Proveedor.Tercero.Id : null;
    Soporte_Acta.DocumentoId = this.idDocumento[index];

    Transaccion.SoporteActa = Soporte_Acta;
    // Transaccion.Elementos = this.Registrar_Elementos(Soporte_Acta);
    Transaccion.Elementos = <Elemento[]>[];
    this.validador = false;
    return Transaccion;
  }

  // Posible TODO: Esta función también se repite en los componentes
  // edición-acta-recibido y verificacion-acta-recibido
  // por tanto se podría dejar en un servicio aparte
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

  Revisar_Totales() {
    if (!this.revisorValido()) {
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

  usarLocalStorage() {
    sessionStorage.setItem('Formulario_Registro', JSON.stringify(this.firstForm.value));
  }

  Traer_Relacion_Ubicaciones(loadInicial: string) {
    const sede = this.firstForm.get('Formulario1').get('Sede').value;
    const dependencia = this.firstForm.get('Formulario1').get('Dependencia').value;
    if (this.firstForm.get('Formulario1').get('Sede').valid && this.firstForm.get('Formulario1').get('Dependencia').valid &&
      sede !== undefined && dependencia !== undefined && this.Sedes && this.Dependencias) {
      this.UbicacionesFiltradas = [];
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          if (isObject(res[0].Relaciones)) {
            this.firstForm.patchValue({ Formulario1: { Ubicacion: loadInicial ? loadInicial : '' } });
            this.UbicacionesFiltradas = res[0].Relaciones;
          }
        });
      }
    }
  }

  clear() {
    this.firstForm.get('Formulario2')['controls'][0].get('Fecha_Factura').patchValue('');
    this.firstForm.get('Formulario2')['controls'][0].get('Fecha_Factura').setErrors(null);
  }
  private validarTercero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof(valor) === 'string' && valor.length < 4 && valor !== '' ? true : false;
      const checkInvalidString = typeof(valor) === 'string' && valor !== '' ? true : false;
      const checkInvalidTercero = typeof(valor) === 'object' && !valor.Tercero ? true : false;
      return checkStringLength ? {errorLongitudMinima: true} :
      checkInvalidString || checkInvalidTercero ? {terceroNoValido: true} : null;
    };
  }

}
