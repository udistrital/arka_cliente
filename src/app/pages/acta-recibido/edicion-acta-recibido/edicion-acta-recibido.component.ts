import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { AuthInterceptor } from './../../../@core/_Interceptor/auth.Interceptor';
import { MatTable } from '@angular/material';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Elemento, Impuesto } from '../../../@core/data/models/acta_recibido/elemento';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SoporteActa, Ubicacion } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionSoporteActa, TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import { TerceroCriterioContratista, TerceroCriterioProveedor } from '../../../@core/data/models/terceros_criterio';
import Swal from 'sweetalert2';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';
import { CompleterData, CompleterService } from 'ng2-completer';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { combineAll } from 'rxjs-compat/operator/combineAll';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { PopUpManager } from '../../../managers/popUpManager';
import { DocumentoService } from '../../../@core/data/documento.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../@core/data/users.service';
import { RolUsuario_t as Rol, PermisoUsuario_t as Permiso } from '../../../@core/data/models/roles/rol_usuario';
import { permisosSeccionesActas } from './reglas';
import { NbDateService } from '@nebular/theme';
import { isObject } from 'rxjs/internal-compatibility';

@Component({
  selector: 'ngx-edicion-acta-recibido',
  templateUrl: './edicion-acta-recibido.component.html',
  styleUrls: ['./edicion-acta-recibido.component.scss'],
})
export class EdicionActaRecibidoComponent implements OnInit {

  config: ToasterConfig;
  searchStr: string;
  searchStr2: string[];
  searchStr3: string;
  cargando_contratistas: boolean = true;
  private Contratistas: TerceroCriterioContratista[];
  contratistasFiltrados: Observable<TerceroCriterioContratista[]>;
  private Proveedores: Partial<TerceroCriterioProveedor>[];
  proveedoresFiltrados: Observable<Partial<TerceroCriterioProveedor>[]>;
  listo: Map<string, boolean>;

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
  carga_agregada: boolean;
  index;
  selected = new FormControl(0);
  _Acta_Id: number;
  fileDocumento: any[] = [];
  Validador: any[] = [];
  uidDocumento: any[] = [];
  idDocumento: any[] = [];
  ActaEspecial: boolean;

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
  Estados_Acta: any;
  Tipos_Bien: any;
  Estados_Elemento: any;

  // Modelos

  Acta__: ActaRecibido;
  Elementos__Soporte: Array<any[]>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Transaccion__: TransaccionActaRecibido;
  Unidades: any;
  DatosElementos: Array<any>;
  Acta: ActaRecibido;
  TodaysDate: any;
  observable: any;

  Ubicaciones: any;
  UbicacionesFiltradas: any;
  Sedes: any;
  Dependencias: any;
  DatosTotales: any;
  Totales: Array<any>;
  dataService3: CompleterData;
  Tarifas_Iva: any;
  guardando: boolean = false;
  private actaCargada: boolean = false;
  private SoporteElementosValidos: Array<boolean>;
  private elementosValidos: boolean = false;
  private validarElementos: boolean;

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
    this.errores = new Map<string, boolean>();
    this.fileDocumento = [];
    this.Validador = [];
    this.uidDocumento = [];
    this.idDocumento = [];
    this.searchStr2 = new Array<string>();
    this.DatosElementos = new Array<any>();
    this.Elementos__Soporte = new Array<any>();
    this.TodaysDate = new Date();
    this.listo = new Map<string, boolean>();
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
    this.defineSiHayQueValidarElementosParaEnviar();
    this.loadLists();
    this.loadProveedores();
    this.cargaPermisos();
    if (!this.userService.getPersonaId()) {
      this.errores.set('terceros', true);
    }
    this.loadContratistas();
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
        return this.userService
          .tieneAlgunRol(permisosSeccion.PuedenModificar) ? Permiso.Modificar : (
            this.userService
              .tieneAlgunRol(permisosSeccion.PuedenVer) ? Permiso.Ver : Permiso.Ninguno
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
    let PuedenModificar: Rol[] = [];
    let PuedenVer: Rol[] = [];

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
      this.userService.tieneAlgunRol([Rol.Admin, Rol.Revisor, Rol.Secretaria])
      && ['Registrada']
        .some(est => this.estadoActa === est);

    // Pueden enviar a Validacion
    const envioValidar =
      this.userService.tieneAlgunRol([Rol.Admin, Rol.Revisor, Rol.Contratista])
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

  Cargar_localStorage(Acta: any) {
    if (sessionStorage.Formulario_Edicion == null) {
      this.Cargar_Formularios(Acta);
    } else {
      const formulario = JSON.parse(sessionStorage.Formulario_Edicion);
      // console.log(sessionStorage.Formulario_Edicion);
      // console.log(sessionStorage.Elementos_Formulario_Edicion);
      let elementos;
      if (sessionStorage.Elementos_Formulario_Edicion === []) {
        elementos = [];
      } else {
        elementos = JSON.parse(sessionStorage.getItem('Elementos_Formulario_Edicion'));
        // console.log(elementos);
      }
      (Swal as any).fire({
        type: 'warning',
        title: 'Edicion sin completar del acta ' + `${formulario.Formulario1.Id}`,
        text: 'Existe un Edicion nuevo sin terminar, que desea hacer?',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Seguir con anterior',
        cancelButtonText: 'Nuevo Edicion, se eliminara el Edicion anterior',
      }).then((result) => {
        if (result.value) {
          this.Cargar_Formularios2(formulario, elementos);
        } else {
          (Swal as any).fire({
            type: 'warning',
            title: 'Ultima Palabra?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Si, Nuevo Edicion',
            cancelButtonText: 'No, Usar Anterior',
          }).then((result2) => {
            if (result2.value) {
              sessionStorage.removeItem('Formulario_Edicion');
              sessionStorage.removeItem('Elementos_Formulario_Edicion');
              this.Cargar_Formularios(Acta);
            } else {
              this.Cargar_Formularios2(formulario, elementos);
            }
          });
        }
      });
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {

        this.Estados_Acta = list.listEstadosActa[0];
        this.Estados_Elemento = list.listEstadosElemento[0];
        this.Tipos_Bien = list.listTipoBien[0];
        this.Unidades = list.listUnidades[0];
        this.Tarifas_Iva = list.listIVA[0];
        this.Dependencias = list.listDependencias[0];
        this.Sedes = list.listSedes[0];
        this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
        if (this.Estados_Acta !== undefined && this.Estados_Elemento !== undefined &&
          this.Tipos_Bien !== undefined && this.Unidades !== undefined &&
          this.Tarifas_Iva !== undefined &&
          this.Dependencias !== undefined && this.Sedes !== undefined &&
          this._Acta_Id !== undefined) {
          // console.log(this._Acta_Id);
          this.cargaActa();
        }
      },
    );
  }

  private cargaActa() {
    if (!this.actaCargada) {
          this.Actas_Recibido.getTransaccionActa(this._Acta_Id).subscribe(Acta => {
            // console.log(Acta);
            this.Cargar_Formularios(Acta[0]);
            // console.log('ok');
            this.actaCargada = true;
          });
    }
  }

  private loadContratistas(): void {
    if (this.cargando_contratistas) {
      this.tercerosHelper.getTercerosByCriterio('contratista').subscribe(res => {
        this.Contratistas = res;
        // console.log({Contratistas: this.Contratistas});
        this.cargando_contratistas = false;
      });
    }
  }
  private filtroContratistas(nombre: string): TerceroCriterioContratista[] {
    if (nombre.length >= 4 && Array.isArray(this.Contratistas)) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Contratistas.filter(contr => this.muestraContratista(contr).toLowerCase().includes(valorFiltrado));
    } else return [];
  }
  muestraContratista(contr: TerceroCriterioContratista): string {
    // console.log({contr});
    if (contr) {
      return contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    }
  }

  private loadProveedores(): void {
    if (this.listo.get('proveedores') === undefined) {
      this.listo.set('proveedores', false);
      this.tercerosHelper.getTercerosByCriterio('proveedor').subscribe(res => {
        this.Proveedores = res;
        // console.log({Proveedores: this.Proveedores});
        this.listo.set('proveedores', true);
      });
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
          const objemail = JSON.parse(restercero[0].Dato);
          const objetomail = {
              'to': [objemail.email],
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
              if (resemail == null) {}
          });
      });

    });

  }

  Cargar_Formularios( transaccion_: TransaccionActaRecibido ) {
    this.Actas_Recibido.getSedeDependencia(transaccion_.ActaRecibido.UbicacionId).subscribe(res => {
      let valor = '';
      if (res[0].hasOwnProperty('EspacioFisicoId') && res[0].EspacioFisicoId.hasOwnProperty('Codigo')) {
        valor = res[0].EspacioFisicoId.Codigo.substring(0, 4);
      }
      const Form2 = this.fb.array([]);
      const elementos = new Array<any[]>();
      transaccion_.SoportesActa.forEach((Soporte, index) => {
        this.ActaEspecial = Soporte.SoporteActa.ProveedorId.toString() === '0' ? true : false;
        const Formulario__2 = this.fb.group({
          Id: [Soporte.SoporteActa.Id],
          Proveedor: [
            {
              value: Soporte.SoporteActa.ProveedorId === 0 ? null :
                this.Proveedores.find((proveedor) =>
                  proveedor.Tercero.Id === Soporte.SoporteActa.ProveedorId),
              disabled: !this.getPermisoEditar(this.permisos.Acta),
            },
            Validators.required,
          ],
          Consecutivo: [
            {
              value: Soporte.SoporteActa.Consecutivo,
              disabled: !this.getPermisoEditar(this.permisos.Acta),
            },
            Validators.required,
          ],
          Fecha_Factura: [
            {
              value: this.dateService.parse(Soporte.SoporteActa.FechaSoporte.toString(), 'MM dd yyyy'),
              disabled: !this.getPermisoEditar(this.permisos.Acta),
            },
            Validators.required],
          Soporte: [Soporte.SoporteActa.DocumentoId, Validators.required],
        });
        this.Validador[index] = true;
        this.uidDocumento[index] = Soporte.SoporteActa.DocumentoId;
        const elementoSoporte = [];
        if (Soporte.Elementos && Soporte.Elementos.length)
          for (const _Elemento of Soporte.Elementos) { // Para alguna actas lanza error "Cannot read 'length' of null"

            const Elemento___ = {
              Id: _Elemento.Id,
              TipoBienId: _Elemento.TipoBienId !== null ?
                this.Tipos_Bien.find(tipo => tipo.Id.toString() === _Elemento.TipoBienId.Id.toString()).Id : 0,
              SubgrupoCatalogoId: _Elemento.SubgrupoCatalogoId,
              Nombre: _Elemento.Nombre,
              Cantidad: _Elemento.Cantidad,
              Marca: _Elemento.Marca,
              Serie: _Elemento.Serie,
              UnidadMedida: this.Unidades.find(unidad => unidad.Id.toString() === _Elemento.UnidadMedida.toString()).Id,
              ValorUnitario: _Elemento.ValorUnitario,
              Subtotal: _Elemento.ValorTotal,
              Descuento: _Elemento.Descuento,
              PorcentajeIvaId: this.Tarifas_Iva.find(tarifa => tarifa.Tarifa === _Elemento.PorcentajeIvaId) ?
                                this.Tarifas_Iva.find(tarifa => tarifa.Tarifa === _Elemento.PorcentajeIvaId).Tarifa : '',
              ValorIva: _Elemento.ValorIva,
              ValorTotal: _Elemento.ValorFinal,
            };
            elementoSoporte.push(Elemento___);
          }
        elementos.push(elementoSoporte);
        // Nota: si se va a usar más de un soporte y el proveedor sigue haciendo parte del soporte,
        // habrá que hacer de proveedoresFiltrados un arreglo.
        this.proveedoresFiltrados = Formulario__2.get('Proveedor').valueChanges.pipe(
          startWith(''),
          map(val => typeof val === 'string' ? val : this.muestraProveedor(val)),
          map(nombre => this.filtroProveedores(nombre)),
        );
        Form2.push(Formulario__2);
      });

      this.Elementos__Soporte = elementos;
      this.SoporteElementosValidos = new Array<boolean>(this.Elementos__Soporte.length);
      this.firstForm = this.fb.group({
        Formulario1: this.fb.group({
          Id: [transaccion_.ActaRecibido.Id],
          Sede: [
            {
              value: (() => {
                const criterio = x => x && x.CodigoAbreviacion === valor.toString();
                if (this.Sedes.some(criterio)) {
                  return this.Sedes.find(criterio).Id;
                }
                return '';
              })(),
              disabled: !this.getPermisoEditar(this.permisos.Acta),
            },
            Validators.required,
          ],
          Dependencia: [ (() => {
            const criterio = x => res[0].hasOwnProperty('DependenciaId') && x.Id === res[0].DependenciaId.Id;
            if (this.Dependencias.some(criterio)) {
              return this.Dependencias.find(criterio).Nombre;
            }
            return '';
          })(), Validators.required],
          Ubicacion: [
            {
              value: transaccion_.ActaRecibido.UbicacionId,
              disabled: !this.getPermisoEditar(this.permisos.Acta),
            },
            Validators.required,
          ],
          Contratista: [
            {
              value: (() => {
                const criterio = (contratista: TerceroCriterioContratista) =>
                  contratista &&
                  contratista.Tercero.Id === transaccion_.ActaRecibido.PersonaAsignada;
                return this.Contratistas.some(criterio) ? this.Contratistas.find(criterio) : '';
              })(),
              disabled: !this.getPermisoEditar(this.permisos.Acta),
            },
            Validators.required,
          ],
        }),
        Formulario2: Form2,
        Formulario3: this.fb.group({
          Datos_Adicionales: [transaccion_.ActaRecibido.Observaciones, Validators.required],
        }),
      });
      this.Traer_Relacion_Ubicaciones();
      this.firstForm.get('Formulario1').statusChanges.subscribe(change => this.checkValidness(1, change));
      this.firstForm.get('Formulario2').statusChanges.subscribe(change => this.checkValidness(2, change));
      this.firstForm.get('Formulario3').statusChanges.subscribe(change => this.checkValidness(3, change));
      this.carga_agregada = true;
      this.contratistasFiltrados = this.firstForm.get('Formulario1').get('Contratista').valueChanges.pipe(
        startWith(''),
        map(val => typeof val === 'string' ? val : this.muestraContratista(val)),
        map(nombre => this.filtroContratistas(nombre)),
      );
    });
  }

  private checkValidness(form, change) {
    // console.log({form, change});
    const errorForms = !(
      this.firstForm.get('Formulario1').valid
      && this.firstForm.get('Formulario2').valid
      && this.firstForm.get('Formulario3').valid
    );
    if (errorForms) {
      this.errores.set('formularios', true);
    } else {
      this.errores.delete('formularios');
    }
  }

  Cargar_Formularios2(transaccion_: any, elementos_: any) {
    const Form2 = this.fb.array([]);
    const elementos = new Array<any[]>();

    for (const Soporte of transaccion_.Formulario2) {
      const Formulario__2 = this.fb.group({
        Id: [''],
        Proveedor: [Soporte.Proveedor, Validators.required],
        Consecutivo: [Soporte.Consecutivo, Validators.required],
        Fecha_Factura: [Soporte.Fecha_Factura, Validators.required],
        Soporte: [Soporte.Soporte, Validators.required],
      });
      Form2.push(Formulario__2);
    }
    this.Elementos__Soporte = elementos_;

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [''],
        Sede: [transaccion_.Formulario1.Sede, Validators.required],
        Dependencia: [transaccion_.Formulario1.Dependencia, Validators.required],
        Ubicacion: [transaccion_.Formulario1.Ubicacion, Validators.required],
        Contratista: [transaccion_.Formulario1.Contratista, Validators.required],
      }),
      Formulario2: Form2,
      Formulario3: this.fb.group({
        Datos_Adicionales: [transaccion_.Formulario3.Datos_Adicionales, Validators.required],
      }),
    });
    this.carga_agregada = true;
    this.Traer_Relacion_Ubicaciones();
  }

  async Traer_Sede_Dependencia(id) {
    await this.Actas_Recibido.getSedeDependencia(id).subscribe(res => {
      // console.log(res);
      const valor = res[0].EspacioFisicoId.Codigo.substring(0, 4);
      // console.log(valor);
      const Sede = this.Sedes.find(x => x.CodigoAbreviacion === valor.toString()).Id;
      const _Dependencia = res[0].DependenciaId.Id;
      // console.log(Sede, Dependencia);
      return [Sede, _Dependencia];
    });
  }
  Traer_Relacion_Ubicaciones() {
    const sede = this.firstForm.get('Formulario1').get('Sede').value;
    const dependencia = this.firstForm.get('Formulario1').get('Dependencia').value;
    if (this.firstForm.get('Formulario1').get('Sede').valid && this.firstForm.get('Formulario1').get('Dependencia').valid &&
      sede !== undefined && dependencia !== undefined) {
      this.UbicacionesFiltradas = [];
      this.carga_agregada ? this.firstForm.patchValue({ Formulario1: { Ubicacion: '' } }) : null;
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
        if (isObject(res[0].Relaciones))
          this.UbicacionesFiltradas = res[0].Relaciones;
      });
    }
  }


  get Formulario_1(): FormGroup {
    return this.fb.group({
      Id: [0],
      Sede: ['', Validators.required],
      Dependencia: ['', Validators.required],
      Ubicacion: ['', Validators.required],
      Contratista: ['', Validators.required],
    });
  }
  get Formulario_2(): FormGroup {
    return this.fb.group({
      Id: [0],
      Proveedor: ['', Validators.required],
      Consecutivo: ['', Validators.required],
      Fecha_Factura: ['', Validators.required],
      Soporte: ['', Validators.required],
      Elementos: this.fb.array([this.Elementos]),
    });
  }
  get Elementos(): FormGroup {
    return this.fb.group({
      Id: [0],
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
  get Formulario_3(): FormGroup {
    return this.fb.group({
      Datos_Adicionales: ['', Validators.required],
    });
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
  clearFile(index) {
    (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').setValue('');
    this.fileDocumento[index] = undefined;
    this.Validador[index] = undefined;
    this.uidDocumento[index] = undefined;
  }
  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }


  addSoportes() {
    (this.firstForm.get('Formulario2') as FormArray).push(this.Formulario_2);
    this.SoporteElementosValidos.push(false);
  }
  deleteSoportes(index: number) {
    (this.firstForm.get('Formulario2') as FormArray).removeAt(index);
    this.SoporteElementosValidos.splice(index, 1);
  }
  addTab() {
    this.addSoportes();
    this.selected.setValue(this.firstForm.get('Formulario2').value.length - 1);
  }
  removeTab(i: number) {
    this.deleteSoportes(i);
    this.selected.setValue(i - 1);
  }
  async postSoporteNuxeo(files: any) {
    // console.log(files);
    return new Promise(async (resolve, reject) => {
      files.forEach((file) => {
        // console.log(file);
        file.Id = file.nombre;
        file.nombre = 'soporte_' + file.IdDocumento + '_acta_recibido';
        // file.key = file.Id;
        file.key = 'soporte_' + file.IdDocumento;
      });
      // console.log(files);
      await this.nuxeoService.getDocumentos$(files, this.documentoService)
        .subscribe(response => {
          // console.log('response', response);
          if (Object.keys(response).length === files.length) {
            // console.log('response', response);
            files.forEach((file, index) => {
              if (file !== undefined) {
                this.uidDocumento[index] = file.uid;
                this.idDocumento[index] = response[file.key].Id;
                // console.log(this.idDocumento);
                resolve(response[file.key].Id);
              } else {
                resolve(this.idDocumento[index]);
              }

            });
          }
        }, error => {
          reject(error);
        });
    });
  }

  // Envío (a (proveedor y/o contratista)/revisor) o guardado
  private async onFirstSubmit(siguienteEtapa: boolean = false, enviara: number = 0) {
    this.guardando = true;
    if (!siguienteEtapa) {
    const start = async () => {
      await this.asyncForEach(this.fileDocumento, async (file) => {
        await this.postSoporteNuxeo([file]);
        // console.log(file);
      });
      // console.log('Done');
    };
    await start();
    }
    this.Datos = this.firstForm.value;
    // console.log(this.Elementos__Soporte);
    // console.log({Datos: this.Datos});
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    let nuevoEstado: EstadoActa_t;
    if (siguienteEtapa) {
      nuevoEstado = (this.estadoActa === 'Registrada') ? EstadoActa_t.EnElaboracion : EstadoActa_t.EnVerificacion;
    } else {
      nuevoEstado = this.Estados_Acta.find(estado => estado.Nombre === this.estadoActa).Id; // el nuevo estado es el mismo
    }
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, nuevoEstado);
    const Soportes = new Array<TransaccionSoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => {
      Soportes.push(this.Registrar_Soporte(soporte, this.Elementos__Soporte[index], Transaccion_Acta.ActaRecibido));
    });
    Transaccion_Acta.SoportesActa = Soportes;
    // console.log({Transaccion_Acta});
    // /*
    this.Actas_Recibido.putTransaccionActa(Transaccion_Acta, Transaccion_Acta.ActaRecibido.Id).subscribe((res: any) => {
      // console.log(res);
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
          idTitulo = {ID: res.ActaRecibido.Id};
          descripcion = 'GLOBAL.Acta_Recibido.EdicionActa.Modificada2';
          idDescripcion = {id: res.ActaRecibido.Id};
        }
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant(titulo, idTitulo),
          text: this.translate.instant(descripcion, idDescripcion),
        }).then((willDelete) => {
          if (willDelete.value && siguienteEtapa) {
              const formularios  = this.firstForm.value;
              const cedulaprov = formularios.Formulario2[0].Proveedor.Identificacion.Numero;
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
    // */
  }

  Registrar_Acta(Datos: any, Datos2: any): ActaRecibido {

    const Acta_de_Recibido = new ActaRecibido();

    Acta_de_Recibido.Id = parseFloat(Datos.Id);
    Acta_de_Recibido.Activo = true;
    Acta_de_Recibido.FechaCreacion = new Date();
    Acta_de_Recibido.FechaModificacion = new Date();
    Acta_de_Recibido.RevisorId = this.userService.getPersonaId();
    Acta_de_Recibido.UbicacionId = parseFloat(Datos.Ubicacion);
    Acta_de_Recibido.Observaciones = Datos2.Datos_Adicionales;
    Acta_de_Recibido.PersonaAsignada = Datos.Contratista.Tercero.Id;

    return Acta_de_Recibido;
  }
  Registrar_Estado_Acta(__: ActaRecibido, Estado: number): HistoricoActa {

    const Historico_ = new HistoricoActa();

    Historico_.Id = null;
    Historico_.ActaRecibidoId = __;
    Historico_.Activo = true;
    Historico_.EstadoActaId = this.Estados_Acta.find(estado => estado.Id === Estado);
    Historico_.FechaCreacion = new Date();
    Historico_.FechaModificacion = new Date();

    return Historico_;
  }
  Registrar_Soporte(Datos: any, Elementos_: any, __: ActaRecibido): TransaccionSoporteActa {
    // console.log({Datos});
    const Soporte_Acta = new SoporteActa();
    const Transaccion = new TransaccionSoporteActa();
    Soporte_Acta.Id = parseFloat(Datos.Id);
    Soporte_Acta.ActaRecibidoId = __;
    Soporte_Acta.Activo = true;
    Soporte_Acta.Consecutivo = Datos.Consecutivo;
    Soporte_Acta.FechaCreacion = new Date();
    Soporte_Acta.FechaModificacion = new Date();
    Soporte_Acta.FechaSoporte = Datos.Fecha_Factura;
    Soporte_Acta.ProveedorId = this.ActaEspecial ? 0 : Datos.Proveedor.Tercero.Id;
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
    'Acciones',
  ];
  Pipe2Number(any: string) {
    // if (any !== null) {
    //   return any.replace(/[$,]/g, '');
    // } else {
    //   return '0';
    // }
    return any;
  }
  valortotal(subtotal: string, descuento: string, iva: string) {
    return (parseFloat(subtotal) - parseFloat(descuento) + parseFloat(iva));
  }
  valorXcantidad(valor_unitario: string, cantidad: string) {
    return (parseFloat(valor_unitario) * parseFloat(cantidad));
  }
  valor_iva(subtotal: string, descuento: string, porcentaje_iva: string) {
    return ((parseFloat(subtotal) - parseFloat(descuento)) * parseFloat(porcentaje_iva) / 100);
  }

  // Datos
  ver(event: any, index: number) {
    this.DatosElementos = event;
    if (this.Elementos__Soporte === undefined) {
      this.Elementos__Soporte = new Array<any>(this.DatosElementos);
    } else {
      if (index < (this.Elementos__Soporte.length)) {
        this.Elementos__Soporte[index] = this.DatosElementos;
      } else {
        this.Elementos__Soporte.push(this.DatosElementos);
      }
    }
    // console.log({event, index, 'this.Elementos__Soporte': this.Elementos__Soporte});
  }

  // Totales
  ver2(event: any, index: number) {
    this.DatosTotales = event;
    if (this.Totales === undefined) {
      this.Totales = new Array<any>(this.DatosTotales);
    } else {
      if (index < (this.Totales.length)) {
        this.Totales[index] = this.DatosTotales;
      } else {
        this.Totales.push(this.DatosTotales);
      }
    }
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

  setElementosValidos(soporte: number, valido: boolean): void {
    if (this.validarElementos) {
      this.SoporteElementosValidos[soporte] = valido;
      this.validaSoportes();
    }
  }

  // TODO: Colocar más validaciones necesarias previo al envío a revisor, acá
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
  usarLocalStorage() {
    if (sessionStorage.Formulario_Edicion == null) {
      sessionStorage.setItem('Formulario_Edicion', JSON.stringify(this.firstForm.value));
      sessionStorage.setItem('Elementos_Formulario_Edicion', JSON.stringify(this.Elementos__Soporte));
    } else {
      sessionStorage.setItem('Formulario_Edicion', JSON.stringify(this.firstForm.value));
      sessionStorage.setItem('Elementos_Formulario_Edicion', JSON.stringify(this.Elementos__Soporte));
    }
  }
}
