import { AuthInterceptor } from './../../../@core/_Interceptor/auth.Interceptor';
import { Formulario } from './../edicion-acta-recibido/datos_locales';
import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Subscription, combineLatest, Observable } from 'rxjs';
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
import { ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';

import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
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
import { Console } from 'console';
import { INVALID } from '@angular/forms/src/model';
import { NbDateService } from '@nebular/theme';
import { RolUsuario_t as Rol, PermisoUsuario_t as Permiso } from '../../../@core/data/models/roles/rol_usuario';

@Component({
  selector: 'ngx-acta-especial',
  templateUrl: './acta-especial.component.html',
  styleUrls: ['./acta-especial.component.scss'],
})

export class ActaEspecialComponent implements OnInit {

  config: ToasterConfig;
  searchStr: string;
  searchStr2: Array<string>;
  searchStr3: string;
  protected dataService: CompleterData;
  protected dataService2: CompleterData;
  protected dataService3: CompleterData;

  // Mensajes de error
  errMess: any;
  private sub: Subscription;
  errores: Map<string, boolean>;

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
  Elementos__Soporte: Array<any>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Proveedores: any;
  Ubicaciones: any;
  UbicacionesForm: any;
  DependenciaV: any;
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
  DatosElementos: Array<any>;
  Registrando: Boolean;
  Unidades: any;

  private SoporteElementosValidos: Array<boolean>;
  private elementosValidos: boolean = false;

  permisos: {
    Acta: Permiso,
    Elementos: Permiso,
  } = {
    Acta: Permiso.Ninguno,
    Elementos: Permiso.Ninguno,
  };

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private toasterService: ToasterService,
    private completerService: CompleterService,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private userService: UserService,
    private dateService: NbDateService<Date>,
  ) {
    this.fileDocumento = [];
    this.Validador = [];
    this.uidDocumento = [];
    this.idDocumento = [];
    this.Elementos__Soporte = new Array<any>();
    this.errores = new Map<string, boolean>();
  }

  ngOnInit() {
    this.listService.findUbicaciones();
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findUnidades();
    this.listService.findProveedores();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.TodaysDate = this.dateService.today();
    this.loadLists();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.searchStr2 = new Array<string>();
    if (sessionStorage.Formulario_Acta_Especial == null) {
      this.Cargar_Formularios();
    } else {
      const formulario = JSON.parse(sessionStorage.Formulario_Acta_Especial);
      let elementos;
      if (sessionStorage.Elementos_Acta_Especial === []) {
        elementos = [];
      } else {
        elementos = JSON.parse(sessionStorage.Elementos_Acta_Especial);
      }
      (Swal as any).fire({
        type: 'warning',
        title: 'Registro sin completar',
        text: 'Existe un registro nuevo sin terminar, que desea hacer?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Seguir con anterior',
        cancelButtonText: 'Nuevo Registro, se eliminara el registro anterior',
      }).then((result) => {
        if (result.value) {
          this.cargar(formulario, elementos);
        } else {
          (Swal as any).fire({
            type: 'warning',
            title: 'Ultima Palabra?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Si, Nuevo Registro',
            cancelButtonText: 'No, Usar Anterior',
          }).then((result2) => {
            if (result2.value) {
              sessionStorage.removeItem('Formulario_Acta_Especial');
              sessionStorage.removeItem('Elementos_Acta_Especial');
              this.Cargar_Formularios();
            } else {
              this.cargar(formulario, elementos);
            }
          });
        }
      });
    }
    if (!this.userService.getPersonaId()) {
      this.errores.set('terceros', true);
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Ubicaciones = list.listUbicaciones[0];
        this.Sedes = list.listSedes[0];
        this.Dependencias = list.listDependencias[0];
        this.Estados_Acta = list.listEstadosActa[0];
        this.Estados_Elemento = list.listEstadosElemento[0];
        this.Tipos_Bien = list.listTipoBien[0];
        this.Unidades = list.listUnidades[0];
        this.Proveedores = list.listProveedores[0];
        this.dataService2 = this.completerService.local(this.Proveedores, 'compuesto', 'compuesto');
        this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
      },
    );
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  Cargar_Formularios() {

    this.firstForm = this.fb.group({
      Formulario1: this.Formulario_1,
      Formulario2: this.fb.array([this.Formulario_2]),
      Formulario3: this.Formulario_3,
    });
    this.SoporteElementosValidos = new Array<boolean>(1);
  }

  Cargar_Formularios2(transaccion_: any, elementos_: any) {
    const Form2 = this.fb.array([]);
    for (const Soporte of transaccion_.Formulario2) {
      const Formulario__2 = this.fb.group({
        Soporte: [Soporte.Soporte, Validators.required],
      });
      Form2.push(Formulario__2);
    }
    this.Elementos__Soporte = elementos_;
    this.SoporteElementosValidos = new Array<boolean>(elementos_.length);

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [''],
        Sede: [transaccion_.Formulario1.Sede, Validators.required],
        Dependencia: [transaccion_.Formulario1.Dependencia, Validators.required],
        Ubicacion: [transaccion_.Formulario1.Ubicacion, Validators.required],
      }),
      Formulario2: Form2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [transaccion_.Formulario3.Datos_Adicionales],
      }),
    });
    const sede = this.firstForm.get('Formulario1').get('Sede').value;
    const dependencia = this.firstForm.get('Formulario1').get('Dependencia').value;
    if (this.firstForm.get('Formulario1').get('Sede').valid || this.firstForm.get('Formulario1').get('Dependencia').valid) {
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          if (Object.keys(res[0]).length !== 0) {
            this.UbicacionesForm = res[0].Relaciones;
            this.DependenciaV = this.firstForm.get('Formulario1').get('Dependencia').value;
          }
        });
      }
    }
  }

  get Formulario_1(): FormGroup {
    return this.fb.group({
      Sede: ['', Validators.required],
      Dependencia: ['', Validators.required],
      Ubicacion: ['', Validators.required],
    });
  }
  get Formulario_2(): FormGroup {
    return this.fb.group({
      Id: [0],
      Soporte: ['', Validators.required],
      Elementos: this.fb.array([this.Elementos]),
    });
  }
  get Formulario_3(): FormGroup {
    return this.fb.group({
      Datos_Adicionales: ['', Validators.required],
    });
  }

  get Elementos(): FormGroup {
    return this.fb.group({
      TipoBienId: [''],
      SubgrupoCatalogoId: [''],
      Nombre: [''],
      Cantidad: ['0'],
      Marca: [''],
      Serie: [''],
      UnidadMedida: [''],
      ValorUnitario: ['0'],
      Subtotal: ['0'],
      Descuento: ['0'],
      PorcentajeIvaId: [''],
      ValorIva: ['0'],
      ValorTotal: ['0'],
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
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, EstadoActa_t.Aceptada);
    const Soportes = new Array<TransaccionSoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => {
      Soportes.push(this.Registrar_Soporte(soporte, this.Elementos__Soporte[index], Transaccion_Acta.ActaRecibido));

    });
    Transaccion_Acta.SoportesActa = Soportes;
    this.Actas_Recibido.postTransaccionActa(Transaccion_Acta).subscribe((res: any) => {
      if (res !== null) {
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaTitle', {ID: res.ActaRecibido.Id}),
          text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Registrada', {ID: res.ActaRecibido.Id}),
        });
        sessionStorage.removeItem('Formulario_Acta_Especial');
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

  Registrar_Acta(Datos: any): ActaRecibido {
    const Acta_de_Recibido = new ActaRecibido();
    Acta_de_Recibido.Id = null;
    Acta_de_Recibido.Activo = true;
    Acta_de_Recibido.FechaCreacion = new Date();
    Acta_de_Recibido.FechaModificacion = new Date();
    Acta_de_Recibido.RevisorId = this.userService.getPersonaId();
    Acta_de_Recibido.UbicacionId = parseFloat(Datos.Formulario1.Ubicacion);
    Acta_de_Recibido.Observaciones = Datos.Formulario3.Datos_Adicionales;

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

  Registrar_Soporte(Datos: any, Elementos_: any, __: ActaRecibido): TransaccionSoporteActa {
    const Soporte_Acta = new SoporteActa();
    const Transaccion = new TransaccionSoporteActa();
    Soporte_Acta.Id = null;
    Soporte_Acta.ActaRecibidoId = __;
    Soporte_Acta.Activo = true;
    Soporte_Acta.Consecutivo = '';
    Soporte_Acta.FechaCreacion = new Date();
    Soporte_Acta.FechaModificacion = new Date();
    Soporte_Acta.FechaSoporte = null;
    Soporte_Acta.ProveedorId = 0;
    Soporte_Acta.DocumentoId = this.idDocumento[0];
    Transaccion.SoporteActa = Soporte_Acta;
    Transaccion.Elementos = this.Registrar_Elementos(Elementos_, Soporte_Acta);
    return Transaccion;
  }

  Registrar_Elementos(Datos: any, Soporte: SoporteActa): Array<Elemento> {
    const Elementos_Soporte = new Array<Elemento>();
    for (const datos of Datos) {

      const Elemento__ = new Elemento;
      const valorTotal = (parseFloat(this.Pipe2Number(datos.Subtotal)) - parseFloat(this.Pipe2Number(datos.Descuento)));

      Elemento__.Id = parseFloat(Datos.Id);
      Elemento__.Nombre = datos.Nombre;
      Elemento__.Cantidad = parseFloat(this.Pipe2Number(datos.Cantidad));
      Elemento__.Marca = datos.Marca;
      Elemento__.Serie = datos.Serie;
      Elemento__.UnidadMedida = this.Unidades.find(unidad => unidad.Id === parseFloat(datos.UnidadMedida)).Id;
      Elemento__.ValorUnitario = parseFloat(this.Pipe2Number(datos.ValorUnitario));
      Elemento__.Subtotal = parseFloat(this.Pipe2Number(datos.Subtotal));
      Elemento__.Descuento = parseFloat(this.Pipe2Number(datos.Descuento));
      Elemento__.ValorTotal = valorTotal;
      Elemento__.PorcentajeIvaId = parseFloat(datos.PorcentajeIvaId);
      Elemento__.ValorIva = parseFloat(this.Pipe2Number(datos.ValorIva));
      Elemento__.ValorFinal = parseFloat(this.Pipe2Number(datos.ValorTotal));
      Elemento__.SubgrupoCatalogoId = parseFloat(datos.SubgrupoCatalogoId);
      Elemento__.Verificado = false;
      Elemento__.TipoBienId = this.Tipos_Bien.find(bien => bien.Id === parseFloat(datos.TipoBienId));
      Elemento__.EstadoElementoId = this.Estados_Acta.find(estado => estado.Id === 1);
      Elemento__.SoporteActaId = Soporte;
      Elemento__.Activo = true;
      Elemento__.FechaCreacion = new Date();
      Elemento__.FechaModificacion = new Date();
      Elementos_Soporte.push(Elemento__);
    }
    return Elementos_Soporte;
  }

  Pipe2Number(any: string) {
    return any;
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
  getGranSubtotal() {
    if (this.Totales !== []) {
      return this.Totales.map(t => t.Subtotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    } else {
      return '0';
    }
  }
  getGranDescuentos() {

    if (this.Totales !== []) {
      return this.Totales.map(t => t.Descuento).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    } else {
      return '0';
    }
  }
  getGranValorIva() {

    if (this.Totales !== []) {
      return this.Totales.map(t => t.ValorIva).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    } else {
      return '0';
    }
  }
  getGranTotal() {

    if (this.Totales !== []) {
      return this.Totales.map(t => t.ValorTotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    } else {
      return '0';
    }
  }

  setElementosValidos(soporte: number, valido: boolean): void {
    this.SoporteElementosValidos[soporte] = valido;
    this.validaSoportes();
  }

  // TODO: De ser necesario, agregar más validaciones asociadas a cada soporte
  private validaSoportes(): void {
    this.elementosValidos = (
      Array.isArray(this.Elementos__Soporte)
      && this.Elementos__Soporte.length // Al menos un soporte
      && this.Elementos__Soporte.every((sop, idx) => (
        Array.isArray(sop)
        && sop.length // Al menos un elemento
        && this.SoporteElementosValidos[idx]
      ))
    );
    if (this.elementosValidos) {
      this.errores.delete('clases');
    } else {
      this.errores.set('clases', true);
    }
  }

  desactivarEnvio(): boolean {
    const error = !(
      this.firstForm.get('Formulario1').valid
      && this.firstForm.get('Formulario2').valid // this.Elementos__Soporte
      && this.firstForm.get('Formulario3').valid
    );

    if (error) {
      this.errores.set('formularios', true);
    } else {
      this.errores.delete('formularios');
    }

    return error || !this.elementosValidos;
  }

  Revisar_Totales2() {
    if (!this.revisorValido()) {
      return;
    }
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.DatosVeridicosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.DatosVeridicos'),
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
    sessionStorage.setItem('Formulario_Acta_Especial', JSON.stringify(this.firstForm.value));
    sessionStorage.setItem('Elementos_Acta_Especial', JSON.stringify(this.Elementos__Soporte));
  }

  cargar(formulario, elementos) {
    if (this.Sedes && this.Dependencias) {
      this.Cargar_Formularios2(formulario, elementos);
    } else {
      setTimeout(() => { this.cargar(formulario, elementos); }, 100);
    }
  }

  Traer_Relacion_Ubicaciones() {
    const sede = this.firstForm.get('Formulario1').get('Sede').value;
    const dependencia = this.firstForm.get('Formulario1').get('Dependencia').value;
    if (this.DependenciaV !== dependencia) {
      this.firstForm.patchValue({
        Formulario1: {
          Ubicacion: '',
        },
      });
    }
    if (this.firstForm.get('Formulario1').get('Sede').valid || this.firstForm.get('Formulario1').get('Dependencia').valid) {
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          if (Object.keys(res[0]).length !== 0) {
            this.UbicacionesForm = res[0].Relaciones;
            this.DependenciaV = this.firstForm.get('Formulario1').get('Dependencia').value;
          }
        });
      }
    }
  }

  getPermisoEditar(p: Permiso): boolean {
    return true;
  }

  ver2 (event: any) {
    this.DatosTotales = event;
    this.Totales = new Array<any>(this.DatosTotales);
    this.usarLocalStorage();
  }

  ver(event: any) {
    this.DatosElementos = event;
    this.Elementos__Soporte[0] = this.DatosElementos;
    this.usarLocalStorage();
  }

  onInputFileDocumento(event, index) {
    // console.log(event.target.files);
    // console.log(event.srcElement.files);
    const max_size = 1;

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {

        if (file.size < max_size * 1024000) {

          file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
          file.url = this.cleanURL(file.urlTemp);
          file.IdDocumento = 13; // tipo de documento (API documentos_crud)
          file.file = event.target.files[0];
          (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').setValue(file.name);
          this.fileDocumento[index] = file;
          this.Validador[index] = true;
          this.uidDocumento[index] = undefined;

        } else {
          (Swal as any).fire({
            title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_title'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_placeholder'),
            type: 'warning',
          });
          this.Validador[index] = false;
        }
        // console.log(file);
        // console.log(this.fileDocumento);

      } else {
        this.Validador[index] = false;
        this.pUpManager.showErrorAlert('error' + this.translate.instant('GLOBAL.error'));
      }
    }
  }
  download(index) {

    const new_tab = window.open(this.fileDocumento[index].urlTemp, this.fileDocumento[index].urlTemp, '_blank');
    new_tab.onload = () => {
      new_tab.location = this.fileDocumento[index].urlTemp;
    };
    new_tab.focus();
  }
  downloadFile(id_documento: any) {
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
  clearFile(index) {
    (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').setValue('');
    this.fileDocumento[index] = undefined;
    this.Validador[index] = undefined;
    this.uidDocumento[index] = undefined;
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

}
