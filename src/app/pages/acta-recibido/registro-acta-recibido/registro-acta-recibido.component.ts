import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { MatTable } from '@angular/material';
import 'hammerjs';
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
import { CompleterService, CompleterData } from 'ng2-completer';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from '../../../@core/data/documento.service';
import { UserService } from '../../../@core/data/users.service';
import { AbstractControl } from '@angular/forms/src/model';
import { map, startWith } from 'rxjs/operators';
import { isObject } from 'rxjs/internal-compatibility';
import { TipoActa } from '../../../@core/data/models/acta_recibido/tipo_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';

@Component({
  selector: 'ngx-registro-acta-recibido',
  templateUrl: './registro-acta-recibido.component.html',
  styleUrls: ['./registro-acta-recibido.component.scss'],
})
export class RegistroActaRecibidoComponent implements OnInit {

  protected dataService3: CompleterData;
  private Contratistas: TerceroCriterioContratista[];
  contratistasFiltrados: Observable<Partial<TerceroCriterioContratista>[]>;
  private Proveedores: Partial<TerceroCriterioProveedor>[];
  proveedoresFiltrados: Observable<Partial<TerceroCriterioProveedor>[]>;

  // Mensajes de error
  errMess: any;
  private sub: Subscription;

  // Decorador para renderizar los cambios en las tablas de elementos
  @ViewChildren(MatTable) _matTable: QueryList<MatTable<any>>;

  // Variables de Formulario
  firstForm: FormGroup;
  @ViewChild('fform') firstFormDirective;
  tipoActa: string = 'regular';
  selectedTab: number = 0;
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

  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private completerService: CompleterService,
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
  }

  ngOnInit() {
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findEstadosActa();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.route.data.subscribe(data => {
      if (data && data.tipoActa !== null && data.tipoActa !== undefined) {
        this.tipoActa = data.tipoActa;
      }
    });
    this.initForms();
    if (!this.userService.getPersonaId()) {
      this.errores.set('terceros', true);
    }
  }

  private async initForms() {
    const ae = this.tipoActa === 'especial';
    const data = [this.loadLists(), this.loadProveedores(), this.loadContratistas()];
    if ((!ae && sessionStorage.Formulario_Registro == null) || (ae && sessionStorage.Formulario_Acta_Especial == null)) {
      await Promise.all(data);
      this.Cargar_Formularios();
    } else {
      const formulario = JSON.parse(!ae ? sessionStorage.Formulario_Registro : sessionStorage.Formulario_Acta_Especial);
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
              sessionStorage.removeItem(!ae ? 'Formulario_Registro' : 'Formulario_Acta_Especial');
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
    (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').setValue('');
    this.fileDocumento.splice(index, 1);
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  Cargar_Formularios() {
    this.firstForm = this.fb.group({
      Formulario1: this.Formulario_1,
      Formulario2: this.fb.array([this.Formulario_2]),
      Formulario3: this.Formulario_3,
    }, { validators: this.checkValidness });
  }

  Cargar_Formularios2(transaccion_: any) {
    const ae = this.tipoActa === 'especial';
    const Form2 = this.fb.array([]);
    for (const Soporte of transaccion_.Formulario2) {
      const Formulario__2 = this.fb.group({
        Consecutivo: [Soporte.Consecutivo],
        FechaSoporte: [Soporte.FechaSoporte ? new Date(Soporte.FechaSoporte.toString().split('Z')[0]) : ''],
        Soporte: ['', Validators.required],
      });
      this.fileDocumento.push(undefined);
      Form2.push(Formulario__2);
    }

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Sede: [transaccion_.Formulario1.Sede, ae ? [Validators.required] : []],
        Dependencia: [transaccion_.Formulario1.Dependencia, ae ? [Validators.required] : []],
        Ubicacion: [transaccion_.Formulario1.Ubicacion, ae ? [Validators.required] : []],
        Contratista: [transaccion_.Formulario1.Contratista.Tercero ? transaccion_.Formulario1.Contratista : '',
          !ae ? [Validators.required, this.validarTercero()] : []],
        Proveedor: [transaccion_.Formulario1.Proveedor.Tercero ? transaccion_.Formulario1.Proveedor : '',
          [this.validarTercero()]],
        }),
        Formulario2: Form2,
        Formulario3: this.fb.group({
          Datos_Adicionales: [transaccion_.Formulario3.Datos_Adicionales],
        }),
      }, { validators: this.checkValidness });
    this.proveedoresFiltrados = this.cambiosProveedor(this.firstForm.get('Formulario1').get('Proveedor'));
    this.contratistasFiltrados = this.cambiosContratista(this.firstForm.get('Formulario1').get('Contratista'));
    this.Traer_Relacion_Ubicaciones(transaccion_.Formulario1.Ubicacion);
  }

  get Formulario_1(): FormGroup {
    const ae = this.tipoActa === 'especial';
    const form1 = this.fb.group({
      Sede: ['', ae ? [Validators.required] : []],
      Dependencia: ['', ae ? [Validators.required] : []],
      Ubicacion: ['', ae ? [Validators.required] : []],
      Contratista: ['', !ae ? [Validators.required, this.validarTercero()] : []],
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
    this.fileDocumento.push(undefined);
    return form2;
  }

  get Formulario_3(): FormGroup {
    return this.fb.group({
      Datos_Adicionales: [''],
    });
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

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  async onFirstSubmit() {
    this.Registrando = true;
    const ae = this.tipoActa === 'especial';
    const start = async () => {
      await this.asyncForEach(this.fileDocumento, async (file) => {
        await this.postSoporteNuxeo([file]);
      });
    };
    await start();
    const transaccionActa = new TransaccionActaRecibido();

    this.Datos = this.firstForm.value;
    transaccionActa.ActaRecibido = this.generarActa();
    transaccionActa.UltimoEstado = this.generarEstadoActa(this.Datos, ae ? EstadoActa_t.Aceptada : EstadoActa_t.Registrada);
    transaccionActa.Elementos = <Elemento[]>[];
    ae ? transaccionActa.Elementos = this.generarElementos() : null;

    const Soportes: SoporteActa[] = this.Datos.Formulario2
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
        sessionStorage.removeItem(!ae ? 'Formulario_Registro' : 'Formulario_Acta_Especial');
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

  private generarActa(): ActaRecibido {
    const ta = this.tipoActa === 'especial' ? 2 : 1;

    const actaRecibido = new ActaRecibido;
    actaRecibido.Id = null;
    actaRecibido.Activo = true;
    actaRecibido.TipoActaId = <TipoActa>{Id: ta};

    return actaRecibido;
  }

  private generarEstadoActa(Datos: any, Estado: number): HistoricoActa {

    const historico = new HistoricoActa;
    const ae = this.tipoActa === 'especial';

    historico.Id = null;
    historico.ProveedorId = Datos.Formulario1.Proveedor ? Datos.Formulario1.Proveedor.Tercero.Id : null;
    historico.UbicacionId = Datos.Formulario1.Ubicacion ? Datos.Formulario1.Ubicacion : null;
    historico.RevisorId = this.userService.getPersonaId();
    historico.PersonaAsignadaId = ae ? this.userService.getPersonaId() : Datos.Formulario1.Contratista.Tercero.Id;
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
    const ee = this.tipoActa === 'especial' ? 2 : 1;
    const elementosActa = new Array<Elemento>();

    if (this.DatosElementos && this.DatosElementos.length > 0) {

      for (const datos of this.DatosElementos) {

        const elemento = new Elemento;

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
        elemento.SubgrupoCatalogoId = datos.SubgrupoCatalogoId.SubgrupoId.Id;
        elemento.EstadoElementoId = <EstadoElemento>{Id: ee};
        elemento.ActaRecibidoId = new ActaRecibido;
        elemento.Activo = true;
        elementosActa.push(elemento);
      }
    }
    return elementosActa;
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

  usarLocalStorage(event$) {
    this.tipoActa === 'especial' ?
    sessionStorage.setItem('Formulario_Acta_Especial', JSON.stringify(this.firstForm.value)) :
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

  private validarTercero(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value;
      const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '' ? true : false;
      const checkInvalidString = typeof (valor) === 'string' && valor !== '' ? true : false;
      const checkInvalidTercero = typeof (valor) === 'object' && !valor.Tercero ? true : false;
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

}
