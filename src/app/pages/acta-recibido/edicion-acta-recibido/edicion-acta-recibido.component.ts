import { Component, OnInit, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { PopUpManager } from '../../../managers/popUpManager';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../@core/data/users.service';
import { PermisoUsuario_t as Permiso } from '../../../@core/data/models/roles/rol_usuario';
import { permisosSeccionesActas } from './reglas';
import { isObject } from 'rxjs/internal-compatibility';
import { Acta_t, TipoActa } from '../../../@core/data/models/acta_recibido/tipo_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { ActaValidators } from '../validators';
import { CommonActas } from '../shared';
import { AutocompleterOption } from '../../../@theme/components';
import { merge } from 'rxjs';

const FECHA_MINIMA = new Date('1945');

@Component({
  selector: 'ngx-edicion-acta-recibido',
  templateUrl: './edicion-acta-recibido.component.html',
  styleUrls: ['./edicion-acta-recibido.component.scss'],
})
export class EdicionActaRecibidoComponent implements OnInit {

  Contratistas: TerceroCriterioContratista[];
  cargandoContratistas: boolean;
  Proveedores: Partial<TerceroCriterioProveedor>[];
  cargandoProveedores: boolean;
  spinnerSize = 20;

  // Mensajes de error
  errMess: any;
  errores: Map<string, boolean>;

  // Decorador para renderizar los cambios en las tablas de elementos
  @ViewChildren(MatTable) _matTable: QueryList<MatTable<any>>;

  // Variables de Formulario
  firstForm: FormGroup;
  carga_agregada: boolean;
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

  /**
   * Para notificar que hubo un cambio en el acta
   * y por lo tanto es necesario recargar la lista
   */
  @Output() cambio = new EventEmitter();

  estadoLocalizado: string = '';
  Estados_Acta: any;
  Estados_Elemento: any;

  // Modelos

  DatosElementos: Array<any>;
  maxDate: Date;
  minDate: Date;
  Ubicaciones: any[] = [];
  Sedes: any;
  Dependencias: any;
  Dependencias2: AutocompleterOption[] = [];
  DatosTotales: any;
  guardando: boolean = false;
  sedeDependencia: any;
  validarElementos: boolean;
  trActa: TransaccionActaRecibido;
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
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private store: Store<IAppState>,
    private confService: ConfiguracionService,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private userService: UserService,
  ) {
    this.errores = new Map<string, boolean>();
    this.maxDate = new Date();
    this.minDate = new Date(-1);
    this.Contratistas = [];
    this.Proveedores = [];
    this.errores = new Map<string, boolean>();
    this.fileDocumento = [];
    this.idDocumento = [];
    this.DatosElementos = new Array<any>();
    this.trActa = new TransaccionActaRecibido;
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.initForms();
  }

  private async initForms() {
    await Promise.all([this.loadLists(), this.cargaActa()]);
    this.cargaPermisos();
    this.defineSiHayQueValidarElementosParaEnviar();
    this.estadoLocalizado = this.translate
      .instant(CommonActas.i18nEstado(this.estadoActa));
    await this.Cargar_Formularios();
    this.setFormEvents();
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
        return this.confService.getAccion(permisosSeccion.PuedenModificar) ? Permiso.Modificar :
          this.confService.getAccion(permisosSeccion.PuedenVer) ? Permiso.Ver : Permiso.Ninguno;
      });

    // Guardar permisos requeridos para cada parte del componente
    // console.log({'permisoActa': Permiso[permisoActa], 'permisoElementos': Permiso[permisoElementos]});
    this.permisos.Acta = permisoActa;
    this.permisos.Elementos = permisoElementos;
    Object.freeze(this.permisos);
  }

  // Devuelve un objeto en que el nombre de cada propiedad es un permiso, y
  // los valores de cada propiedad son los roles que tienen dicho permiso.
  private permisosRoles_EstadoSeccion(estado: EstadoActa_t, seccion: string) {
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
      && [EstadoActa_t.Registrada]
        .some(est => this.estadoActa === est);

    // Pueden enviar a Validacion
    const envioValidar =
      !!this.confService.getAccion('edicionActaRecibidoCambioARevision') &&
      [EstadoActa_t.EnElaboracion, EstadoActa_t.EnModificacion]
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
      EstadoActa_t.EnElaboracion,
      EstadoActa_t.EnModificacion,
      EstadoActa_t.Aceptada,
    ];
    const validar = estadosAntesDeRevision
      .some(est => this.estadoActa === est);
    this.validarElementos = validar;
    // console.log({elemValiudos: this.elementosValidos});
  }

  private cargaActa(): Promise<void> {
    return new Promise<void>(resolve => {
      this.Actas_Recibido.getTransaccionActa(this._Acta_Id, false).subscribe(async Acta => {
        this.trActa = Acta;
        resolve();
      });
    });
  }

  private queryContratistas(query: string = '', id: number= 0) {
    this.cargandoContratistas = true;
    return this.tercerosHelper.getTercerosByCriterio('contratista', id, query);
  }
  private loadContratistas(query: string = '', id: number= 0): Promise<void> {
    return new Promise<void>(resolve => {
      if (id || (query.length && query.length >= this.minLength)) {
        this.queryContratistas(query, id).toPromise().then(res => {
          this.Contratistas = res;
          this.cargandoContratistas = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private queryProveedores(query: string = '', id: number= 0) {
    this.cargandoProveedores = true;
    return this.tercerosHelper.getTercerosByCriterio('proveedor', id, query);
  }
  private loadProveedores(query: string = '', id: number= 0): Promise<void> {
    return new Promise<void>(resolve => {
      if (id || (query.length && query.length >= this.minLength)) {
        this.queryProveedores(query, id).toPromise().then(res => {
          this.Proveedores = res;
          this.cargandoProveedores = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private loadLists(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      this.store.select((state) => state).subscribe(list => {
        this.Sedes = CommonActas.preparaSedes(list.listSedes[0]),
        this.Dependencias = CommonActas.preparaDependencias(list.listDependencias[0]),
        this.Dependencias2 = CommonActas.convierteDependencias(this.Dependencias),
        this.Estados_Acta = list.listEstadosActa[0],
        this.Estados_Elemento = list.listEstadosElemento[0],
        !this.userService.getPersonaId() ? this.errores.set('terceros', true) : null,

        (this.Sedes && this.Sedes.length > 0 && this.Dependencias && this.Dependencias.length > 0 &&
          this.Estados_Elemento && this.Estados_Elemento.length > 0 &&
          this.Estados_Acta && this.Estados_Acta.length > 0 &&
          this.Estados_Elemento && this.Estados_Elemento.length > 0) ? resolve() : null;
      });
    });
  }

  muestraContratista = CommonActas.muestraContratista;
  muestraProveedor = CommonActas.muestraProveedor;

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

  private async Cargar_Formularios() {
    const transaccion_ = this.trActa;
    // console.debug({transaccion_});

    const promises = [];
    if (transaccion_.UltimoEstado.UbicacionId) {
      promises.push(this.getSedeDepencencia(transaccion_.UltimoEstado.UbicacionId));
    }
    if (this.trActa.UltimoEstado.ProveedorId) {
      promises.push(this.loadProveedores('', this.trActa.UltimoEstado.ProveedorId));
    }
    if (this.trActa.UltimoEstado.PersonaAsignadaId) {
      promises.push(this.loadContratistas('', this.trActa.UltimoEstado.PersonaAsignadaId));
    }
    await Promise.all(promises);
    // console.debug({
    //   Proveedores: this.Proveedores,
    //   Contratistas: this.Contratistas,
    //   sedeDependencia: this.sedeDependencia,
    // });

    const ar = this.actaRegular;
    const Formulario2 = this.fb.array(transaccion_.SoportesActa.map(Soporte => this.fb.group({
      Id: [Soporte.Id],
      Consecutivo: [
        {
          value: Soporte.Consecutivo,
          disabled: !this.getPermisoEditar(this.permisos.Acta),
        },
        ((!ar || this.actaRegistrada) ? [] : [Validators.required]),
      ],
      Fecha_Factura: [
        {
          value: new Date(Soporte.FechaSoporte) > FECHA_MINIMA ?
            new Date(Soporte.FechaSoporte.toString().split('Z')[0]) : '',
          disabled: !this.getPermisoEditar(this.permisos.Acta),
        },
        ((!ar || this.actaRegistrada) ? [] : [Validators.required]),
      ],
      Soporte: [
        Soporte.DocumentoId ? Soporte.DocumentoId : '',
        Validators.required,
      ],
    })));
    transaccion_.SoportesActa.forEach(Soporte => {
      this.fileDocumento.push(undefined);
      this.idDocumento.push(Soporte.DocumentoId);
    });

    const Formulario1 = this.fb.group({
      Id: [transaccion_.ActaRecibido.Id],
      Sede: [
        {
          value: this.sedeDependencia ? this.sedeDependencia.sede : '',
          disabled: !this.getPermisoEditar(this.permisos.Acta),
        },
        { validators: this.actaRegistrada ? [] : [Validators.required] },
      ],
      Dependencia: [
        {
          value: this.sedeDependencia ? this.sedeDependencia.dependencia : '',
          disabled: !this.getPermisoEditar(this.permisos.Acta),
        },
        { validators: this.actaRegistrada ? [] : [Validators.required] },
      ],
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
          disabled: !this.confService.getAccion('edicionActaAuxI'),
        }, ar ? [Validators.required, ActaValidators.validarTercero] : [],
      ],
      Proveedor: [
        {
          value: transaccion_.UltimoEstado.ProveedorId === 0 ? null :
            this.Proveedores.find((proveedor) =>
              proveedor.Tercero.Id === transaccion_.UltimoEstado.ProveedorId),
          disabled: !this.getPermisoEditar(this.permisos.Acta),
        },
        { validators: !ar ? [] : this.actaRegistrada ? [ActaValidators.validarTercero] : [Validators.required, ActaValidators.validarTercero] },
      ],
    });

    this.firstForm = this.fb.group({
      Formulario1,
      Formulario2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [transaccion_.UltimoEstado.Observaciones],
      }),
    }, { validators: this.checkValidness });

    this.carga_agregada = true;
  }

  private async getSedeDepencencia(ubicacionId: number): Promise<void> {

    return new Promise<void>(resolve => {
      this.Actas_Recibido.getSedeDependencia(ubicacionId).toPromise().then(async res => {
        const relacion = res[0];
        // console.debug({res, relacion});
        if (relacion) {
          const dependencia = {
            name: relacion.DependenciaId.Nombre,
            value: relacion.DependenciaId.Id,
          };
          const espacioFisico = relacion.EspacioFisicoId.CodigoAbreviacion.replace(/[0-9]/g, '');
          const sede = this.Sedes.find(x => x && x.CodigoAbreviacion === espacioFisico.toString());
          // console.debug({sede});
          if (sede) {
            await this.Traer_Relacion_Ubicaciones(sede.Id, dependencia.value);
          }
          this.sedeDependencia = { sede: sede.Id, dependencia };
        }
        resolve();
      });
    });
  }

  private async Traer_Relacion_Ubicaciones(
  sede: number = this.controlSede.value,
  dependencia: number = this.controlDependencia.value.value) {
    // console.debug('Traer_Relacion_Ubicaciones', {sede, dependencia});
    if (sede && dependencia) {
      const transaccion = {
        Sede: this.Sedes.find((x) => x.Id === sede),
        Dependencia: this.Dependencias.find((x) => x.Id === dependencia),
      };
      // console.debug({transaccion});
      this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
        const relaciones = res[0].Relaciones;
        if (isObject(relaciones)) {
          this.Ubicaciones = relaciones;
        } else {
          this.Ubicaciones = [];
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
            if (url !== undefined) {
              window.open(url);
            }
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
          this.controlSoportes.at(index).get('Soporte').setValue(file.name);
          this.fileDocumento[index] = file;
          this.idDocumento[index] = undefined;

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
    this.fileDocumento[index] = undefined;
    this.idDocumento[index] = undefined;
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  addSoportes() {
    this.controlSoportes.push(this.Formulario_2);
  }

  private setFormEvents() {
    // Para cualquier cambio en el formulario:
    // this.firstForm.valueChanges
    // .pipe(debounceTime(200))
    // .subscribe(form => console.debug({form}));

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

    merge(
      this.controlSede.valueChanges,
      this.controlDependencia.valueChanges,
    )
    .pipe(debounceTime(200), distinctUntilChanged())
    .subscribe((change: any) => {
      // console.debug({change});
      this.Traer_Relacion_Ubicaciones();
    });
  }

  tab() {
    if (this.cargarTab) {
      this.selectedTab = this.controlSoportes.value.length - 1;
      this.cargarTab = false;
    }
  }

  addTab($event) {
    if ($event === this.controlSoportes.value.length && !this.cargarTab) {
      this.controlSoportes.push(this.Formulario_2);
      this.selectedTab = this.controlSoportes.value.length;
      this.cargarTab = true;
    }
  }

  removeTab(i: number) {
    this.selectedTab = i - 1;
    this.controlSoportes.removeAt(i);
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
      await CommonActas.asyncForEach(filestoPost, async (file) => {
        await this.postSoporteNuxeo([file]);
      });
    };
    await start();
    const transaccionActa = new TransaccionActaRecibido();

    transaccionActa.ActaRecibido = this.generarActa();
    let nuevoEstado: EstadoActa_t;
    if (siguienteEtapa) {
      nuevoEstado = this.actaRegistrada ? EstadoActa_t.EnElaboracion : EstadoActa_t.EnVerificacion;
    } else {
      nuevoEstado = this.estadoActa; // el nuevo estado es el mismo
    }

    transaccionActa.UltimoEstado = this.generarEstadoActa(nuevoEstado);
    transaccionActa.Elementos = this.generarElementos();

    const Soportes: SoporteActa[] = this.controlSoportes.controls
      .map((soporte, index) => this.generarSoporte(soporte, index));

    transaccionActa.SoportesActa = Soportes;

    this.Actas_Recibido.putTransaccionActa(transaccionActa, transaccionActa.ActaRecibido.Id).subscribe((res: any) => {
      if (res !== null) {
        let titulo, descripcion, idTitulo, idDescripcion;
        if (siguienteEtapa) {
          const L10n_base = 'GLOBAL.Acta_Recibido.EdicionActa.';
          titulo = L10n_base + 'VerificadaTitle2';
          idTitulo = { id: res.ActaRecibido.Id };
          descripcion = L10n_base + (this.actaRegistrada ? 'Verificada3' : 'Verificada2');
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
          showConfirmButton: false,
          timer: 2000,
        });
        this.cambio.emit(undefined);
        if (siguienteEtapa) {
          const cedulaprov = this.controlProveedor.value && this.controlProveedor.value.Identificacion ?
            this.controlProveedor.value.Identificacion.Numero : '';
          const cedularev = this.controlContratista.value.Identificacion.Numero;
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
    actaRecibido.TipoActaId = <TipoActa>{ Id: this.tipoActa };

    return actaRecibido;
  }

  private generarEstadoActa(Estado: number): HistoricoActa {

    const ae = this.actaEspecial;
    const proveedor = this.controlProveedor.value;
    const ubicacionId = this.controlUbicacion.value;
    const contratista = this.controlContratista.value;
    const observaciones = this.controlDatosAdicionales.value;
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

  private generarSoporte(form2: AbstractControl, index: number): SoporteActa {
    const soporteActa = new SoporteActa;

    soporteActa.Id = form2.get('Id').value;
    soporteActa.Consecutivo = form2.get('Consecutivo').value;
    soporteActa.DocumentoId = this.idDocumento[index];
    soporteActa.FechaSoporte = form2.get('Fecha_Factura').value ? form2.get('Fecha_Factura').value : null;
    soporteActa.ActaRecibidoId = <ActaRecibido>{ Id: +this._Acta_Id };
    soporteActa.Activo = true;

    return soporteActa;
  }

  private generarElementos(): Array<Elemento> {

    const elementosActa = new Array<Elemento>();

    for (const datos of this.DatosElementos) {

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
      elemento.EstadoElementoId = <EstadoElemento>{ Id: 1 };
      elemento.ActaRecibidoId = <ActaRecibido>{ Id: +this._Acta_Id };
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

  // Guardar Cambios ?
  Revisar_Totales2() {
    if (!this.userService.TerceroValido()) {
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
    if (!this.actaRegistrada) {
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

  private checkValidness: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const errors = !(
      control.get('Formulario1').valid &&
      control.get('Formulario2').valid &&
      control.get('Formulario3').valid);
    errors ? this.errores.set('formularios', true) : this.errores.delete('formularios');
    return errors ? { formularios: true } : null;
  }

  get tipoActa() {
    return this.trActa.ActaRecibido.TipoActaId.Id;
  }
  get actaRegular() {
    return this.tipoActa === Acta_t.Regular;
  }
  get actaEspecial() {
    return this.tipoActa === Acta_t.Especial;
  }
  get estadoActa() {
    return this.trActa.UltimoEstado.EstadoActaId.Id;
  }
  get actaRegistrada() {
    return this.estadoActa === EstadoActa_t.Registrada;
  }
  get actaAceptada() {
    return this.estadoActa === EstadoActa_t.Aceptada;
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
