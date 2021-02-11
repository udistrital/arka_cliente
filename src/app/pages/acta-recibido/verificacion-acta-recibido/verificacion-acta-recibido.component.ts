import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
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
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionSoporteActa, TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import Swal from 'sweetalert2';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CurrencyPipe } from '@angular/common';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';
import { DocumentoService } from '../../../@core/data/documento.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer } from '@angular/platform-browser';
import { CompleterData, CompleterService } from 'ng2-completer';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../@core/data/users.service';



@Component({
  selector: 'ngx-verificacion-acta-recibido',
  templateUrl: './verificacion-acta-recibido.component.html',
  styleUrls: ['./verificacion-acta-recibido.component.scss'],
})
export class VerificacionActaRecibidoComponent implements OnInit {


  config: ToasterConfig;
  Verificar_tabla: boolean[];
  Verificar_tabla2: boolean;
  // Mensajes de error
  errMess: any;
  private sub: Subscription;

  // Decorador para renderizar los cambios en las tablas de elementos
  @ViewChildren(MatTable) _matTable: QueryList<MatTable<any>>;

  // Variables de Formulario
  firstForm: FormGroup;
  @ViewChild('fform') firstFormDirective;
  Datos: any;
  carga_agregada: boolean;
  index;
  selected = new FormControl(0);

  // Tablas parametricas

  @Input('Id_Acta') _ActaId: number;
  Estados_Acta: any;
  Tipos_Bien: any;
  Estados_Elemento: any;

  // Modelos

  Acta__: ActaRecibido;
  Elementos__Soporte: Array<Elemento>;
  Soportes_Acta: Array<SoporteActa>;
  Historico_Acta: HistoricoActa;
  Transaccion__: TransaccionActaRecibido;
  Unidades: any;
  Acta: TransaccionActaRecibido;
  Proveedores: any;
  Ubicaciones: any;
  Tarifas_Iva: any;
  Dependencias: any;
  Sedes: any;
  bandera: boolean;
  bandera2: boolean;
  respuesta: any;

  private actaCargada: boolean = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private toasterService: ToasterService,
    private cp: CurrencyPipe,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private userService: UserService,

  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findProveedores();
    this.listService.findDependencias();
    this.listService.findSedes();
    // this.listService.findUbicaciones();
    this.listService.findEstadosActa();
    this.listService.findEstadosElemento();
    this.listService.findTipoBien();
    this.listService.findUnidades();
    this.listService.findImpuestoIVA();
    this.Verificar_tabla = new Array<boolean>();
  }
  ngOnInit() {
    this.loadLists();
  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {

        this.Estados_Acta = list.listEstadosActa[0];
        this.Estados_Elemento = list.listEstadosElemento[0];
        this.Tipos_Bien = list.listTipoBien[0];
        this.Unidades = list.listUnidades[0];
        this.Tarifas_Iva = list.listIVA[0];
        this.Proveedores = list.listProveedores[0];
        this.Dependencias = list.listDependencias[0];
        // this.Ubicaciones = list.listUbicaciones[0];
        this.Sedes = list.listSedes[0];
        // console.log(this.Proveedores)
        // this.dataService = this.completerService.local(this.Ubicaciones, 'Nombre', 'Nombre');
        if (this.Estados_Acta !== undefined && this.Estados_Elemento !== undefined &&
          this.Tipos_Bien !== undefined && this.Unidades !== undefined &&
          this.Tarifas_Iva !== undefined && this.Proveedores !== undefined &&
          this.Dependencias !== undefined && this.Sedes !== undefined &&
          this._ActaId !== undefined && this.respuesta === undefined) {
          // console.log(this._ActaId);
          this.cargarActa();
        }
      },
    );
  }

  private cargarActa() {
    if (!this.actaCargada) {
          this.Actas_Recibido.getTransaccionActa(this._ActaId).subscribe(Acta => {
            // console.log(Acta);
            this.respuesta = true;
            this.Cargar_Formularios(Acta[0]);
            // console.log('ok');
          });
    }
  }

  T_V(valor: string): string {
    return this.cp.transform(valor);
  }


  Verificar_Tabla(event, index) {
    // console.log(event)
    // console.log(index)
    this.Verificar_tabla[index] = event;
    // console.log(this.Verificar_tabla)
    this.bandera = false;
    // console.log(this.source);
    for (const datos of this.Verificar_tabla) {
      // console.log(datos)
      if (datos !== true) {
        this.bandera = true;
        break;
      }
    }
    if (this.bandera === false) {
      this.bandera2 = true;
    } else {
      this.bandera = false;
      this.bandera2 = false;
    }

  }
  Cargar_Formularios(transaccion_: TransaccionActaRecibido) {
    // console.log(transaccion_)
    this.Actas_Recibido.getSedeDependencia(transaccion_.ActaRecibido.UbicacionId).subscribe(res => {
      const valor = res[0].EspacioFisicoId.Codigo.substring(0, 4);
      this.Acta = transaccion_;

      // console.log(this.Proveedores);

      const Form2 = this.fb.array([]);

      for (const Soporte of transaccion_.SoportesActa) {

        const Formulario__2 = this.fb.group({
          Id: [Soporte.SoporteActa.Id],
          Proveedor: [this.Proveedores.find(proveedor => proveedor.Id === Soporte.SoporteActa.ProveedorId).compuesto],
          Consecutivo: [Soporte.SoporteActa.Consecutivo],
          Fecha_Factura: [Soporte.SoporteActa.FechaSoporte],
          Soporte: [Soporte.SoporteActa.DocumentoId],
          Elementos: this.fb.array([]),
        });
        this.Verificar_tabla.push(false);

        if (Array.isArray(Soporte.Elementos))
        for (const _Elemento of Soporte.Elementos) {

          const Elemento___ = this.fb.group({
            Id: [_Elemento.Id],
            TipoBienId: [
              (() => {
                const criterio = bien => {
                  if (bien.hasOwnProperty('Id')
                  && _Elemento.hasOwnProperty('TipoBienId') && _Elemento.TipoBienId
                  && _Elemento.TipoBienId.hasOwnProperty('Id') && _Elemento.TipoBienId.Id) {
                    return bien.Id.toString() === _Elemento.TipoBienId.Id.toString();
                  } else {
                    return false;
                  }
                };
                if (Array.isArray(this.Tipos_Bien) && this.Tipos_Bien.some(criterio)) {
                  return this.Tipos_Bien.find(criterio).Nombre;
                }
                return undefined;
              })(),
            ],
            SubgrupoCatalogoId: [_Elemento.SubgrupoCatalogoId],
            Nombre: [_Elemento.Nombre],
            Cantidad: [_Elemento.Cantidad],
            Marca: [_Elemento.Marca],
            Serie: [_Elemento.Serie],
            UnidadMedida: [
              this.Unidades.find(unidad => unidad.Id.toString() === _Elemento.UnidadMedida.toString()).Unidad,
            ],
            ValorUnitario: [this.T_V(_Elemento.ValorUnitario.toString())],
            Subtotal: [this.T_V(_Elemento.ValorTotal.toString())],
            Descuento: [this.T_V(_Elemento.Descuento.toString())],
            PorcentajeIvaId: [
              this.Tarifas_Iva.find(iva => +iva.Tarifa === +_Elemento.PorcentajeIvaId) ?
              this.Tarifas_Iva.find(iva => +iva.Tarifa === +_Elemento.PorcentajeIvaId).Nombre : '',
            ],
            ValorIva: [this.T_V(_Elemento.ValorIva.toString())],
            ValorTotal: [this.T_V(_Elemento.ValorFinal.toString())],
            Verificado: [false],
          });

          (Formulario__2.get('Elementos') as FormArray).push(Elemento___);
        }

        Form2.push(Formulario__2);
      }

      let personarev: any = this.Proveedores.find(proveedor => proveedor.Id.toString() === transaccion_.ActaRecibido.PersonaAsignada.toString());
      if (typeof personarev === 'undefined') {
          personarev = {proveedor: 0 };
            // color is undefined
      }


      this.firstForm = this.fb.group({
        Formulario1: this.fb.group({
          Id: [transaccion_.ActaRecibido.Id],
          Sede: [this.Sedes.find(x => x.CodigoAbreviacion === valor.toString()).Nombre],
          Dependencia: [this.Dependencias.find(x => x.Id === res[0].DependenciaId.Id).Nombre],
          Ubicacion: [transaccion_.ActaRecibido.UbicacionId],
          Revisor: [
            personarev.compuesto,
            Validators.required,
          ],
        }),
        Formulario2: Form2,
        Formulario3: this.fb.group({
          Datos_Adicionales: [transaccion_.ActaRecibido.Observaciones],
        }),
      });
      this.Traer_Relacion_Ubicaciones(valor, res[0].DependenciaId.Id, transaccion_.ActaRecibido.UbicacionId);
      this.carga_agregada = true;

    });
  }

  Traer_Relacion_Ubicaciones(sede_, dependencia_, ubicacion_) {

    // console.log(sede_)
    const transaccion: any = {};
    transaccion.Sede = this.Sedes.find((x) => x.CodigoAbreviacion === sede_);
    transaccion.Dependencia = this.Dependencias.find((x) => x.Id === dependencia_);
    // console.log(transaccion);
    if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
      this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
        // console.log(res)
        if (Object.keys(res[0]).length !== 0) {
          this.Ubicaciones = res[0].Relaciones;
          this.firstForm.get('Formulario1').get('Ubicacion').setValue(
            this.Ubicaciones.find(x => x.Id === ubicacion_).Nombre);
        } else {
          this.Ubicaciones = undefined;
        }
      });
    }
  }
  downloadFile(index: any) {

    const id_documento = (this.firstForm.get('Formulario2') as FormArray).at(index).get('Soporte').value;

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

  // Acta Verificada
  onFirstSubmit() {
    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, EstadoActa_t.Aceptada);

    const Soportes = new Array<TransaccionSoporteActa>();
    for (const soporte of this.Datos.Formulario2) {
      Soportes.push(this.Registrar_Soporte(soporte, soporte.Elementos, Transaccion_Acta.ActaRecibido));
    }
    Transaccion_Acta.SoportesActa = Soportes;

    this.Actas_Recibido.putTransaccionActa(Transaccion_Acta, Transaccion_Acta.ActaRecibido.Id).subscribe((res: any) => {
      if (res !== null) {
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.VerificadaTitle', {ID: res.ActaRecibido.Id}),
          text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Verificada', {ID: res.ActaRecibido.Id}),
        }).then((willDelete) => {
          if (willDelete.value) {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigateByUrl('/pages/acta_recibido/consulta_acta_recibido');
            });
          }
        });
      } else {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.VerificadaTitleNO'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.VerificadaNO'),
        });
      }
    });
  }

  // Acta rechazada
  onFirstSubmit2() {

    this.Datos = this.firstForm.value;
    const Transaccion_Acta = new TransaccionActaRecibido();
    Transaccion_Acta.ActaRecibido = this.Registrar_Acta(this.Datos.Formulario1, this.Datos.Formulario3);
    Transaccion_Acta.UltimoEstado = this.Registrar_Estado_Acta(Transaccion_Acta.ActaRecibido, EstadoActa_t.EnModificacion);
    const Soportes = new Array<TransaccionSoporteActa>();
    for (const soporte of this.Datos.Formulario2) {
      Soportes.push(this.Registrar_Soporte(soporte, soporte.Elementos, Transaccion_Acta.ActaRecibido));
    }
    Transaccion_Acta.SoportesActa = Soportes;
    this.Actas_Recibido.putTransaccionActa(Transaccion_Acta, Transaccion_Acta.ActaRecibido.Id).subscribe((res: any) => {
      if (res !== null) {
        (Swal as any).fire({
          type: 'success',
          title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.RechazadaTitle', {ID: res.ActaRecibido.Id}),
          text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Rechazada', {ID: res.ActaRecibido.Id}),
        }).then((willDelete) => {
          if (willDelete.value) {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigateByUrl('/pages/acta_recibido/consulta_acta_recibido');
            });
          }
        });
      } else {
        (Swal as any).fire({
          type: 'error',
          title: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.RechazadaTitleNO'),
          text: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.RechazadaNO'),
        });
      }
    });
  }

  Registrar_Acta(Datos: any, Datos2: any): ActaRecibido {

    const Acta_de_Recibido = new ActaRecibido();
    const revisor___ = Datos.Revisor.split(' ');

    Acta_de_Recibido.Id = parseFloat(Datos.Id);
    Acta_de_Recibido.Activo = true;
    Acta_de_Recibido.FechaCreacion = new Date();
    Acta_de_Recibido.FechaModificacion = new Date();
    Acta_de_Recibido.FechaVistoBueno =  new Date();
    Acta_de_Recibido.RevisorId = this.userService.getPersonaId();
    Acta_de_Recibido.UbicacionId = this.Ubicaciones.find(ubicacion => ubicacion.Nombre === Datos.Ubicacion).Id;
    Acta_de_Recibido.Observaciones = Datos2.Datos_Adicionales;
    Acta_de_Recibido.PersonaAsignada = this.Proveedores.find(proveedor => proveedor.NumDocumento.toString() === revisor___[0].toString()).Id;

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

    const Soporte_Acta = new SoporteActa();
    const Transaccion = new TransaccionSoporteActa();
    const proveedor___ = Datos.Proveedor.split(' ');
    Soporte_Acta.Id = parseFloat(Datos.Id);
    Soporte_Acta.ActaRecibidoId = __;
    Soporte_Acta.Activo = true;
    Soporte_Acta.Consecutivo = Datos.Consecutivo;
    Soporte_Acta.FechaCreacion = new Date();
    Soporte_Acta.FechaModificacion = new Date();
    Soporte_Acta.FechaSoporte = Datos.Fecha_Factura;
    Soporte_Acta.ProveedorId = this.Proveedores.find(proveedor => proveedor.NumDocumento.toString() === proveedor___[0].toString()).Id;
    Transaccion.SoporteActa = Soporte_Acta;
    Transaccion.Elementos = this.Registrar_Elementos(Elementos_, Soporte_Acta);

    return Transaccion;
  }
  Registrar_Elementos(Datos: any, Soporte: SoporteActa): Array<Elemento> {
    const _ = new Array<Elemento>();

    for (const datos of Datos) {

      const Elemento__ = new Elemento;
      const valorTotal = (parseFloat(this.Pipe2Number(datos.Subtotal)) - parseFloat(this.Pipe2Number(datos.Descuento)));

      Elemento__.Id = parseFloat(Datos.Id);
      Elemento__.Nombre = datos.Nombre;
      Elemento__.Cantidad = datos.Cantidad;
      Elemento__.Marca = datos.Marca;
      Elemento__.Serie = datos.Serie;
      Elemento__.UnidadMedida =  this.Unidades.find(unidad => unidad.Unidad.toString() === datos.UnidadMedida.toString()).Id,
      Elemento__.ValorUnitario = parseFloat(this.Pipe2Number(datos.ValorUnitario));
      Elemento__.Subtotal = parseFloat(this.Pipe2Number(datos.Subtotal));
      Elemento__.Descuento = parseFloat(this.Pipe2Number(datos.Descuento));
      Elemento__.ValorTotal = valorTotal;
      Elemento__.PorcentajeIvaId = this.Tarifas_Iva.find(tarifa => tarifa.Nombre === datos.PorcentajeIvaId).Id;
      Elemento__.ValorIva = parseFloat(this.Pipe2Number(datos.ValorIva));
      Elemento__.ValorFinal = parseFloat(this.Pipe2Number(datos.ValorTotal));
      Elemento__.SubgrupoCatalogoId = parseFloat(datos.SubgrupoCatalogoId);
      Elemento__.Verificado = datos.Verificado;
      Elemento__.TipoBienId = this.Tipos_Bien.find(bien => bien.Nombre.toString() === datos.TipoBienId.toString());
      Elemento__.EstadoElementoId = this.Estados_Acta.find(estado => estado.Id === 2);
      Elemento__.SoporteActaId = Soporte;
      Elemento__.Activo = true;
      Elemento__.FechaCreacion = new Date();
      Elemento__.FechaModificacion = new Date();

      _.push(Elemento__);

    }
    return _;
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
  Pipe2Number(any: String) {
    if (any !== null) {
      return any.replace(/[$,]/g, '');
    } else {
      return '0';
    }
  }
  valortotal(subtotal: string, descuento: string, iva: string) {
    return (parseFloat(subtotal) - parseFloat(descuento) + parseFloat(iva));
  }
  valorXcantidad(valor_unitario: string, cantidad: string) {
    return (parseFloat(valor_unitario) * parseFloat(cantidad)).toString();
  }
  valor_iva(subtotal: string, descuento: string, porcentaje_iva: string) {
    return ((parseFloat(subtotal) - parseFloat(descuento)) * parseFloat(porcentaje_iva) / 100);
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

  // Validar Acta? (Aprobar?)
  Revisar_Totales() {
    if (!this.revisorValido()) {
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
        this.onFirstSubmit();
      }
    });
  }

  // Rechazar Acta?
  Revisar_Totales2() {
    if (!this.revisorValido()) {
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
          confirmButtonText: 'Rechazar',
          showCancelButton: true,
          progressSteps: ['1'],
        }).queue([
          {
            title: 'Observaciones',
            text: 'Inserte la razon de rechazo',
          },
        ]).then((result2) => {
          if (result2.value) {
            const obs = this.firstForm.value;
            this.firstForm.get('Formulario3').get('Datos_Adicionales').setValue(
              obs.Formulario3.Datos_Adicionales + ' // Razon de rechazo: ' + result2.value,
              );
            this.onFirstSubmit2();
          }
        });

      }
    });
  }
  getGranSubtotal() {

    if (this.Acta !== undefined) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorTotal).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
  getGranDescuentos() {

    if (this.Acta !== undefined) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.Descuento).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
  getGranValorIva() {

    if (this.Acta !== undefined) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorIva).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
  getGranTotal() {

    if (this.Acta !== undefined) {
      return this.Acta.SoportesActa.map(t => t.Elementos.map(w => w.ValorFinal).reduce((acc, value) => acc + value)).toString();
    } else {
      return '0';
    }
  }
  volver() {
  }
}
