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
import { SoporteActa, Ubicacion, Dependencia } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';

import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa } from '../../../@core/data/models/acta_recibido/estado_acta';
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
  ) {
    this.listService.findUbicaciones();
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findProveedores();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.loadLists();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.fileDocumento = [];
    this.Validador = [];
    this.uidDocumento = [];
    this.idDocumento = [];
  }

  ngOnInit() {
    this.loadLists();
    this.searchStr2 = new Array<string>();
    if (sessionStorage.Formulario_Registro == null) {
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
      }).then((result) => {
        if (result.value) {
          this.cargar(formulario);
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
              sessionStorage.removeItem('Formulario_Registro');
              this.Cargar_Formularios();
            } else {
              this.cargar(formulario);
            }
          });
        }
      });
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
        this.Proveedores = list.listProveedores[0];
        this.dataService2 = this.completerService.local(this.Proveedores, 'compuesto', 'compuesto');
        this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
        // this.dataService = this.completerService.local(this.Ubicaciones, 'Nombre', 'Nombre');
      },
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
        Id: [''],
        Proveedor: [Soporte.Proveedor, Validators.required],
        Consecutivo: [Soporte.Consecutivo, Validators.required],
        Fecha_Factura: [Soporte.Fecha_Factura, Validators.required],
        Soporte: [Soporte.Soporte, Validators.required],
        Revisor: [Soporte.Revisor, Validators.required],
      });
      Form2.push(Formulario__2);
    }

    this.firstForm = this.fb.group({
      Formulario1: this.fb.group({
        Id: [''],
        Sede: [transaccion_.Formulario1.Sede, Validators.required],
        Dependencia: [transaccion_.Formulario1.Dependencia, Validators.required],
        Ubicacion: [transaccion_.Formulario1.Ubicacion, Validators.required],
      }),
      Formulario2: Form2,
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
      Proveedor: ['', Validators.required],
      Consecutivo: ['', Validators.required],
      Fecha_Factura: ['', Validators.required],
      Revisor: ['', Validators.required],
      Soporte: ['', Validators.required],
    });
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

    const start = async () => {
      await this.asyncForEach(this.fileDocumento, async (file) => {
        await this.postSoporteNuxeo([file]);
      });
    };
    await start();
    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, 1);
    const Soportes = new Array<TransaccionSoporteActa>();
    this.Datos.Formulario2.forEach((soporte, index) => {
      Soportes.push(this.Registrar_Soporte(soporte, Transaccion_Acta.ActaRecibido, index));
    });

    Transaccion_Acta.SoportesActa = Soportes;
    if (this.validador === false) {
      this.Actas_Recibido.postTransaccionActa(Transaccion_Acta).subscribe((res: any) => {
        if (res !== null) {
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Acta') +
              `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.RegistradaTitle'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Acta') +
              `${res.ActaRecibido.Id}` + this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Registrada'),
          });
          sessionStorage.removeItem('Formulario_Registro');
          this.router.navigate(['/pages/acta_recibido/consulta_acta_recibido']);
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

    const Acta_de_Recibido = new ActaRecibido();
    Acta_de_Recibido.Id = null;
    Acta_de_Recibido.Activo = true;
    Acta_de_Recibido.FechaCreacion = new Date();
    Acta_de_Recibido.FechaModificacion = new Date();
    Acta_de_Recibido.RevisorId = this.userService.getPersonaId();
    Acta_de_Recibido.UbicacionId = parseFloat(Datos.Ubicacion);
    Acta_de_Recibido.Observaciones = '';

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

    const Soporte_Acta = new SoporteActa();
    const Transaccion = new TransaccionSoporteActa();

    const proveedor___ = Datos.Proveedor.split(' ');
    Soporte_Acta.Id = null;
    Soporte_Acta.ActaRecibidoId = Acta;
    Soporte_Acta.Activo = true;
    Soporte_Acta.Consecutivo = Datos.Consecutivo;
    Soporte_Acta.FechaCreacion = new Date();
    Soporte_Acta.FechaModificacion = new Date();
    Soporte_Acta.FechaSoporte = Datos.Fecha_Factura;
    Soporte_Acta.ProveedorId = this.Proveedores.find(proveedor => proveedor.NumDocumento.toString() === proveedor___[0].toString()).Id;
    Soporte_Acta.DocumentoId = this.idDocumento[index];

    Transaccion.SoporteActa = Soporte_Acta;
    Transaccion.Elementos = this.Registrar_Elementos(Soporte_Acta);
    return Transaccion;
  }

  Registrar_Elementos(Soporte: SoporteActa): Array<Elemento> {
    const Elementos_Soporte = new Array<Elemento>();
    const Elemento__ = new Elemento;
    Elemento__.Id = null;
    Elemento__.Nombre = '';
    Elemento__.Cantidad = 0;
    Elemento__.Marca = '';
    Elemento__.Serie = '';
    Elemento__.UnidadMedida = 0;
    Elemento__.ValorUnitario = 0;
    Elemento__.Subtotal = 0;
    Elemento__.Descuento = 0;
    Elemento__.ValorTotal = 0;
    Elemento__.PorcentajeIvaId = 6;
    Elemento__.ValorIva = 0;
    Elemento__.ValorFinal = 0;
    Elemento__.SubgrupoCatalogoId = null;
    Elemento__.Verificado = false;
    Elemento__.TipoBienId = this.Tipos_Bien[0];
    Elemento__.EstadoElementoId = this.Estados_Acta[0];
    Elemento__.SoporteActaId = Soporte;
    Elemento__.Activo = true;
    Elemento__.FechaCreacion = new Date();
    Elemento__.FechaModificacion = new Date();
    this.validador = false;

    Elementos_Soporte.push(Elemento__);
    return Elementos_Soporte;
  }

  // Posible TODO: Esta función también se repite en el componente
  // edición-acta-recibido, por tanto se podría dejar en un servicio aparte
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

  cargar(formulario) {
    if (this.Sedes && this.Dependencias) {
      this.Cargar_Formularios2(formulario);
    } else {
      setTimeout(() => { this.cargar(formulario); }, 100);
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
}
