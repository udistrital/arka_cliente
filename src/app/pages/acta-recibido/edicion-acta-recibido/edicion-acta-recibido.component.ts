import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { MatTable } from '@angular/material';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import { TerceroCriterioContratista, TerceroCriterioProveedor } from '../../../@core/data/models/terceros_criterio';
import Swal from 'sweetalert2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CompleterData, CompleterService } from 'ng2-completer';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { PopUpManager } from '../../../managers/popUpManager';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../@core/data/users.service';
import { RolUsuario_t as Rol, PermisoUsuario_t as Permiso } from '../../../@core/data/models/roles/rol_usuario';
import { permisosSeccionesActas } from './reglas';
import { isObject } from 'rxjs/internal-compatibility';
import { TipoActa } from '../../../@core/data/models/acta_recibido/tipo_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';

@Component({
  selector: 'ngx-edicion-acta-recibido',
  templateUrl: './edicion-acta-recibido.component.html',
  styleUrls: ['./edicion-acta-recibido.component.scss'],
})
export class EdicionActaRecibidoComponent implements OnInit {

  searchStr: string;
  searchStr2: string[];
  searchStr3: string;
  private Contratistas: TerceroCriterioContratista[];
  contratistasFiltrados: Observable<TerceroCriterioContratista[]>;
  private Proveedores: Partial<TerceroCriterioProveedor>[];
  proveedoresFiltrados: Observable<Partial<TerceroCriterioProveedor>[]>;

  // Mensajes de error
  errMess: any;
  private sub: Subscription;
  errores: Map<string, boolean>;

  // Decorador para renderizar los cambios en las tablas de elementos
  @ViewChildren(MatTable) _matTable: QueryList<MatTable<any>>;

  // Variables de Formulario
  firstForm: FormGroup;
  @ViewChild('fform') firstFormDirective;
  carga_agregada: boolean;
  index;
  selected = new FormControl(0);
  _Acta_Id: number;
  fileDocumento: any[] = [];
  idDocumento: any[] = [];

  // Tablas parametricas

  @Input('Id_Acta')
  set name2(id: any) {
    if (id !== '') {
      this._Acta_Id = id;
      // console.log('ok');
    }
    // console.log(this._Acta_Id);

  }


  @Input('estado') estadoActa: string;
  actaRegistrada: boolean;
  Estados_Acta: any;
  Estados_Elemento: any;

  // Modelos

  DatosElementos: Array<any>;
  TodaysDate: any;
  UbicacionesFiltradas: any;
  Sedes: any;
  Dependencias: any;
  DatosTotales: any;
  dataService3: CompleterData;
  guardando: boolean = false;
  sedeDependencia: any;
  private actaCargada: boolean = false;
  private SoporteElementosValidos: Array<boolean>;
  private elementosValidos: boolean = false;
  validarElementos: boolean;
  Acta: TransaccionActaRecibido;
  totales: any;
  minLength: number = 4;
  cargarTab: boolean;
  selectedTab: number = 0;
  sizeSoporte: number = 5;

  permisos: {
    Acta: Permiso,
    Elementos: Permiso,
  } = {
      Acta: Permiso.Ninguno,
      Elementos: Permiso.Ninguno,
    };

  accion: {
    envHabilitado: boolean,
    envTexto: string,
    envContratista: string,
    envContratistaHabilitado: boolean,
  } = {
      envHabilitado: false,
      envTexto: '',
      envContratista: '',
      envContratistaHabilitado: false,
    };

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private completerService: CompleterService,
    private store: Store<IAppState>,
    private confService: ConfiguracionService,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private userService: UserService,
  ) {
    this.Contratistas = [];
    this.Proveedores = [];
    this.errores = new Map<string, boolean>();
    this.fileDocumento = [];
    this.idDocumento = [];
    this.searchStr2 = new Array<string>();
    this.DatosElementos = new Array<any>();
    this.TodaysDate = new Date();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.defineSiHayQueValidarElementosParaEnviar();
    this.cargaPermisos();
    this.errores = new Map<string, boolean>();
    this.Acta = new TransaccionActaRecibido;
    this.initForms();
    this.actaRegistrada = this.estadoActa === 'Registrada' ? true : false;
  }

  private async initForms() {
    const data = [this.loadLists(), this.loadProveedores(), this.loadContratistas(), this.cargaActa()];
    await Promise.all(data);
    this.Cargar_Formularios(this.Acta);
    this.actaCargada = true;
  }
  // Los permisos en cada sección dependen del estado del acta y del rol.
  cargaPermisos() {
    // console.log({'this.estadoActualActa': this.estadoActa});

    this.permisosRoles_eventos();

    // Modificar/Ver parte superior (Datos basicos y Soportes)
    let permisoActa: Permiso;

    // Modificar/Ver parte inferior (Elementos asociados a cada soporte)
    let permisoElementos: Permiso;

    [
      permisoActa,
      permisoElementos,
    ] = [
      'Acta',
      'Elementos',
    ].map(seccion => this.permisosRoles_EstadoSeccion(this.estadoActa, seccion))
      .map(permisosSeccion => {
        return this.confService.getAccion(permisosSeccion.PuedenModificar) ? Permiso.Modificar : (
          this.confService.getAccion(permisosSeccion.PuedenVer) ? Permiso.Ver : Permiso.Ninguno
        );
      });

    // Guardar permisos requeridos para cada parte del componente
    // console.log({'permisoActa': Permiso[permisoActa], 'permisoElementos': Permiso[permisoElementos]});
    this.permisos.Acta = permisoActa;
    this.permisos.Elementos = permisoElementos;
    Object.freeze(this.permisos);
  }

  // Devuelve un objeto en que el nombre de cada propiedad es un permiso, y
  // los valores de cada propiedad son los roles que tienen dicho permiso.
  private permisosRoles_EstadoSeccion(estado: string, seccion: string) {
    let PuedenModificar: string = '';
    let PuedenVer: string = '';

    permisosSeccionesActas.filter(PermSecciones => seccion === PermSecciones.Seccion)
      .forEach(PermSeccion => {
        // Si no hay secciones duplicadas, debería entrar solo una vez
        PermSeccion.Permisos.filter(PermEstados => estado === PermEstados.Estado)
          .forEach(PermEstado => {
            // Si no hay estados duplicados, debería entrar solo una vez
            PuedenModificar = PermEstado.PuedenModificar;
            PuedenVer = PermEstado.PuedenVer;
          });
      });

    return { PuedenModificar, PuedenVer };
  }

  getPermisoEditar(p: Permiso): boolean {
    return p === Permiso.Modificar;
  }
  getPermisoVer(p: Permiso): boolean {
    return p === Permiso.Ver;
  }

  // Habilitar/deshabilitar eventos en función de los roles
  private permisosRoles_eventos() {

    // Pueden enviar a Proveedor
    const envioProveedor =
      this.confService.getAccion('edicionActaRecibidoCambioAElaboracion')
      && ['Registrada']
        .some(est => this.estadoActa === est);

    // Pueden enviar a Validacion
    const envioValidar =
      this.confService.getAccion('edicionActaRecibidoCambioARevision')
      && ['En Elaboracion', 'En Modificacion']
        .some(est => this.estadoActa === est);

    this.accion.envHabilitado = envioProveedor || envioValidar;
    this.accion.envContratistaHabilitado = envioProveedor;
    // Texto del botón según el estado
    if (envioProveedor) {
      this.accion.envTexto = this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.EnviarProveedorButton');
      this.accion.envContratista = this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.EnviarContratistaButton');
    } else if (envioValidar) {
      this.accion.envTexto = this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.VerificacionButton');
      this.accion.envContratistaHabilitado = false;
    }
  }

  private defineSiHayQueValidarElementosParaEnviar() {
    // Estados de Actas que requieren que los elementos
    // tengan sus clases asignadas
    const estadosAntesDeRevision = [
      'En Elaboracion',
      'En Modificacion',
      'Aceptada',
    ];
    const validar = estadosAntesDeRevision
      .some(est => this.estadoActa === est);
    this.validarElementos = validar;
    if (!validar) {
      this.elementosValidos = true;
    }
    // console.log({elemValiudos: this.elementosValidos});
  }

  private cargaActa(): Promise<void> {
    return new Promise<void>(resolve => {
      this.Actas_Recibido.getTransaccionActa(this._Acta_Id, false).subscribe(async Acta => {
        this.Acta = Acta;
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

  private loadProveedores(): Promise<void> {
    return new Promise<void>(resolve => {
      this.tercerosHelper.getTercerosByCriterio('proveedor').toPromise().then(res => {
        this.Proveedores = res;
        resolve();
      });
    });
  }

  private loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe(list => {
        this.Sedes = list.listSedes[0],
          this.Dependencias = list.listDependencias[0],
          this.Estados_Acta = list.listEstadosActa[0],
          this.Estados_Elemento = list.listEstadosElemento[0],
          this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre'),
          !this.userService.getPersonaId() ? this.errores.set('terceros', true) : null,

          (this.Sedes && this.Sedes.length > 0 && this.Dependencias && this.Dependencias.length > 0 &&
            this.Estados_Elemento && this.Estados_Elemento.length > 0 &&
            this.Estados_Acta && this.Estados_Acta.length > 0 &&
            this.Estados_Elemento && this.Estados_Elemento.length > 0) ? resolve() : null;
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
    // console.log(contr);
    if (contr && contr.Identificacion) {
      return contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    } else {
      if (contr) {
        return contr.Tercero.NombreCompleto;
      }
    }
  }

  private filtroProveedores(nombre: string): Partial<TerceroCriterioProveedor>[] {
    // console.log('filtroProveedores');
    if (nombre.length >= 4 && Array.isArray(this.Proveedores)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Proveedores.filter(prov => this.muestraProveedor(prov).toLowerCase().includes(valorFiltrado));
    } else return [];
  }
  muestraProveedor(prov: Partial<TerceroCriterioProveedor>): string {
    if (prov) {
      const str = prov.Identificacion ? prov.Identificacion.Numero + ' - ' : '';
      return str + prov.Tercero.NombreCompleto;
    }
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  EnviarEmail(cedula: String) {

    let idtercero: any = '';
    this.Actas_Recibido.getIdDelTercero(cedula).subscribe((res: any) => {
      if (res == null) {
        return '';
      }
      idtercero = res[0].TerceroId.Id;

      this.Actas_Recibido.getEmailTercero(idtercero).subscribe((restercero: any) => {
        if (restercero == null) {
          return '';
        }
        if (restercero[0].Dato) {
          const objemail = JSON.parse(restercero[0].Dato);
          const objetomail = {
            'to': [objemail.Data],
            'cc': [],
            'bcc': [],
            'subject': 'El subject pendiente por definir',
            'TemplateName': 'invitacion_par_evaluador.html',
            'TemplateData': {
              'Destinatario': 'Nombre docente',
              'Remitente': 'Oficina de docencia',
              'OtroDato': 'x_x',
            },
          };
          this.Actas_Recibido.sendCorreo(objetomail).subscribe((resemail: any) => {
            if (resemail == null) { }
          });
        }
      });

    });

  }

  async Cargar_Formularios(transaccion_: TransaccionActaRecibido) {

    transaccion_.UltimoEstado.UbicacionId ? await this.getSedeDepencencia(transaccion_.UltimoEstado.UbicacionId) : null;
    const ar = transaccion_.ActaRecibido.TipoActaId.Id === 1;
    const Form2 = this.fb.array([]);
    transaccion_.SoportesActa.forEach((Soporte, index) => {
      const formulario2 = this.fb.group({
        Id: [Soporte.Id],
        Consecutivo: [
          {
            value: Soporte.Consecutivo,
            disabled: !this.getPermisoEditar(this.permisos.Acta),
          },
          { validators:  !ar || this.actaRegistrada ? [] : [Validators.required] },
        ],
        Fecha_Factura: [
          {
            value: new Date(Soporte.FechaSoporte) > new Date('1945') ?
              new Date(Soporte.FechaSoporte.toString().split('Z')[0]) : '',
            disabled: !this.getPermisoEditar(this.permisos.Acta),
          },
          { validators:  !ar ? [] : this.checkDate() }],
        Soporte: [Soporte.DocumentoId ? Soporte.DocumentoId : '', Validators.required],
      });
      this.fileDocumento.push(undefined);
      this.idDocumento.push(Soporte.DocumentoId);

      Form2.push(formulario2);
    });

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [transaccion_.ActaRecibido.Id],
        Sede: [
          {
            value: this.sedeDependencia ? this.sedeDependencia.sede : '',
            disabled: !this.getPermisoEditar(this.permisos.Acta),
          },
          { validators: this.actaRegistrada ? [] : [Validators.required] },
        ],
        Dependencia: [ this.sedeDependencia ? this.sedeDependencia.dependencia : '',
        { validators: this.actaRegistrada ? [] : [Validators.required] }],
        Ubicacion: [
          {
            value: transaccion_.UltimoEstado.UbicacionId === 0 ? '' : transaccion_.UltimoEstado.UbicacionId,
            disabled: !this.getPermisoEditar(this.permisos.Acta),
          },
          { validators: this.actaRegistrada ? [] : [Validators.required] },
        ],
        Contratista: [
          {
            value: (() => {
              const criterio = (contratista: TerceroCriterioContratista) =>
                contratista &&
                contratista.Tercero.Id === transaccion_.UltimoEstado.PersonaAsignadaId;
              return this.Contratistas.some(criterio) ? this.Contratistas.find(criterio) : '';
            })(),
            disabled: !this.getPermisoEditar(this.permisos.Acta),
          }, ar ? [Validators.required, this.validarTercero()] : [],
        ],
        Proveedor: [
          {
            value: transaccion_.UltimoEstado.ProveedorId === 0 ? null :
              this.Proveedores.find((proveedor) =>
                proveedor.Tercero.Id === transaccion_.UltimoEstado.ProveedorId),
            disabled: !this.getPermisoEditar(this.permisos.Acta),
          },
          { validators: !ar ? [] : this.actaRegistrada ? [this.validarTercero()] : [Validators.required, this.validarTercero()] },
        ],
      }),
      Formulario2: Form2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [transaccion_.UltimoEstado.Observaciones],
      }),
    }, { validators: this.checkValidness });

    this.initTerceros();
    this.carga_agregada = true;
  }

  private initTerceros() {
    this.proveedoresFiltrados = this.firstForm.get('Formulario1').get('Proveedor').valueChanges.pipe(
      startWith(''),
      map(val => typeof val === 'string' ? val : this.muestraProveedor(val)),
      map(nombre => this.filtroProveedores(nombre)),
    );

    this.contratistasFiltrados = this.firstForm.get('Formulario1').get('Contratista').valueChanges.pipe(
      startWith(''),
      map(val => typeof val === 'string' ? val : this.muestraContratista(val)),
      map(nombre => this.filtroContratistas(nombre)),
    );
  }

  async getSedeDepencencia(ubicacionId: number): Promise<void> {

    return new Promise<void>(resolve => {
      this.Actas_Recibido.getSedeDependencia(ubicacionId).toPromise().then(res => {

        const espacioFisico = res[0].EspacioFisicoId.Codigo.substring(0, 4);
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

  Traer_Relacion_Ubicaciones(sede, dependencia) {
    sede = (sede) ? sede : this.firstForm.get('Formulario1').get('Sede').value;
    dependencia = (dependencia) ? dependencia : this.firstForm.get('Formulario1').get('Dependencia').value;
    if (this.firstForm.get('Formulario1').get('Sede').valid && this.firstForm.get('Formulario1').get('Dependencia').valid &&
      sede !== undefined && dependencia !== undefined && this.Sedes && this.Dependencias) {
      this.UbicacionesFiltradas = [];
      this.carga_agregada ? this.firstForm.patchValue({ Formulario1: { Ubicacion: '' } }) : null;
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
        if (isObject(res[0].Relaciones)) {
          this.UbicacionesFiltradas = res[0].Relaciones;
        }
      });
    }
  }

  get Formulario_2(): FormGroup {
    this.fileDocumento.push(undefined);
    this.idDocumento.push(undefined);
    return this.fb.group({
      Id: [0],
      Proveedor: [''],
      Consecutivo: [''],
      Fecha_Factura: [''],
      Soporte: ['', Validators.required],
    });
  }

  private download(index) {
    const new_tab = window.open(this.fileDocumento[index].urlTemp, this.fileDocumento[index].urlTemp, '_blank');
    new_tab.onload = () => {
      new_tab.location = this.fileDocumento[index].urlTemp;
    };
    new_tab.focus();
  }

  private downloadFile(id_documento: any) {
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

  public getFile(i: number) {
    this.idDocumento[i] ? this.downloadFile(this.idDocumento[i]) : this.download(i);
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
          (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').setValue(file.name);
          this.fileDocumento[index] = file;
          this.idDocumento[index] = undefined;

        } else {
          (Swal as any).fire({
            title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.ErrorSizeSoporteTitle'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.ErrorSizeSoporteText', { SIZE: this.sizeSoporte }),
            type: 'warning',
          });
        }
        // console.log(file);
        // console.log(this.fileDocumento);

      } else {
        this.pUpManager.showErrorAlert('error' + this.translate.instant('GLOBAL.error'));
      }
    }
  }
  clearFile(index) {
    (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').setValue('');
    this.fileDocumento[index] = undefined;
    this.idDocumento[index] = undefined;
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  addSoportes() {
    (this.firstForm.get('Formulario2') as FormArray).push(this.Formulario_2);
    this.SoporteElementosValidos.push(false);
  }

  tab() {
    if (this.cargarTab) {
      this.selectedTab = this.firstForm.get('Formulario2').value.length - 1;
      this.cargarTab = false;
    }
  }

  addTab($event) {
    if ($event === this.firstForm.get('Formulario2').value.length && !this.cargarTab) {
      (this.firstForm.get('Formulario2') as FormArray).push(this.Formulario_2);
      this.selectedTab = this.firstForm.get('Formulario2').value.length;
      this.cargarTab = true;
    }
  }

  removeTab(i: number) {
    this.selectedTab = i - 1;
    (this.firstForm.get('Formulario2') as FormArray).removeAt(i);
    this.fileDocumento.splice(i, 1);
    this.idDocumento.splice(i, 1);
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
              const a = this.idDocumento.findIndex((doc) => doc === undefined);
              const b = this.idDocumento.find(id => id === response[file.key].Id);
              if (a >= 0 && !b) {
                this.idDocumento[a] = response[file.key].Id;
                this.fileDocumento[a] = undefined;
              }
              resolve();
            });
          }
        }, error => {
          reject(error);
        });
    });
  }

  // Envío (a (proveedor y/o contratista)/revisor) o guardado
  private async onFirstSubmit(siguienteEtapa: boolean = false, enviara: number = 0) {
    const filestoPost = this.fileDocumento.filter(file => file !== undefined);
    this.guardando = true;
    const start = async () => {
      await this.asyncForEach(filestoPost, async (file) => {
        await this.postSoporteNuxeo([file]);
      });
    };
    await start();
    const transaccionActa = new TransaccionActaRecibido();

    transaccionActa.ActaRecibido = this.generarActa();
    let nuevoEstado: EstadoActa_t;
    if (siguienteEtapa) {
      nuevoEstado = (this.estadoActa === 'Registrada') ? EstadoActa_t.EnElaboracion : EstadoActa_t.EnVerificacion;
    } else {
      nuevoEstado = this.Estados_Acta.find(estado => estado.Nombre === this.estadoActa).Id; // el nuevo estado es el mismo
    }

    transaccionActa.UltimoEstado = this.generarEstadoActa(nuevoEstado);
    transaccionActa.Elementos = this.generarElementos();

    const Soportes: SoporteActa[] = (this.firstForm.get('Formulario2') as FormArray).controls
      .map((soporte, index) => this.generarSoporte(soporte, index));

    transaccionActa.SoportesActa = Soportes;

    this.Actas_Recibido.putTransaccionActa(transaccionActa, transaccionActa.ActaRecibido.Id).subscribe((res: any) => {
      if (res !== null) {
        let titulo, descripcion, idTitulo, idDescripcion;
        if (siguienteEtapa) {
          const L10n_base = 'GLOBAL.Acta_Recibido.EdicionActa.';
          titulo = L10n_base + 'VerificadaTitle2';
          idTitulo = { id: res.ActaRecibido.Id };
          descripcion = L10n_base + ((this.estadoActa === 'Registrada') ? 'Verificada3' : 'Verificada2');
          idDescripcion = { id: res.ActaRecibido.Id };
        } else {
          titulo = 'GLOBAL.Acta_Recibido.EdicionActa.ModificadaTitle';
          idTitulo = { ID: res.ActaRecibido.Id };
          descripcion = 'GLOBAL.Acta_Recibido.EdicionActa.Modificada2';
          idDescripcion = { id: res.ActaRecibido.Id };
        }
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant(titulo, idTitulo),
          text: this.translate.instant(descripcion, idDescripcion),
        }).then((willDelete) => {
          if (willDelete.value && siguienteEtapa) {
            const formularios = this.firstForm.value;
            const cedulaprov = formularios.Formulario1.Proveedor && formularios.Formulario1.Proveedor.Identificacion ?
              formularios.Formulario1.Proveedor.Identificacion.Numero : '';
            const cedularev = formularios.Formulario1.Contratista.Identificacion.Numero;
            if (enviara === 1) {
              this.EnviarEmail(cedulaprov);
              this.EnviarEmail(cedularev);
            }
            if (enviara === 2) {
              this.EnviarEmail(cedularev);
            }

            // Se usa una redirección "dummy", intermedia. Ver
            // https://stackoverflow.com/a/49509706/3180052
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigateByUrl('/pages/acta_recibido/consulta_acta_recibido');
            });
          }
        });
      } else {
        let titulo, mensaje;
        if (siguienteEtapa) {
          titulo = 'GLOBAL.Acta_Recibido.EdicionActa.VerificadaTitleNO';
          mensaje = 'GLOBAL.Acta_Recibido.EdicionActa.VerificadaNO';
        } else {
          titulo = 'GLOBAL.Acta_Recibido.EdicionActa.ModificadaTitleNO';
          mensaje = 'GLOBAL.Acta_Recibido.EdicionActa.ModificadaNO';
        }
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant(titulo),
          text: this.translate.instant(mensaje),
        });
      }
      this.guardando = false;
    });
  }

  private generarActa(): ActaRecibido {

    const actaRecibido = new ActaRecibido;

    actaRecibido.Id = +this._Acta_Id;
    actaRecibido.Activo = true;
    actaRecibido.TipoActaId = <TipoActa>{Id: this.Acta.ActaRecibido.TipoActaId.Id};

    return actaRecibido;
  }

  private generarEstadoActa(Estado: number): HistoricoActa {

    const ae = this.Acta.ActaRecibido.TipoActaId.Id === 2;
    const proveedor = this.firstForm.get('Formulario1.Proveedor').value;
    const ubicacionId = this.firstForm.get('Formulario1.Ubicacion').value;
    const contratista = this.firstForm.get('Formulario1.Contratista').value;
    const observaciones = this.firstForm.get('Formulario3.Datos_Adicionales').value;
    const historico = new HistoricoActa;

    historico.Id = null;
    historico.ProveedorId = proveedor ? proveedor.Tercero.Id : null;
    historico.UbicacionId = ubicacionId ? ubicacionId : null;
    historico.RevisorId = this.userService.getPersonaId();
    historico.PersonaAsignadaId = ae ? this.userService.getPersonaId() : contratista ? contratista.Tercero.Id : null;
    historico.Observaciones = observaciones;
    historico.FechaVistoBueno = null;
    historico.ActaRecibidoId = <ActaRecibido>{ Id: +this._Acta_Id };
    historico.EstadoActaId = this.Estados_Acta.find(estado => estado.Id === Estado);
    historico.Activo = true;

    return historico;
  }

  private generarSoporte(form2: any, index: number): SoporteActa {

    const soporteActa = new SoporteActa;

    soporteActa.Id = form2.Id;
    soporteActa.Consecutivo = form2.Consecutivo;
    soporteActa.DocumentoId = this.idDocumento[index];
    soporteActa.FechaSoporte = form2.Fecha_Factura ? form2.Fecha_Factura : null;
    soporteActa.ActaRecibidoId = <ActaRecibido>{Id: +this._Acta_Id};
    soporteActa.Activo = true;

    return soporteActa;
  }

  private generarElementos(): Array<Elemento> {

    const elementosActa = new Array<Elemento>();

    for (const datos of this.DatosElementos) {

      const elemento = new Elemento;
      const valorTotal = parseFloat(datos.Subtotal) - parseFloat(datos.Descuento);
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
      elemento.ValorTotal = valorTotal;
      elemento.PorcentajeIvaId = parseInt(datos.PorcentajeIvaId, 10);
      elemento.ValorIva = parseFloat(datos.ValorIva);
      elemento.ValorFinal = parseFloat(datos.ValorTotal);
      elemento.SubgrupoCatalogoId = subgrupo ? subgrupo : null;
      elemento.EstadoElementoId = <EstadoElemento>{Id: 1};
      elemento.ActaRecibidoId = <ActaRecibido>{Id: +this._Acta_Id};
      elemento.Activo = true;

      elementosActa.push(elemento);

    }
    return elementosActa;
  }

  // Datos
  eventoListaElementos(event: any) {
    this.DatosElementos = event;
  }

  Revisar_Totales() {
    (Swal as any).fire({
      type: 'warning',
      title: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.CargaElementosTitle'),
      text: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.CargaElementos'),
    });
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

  // Guardar Cambios ?
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

  setElementosValidos(event: any): void {
    this.validarElementos = event;
    !this.validarElementos && !this.actaRegistrada ? this.errores.set('clases', true) : this.errores.delete('clases');
  }

  // Enviar a revisor/proveedor?
  Revisar_Totales3(enviara: number) {
    const L10n_base = 'GLOBAL.Acta_Recibido.EdicionActa.';
    const codigoL10n_titulo = L10n_base + 'DatosVeridicosTitle';
    let codigoL10n_desc = '';
    if (this.estadoActa !== 'Registrada') {
      codigoL10n_desc = L10n_base + 'DatosVeridicos2';
    } else {
      codigoL10n_desc = L10n_base + ((enviara === 1) ? 'DatosVeridicos3' : 'DatosVeridicos4');
    }
    (Swal as any).fire({
      title: this.translate.instant(codigoL10n_titulo),
      text: this.translate.instant(codigoL10n_desc),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        this.onFirstSubmit(true, enviara);
      }
    });
  }

  eventoTotales(event) {
    this.totales = event;
  }

  clear() {
    this.firstForm.get('Formulario2')['controls'][0].get('Fecha_Factura').patchValue('');
    this.firstForm.get('Formulario2')['controls'][0].get('Fecha_Factura').setValidators(this.checkDate());
    this.firstForm.get('Formulario2')['controls'][0].get('Fecha_Factura').updateValueAndValidity();
  }

  private validarTercero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = valor && typeof (valor) === 'string' && valor.length < 4 && valor !== '' ? true : false;
      const checkInvalidString = valor && typeof (valor) === 'string' && valor !== '' ? true : false;
      const checkInvalidTercero = valor && typeof (valor) === 'object' && !valor.Tercero ? true : false;
      return checkStringLength ? { errorLongitudMinima: true } :
        checkInvalidString || checkInvalidTercero ? { terceroNoValido: true } : null;
    };
  }

  private checkValidness: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const errors = !(
      control.get('Formulario1').valid &&
      control.get('Formulario2').valid &&
      control.get('Formulario3').valid);
    errors ? this.errores.set('formularios', true) : this.errores.delete('formularios');
    return errors ? { formularios: true } : null;
  }

  private checkDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const invalid = control.value === null;
      const empty = control.value === '';
      return invalid ? { fecha : true } : !this.actaRegistrada && empty ? { required : true} : null;
    };
  }
}
