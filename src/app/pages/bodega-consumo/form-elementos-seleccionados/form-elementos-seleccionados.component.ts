import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
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
import { LocalDataSource } from 'ngx-smart-table';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';
import { UserService } from '../../../@core/data/users.service';


@Component({
  selector: 'ngx-form-elementos-seleccionados',
  templateUrl: './form-elementos-seleccionados.component.html',
  styleUrls: ['./form-elementos-seleccionados.component.scss'],
})
export class FormElementosSeleccionadosComponent implements OnInit {


  searchStr: string;
  searchStr2: Array<string>;
  searchStr3: string;
  dataService: CompleterData;
  dataService2: CompleterData;
  dataService3: CompleterData;
  Proveedores: any;
  Dependencias: any;
  Ubicaciones: any;
  Sedes: any;
  form_salida: FormGroup;
  Datos: any;
  settings2: any;
  source2: LocalDataSource;
  detalle2: boolean;

  @Input('Datos')
  set name(datos_seleccionados: any) {
    this.Datos = datos_seleccionados;
  }
  @Output() DatosEnviados = new EventEmitter();

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
    private bodegaConsumoHelper: BodegaConsumoHelper,
    private userService: UserService,


  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.source2 = new LocalDataSource();
    // this.listService.findProveedores();
    this.listService.findDependencias();
    this.listService.findSedes();
    this.loadTablaSettings();
    // this.listService.findUbicaciones();
    this.loadLists();

  }

  ngOnInit() {
    this.form_salida = this.Formulario;
  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        // this.Proveedores = list.listProveedores[0];
        this.Dependencias = list.listDependencias[0];
        // this.Ubicaciones = list.listUbicaciones[0];
        this.Sedes = list.listSedes[0];
        // this.dataService2 = this.completerService.local(this.Proveedores, 'compuesto', 'compuesto');
        this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
        // this.dataService = this.completerService.local(this.Ubicaciones, 'Nombre', 'Nombre');
      },
    );
  }
  get Formulario(): FormGroup {
    return this.fb.group({

      Cantidad: ['', Validators.required],
      Sede: ['', Validators.required],
      Dependencia: ['', Validators.required],
      Ubicacion: ['', Validators.required],
    });
  }
  Traer_Relacion_Ubicaciones() {
    const sede = this.form_salida.get('Sede').value;
    const dependencia = this.form_salida.get('Dependencia').value;

    if (this.form_salida.get('Sede').valid || this.form_salida.get('Dependencia').valid) {
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      // console.log(this.Sedes);
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          // console.log(res)
          if (Object.keys(res[0]).length !== 0) {
            this.Ubicaciones = res[0].Relaciones;
          } else {
            this.Ubicaciones = undefined;
          }
        });
      }
    }
  }

  onSubmit() {
    const form = this.form_salida.value;
    // console.log(form);
    // console.log(this.Datos);
    if ((form.Cantidad > this.Datos.SaldoCantidad) || (parseFloat(form.Cantidad) === 0.00)) {
      // console.log('valor excede limite')
      (Swal as any).fire({
        title: 'Cantidad No Valida',
        text: 'Ca cantidad no debe ser nula ni exceder la cantidad maxima disponible',
        type: 'warning',
      });
    } else {

      // console.log(this.Datos)
      const elemento = this.Datos;

      // elemento.Funcionario = this.Proveedores.find(z => z.compuesto === form.Proveedor);
      elemento.Sede = this.Sedes.find(y => y.Id === parseFloat(form.Sede));
      elemento.Dependencia = this.Dependencias.find(y => y.Nombre === form.Dependencia);
      elemento.Ubicacion = this.Ubicaciones.find(w => w.Id === parseFloat(form.Ubicacion));
      elemento.Cantidad = form.Cantidad;
      // this.DatosEnviados.emit(elemento);
      this.AgregarElementos(elemento);
    }

  }
  onSubmit2() {
    this.source2.getElements().then((res: any) => {
      // console.log(res);
      const detalle_solicitud = [];
      for (const elements of res) {

        const elemento = {
          Ubicacion: elements.Ubicacion.Id,
          ElementoActa: elements.ElementoCatalogoId.Id,
          Cantidad: elements.Cantidad,
        };
        detalle_solicitud.push(elemento);
      }
      const solicitud = {
        Funcionario: this.userService.getPersonaId(),
        Elementos: detalle_solicitud,
      };
      // console.log(solicitud);
      const movimiento = {
        Observacion: 'Solicitud de elementos para Bodega de Consumo',
        Detalle: JSON.stringify(solicitud),
        Activo: true,
        MovimientoPadreId: null, // parseFloat(this.entradaId),
        FormatoTipoMovimientoId: {
          Id: 8,
        },
        EstadoMovimientoId: {
          Id: 5,
        },
      };
      this.bodegaConsumoHelper.postSolicitud(movimiento).subscribe((res_: any) => {
        const opt: any = {
          title: 'Solicitud No ' + res_.Id,
          text: 'Se ha registrado la solicitud de los elementos relacionados',
          type: 'success',
        };
        (Swal as any).fire(opt);
        this.router.navigate(['/pages/bodega_consumo/consulta_solicitud']);
      });
    });
  }
  usarLocalStorage() {
  }
  loadTablaSettings() {

    this.settings2 = {

      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'Eliminar',
            title: '<i class="fas fa-times" title="Ver"></i>',
          },
        ],
      },
      columns: {
        Nombre: {
          title: 'Nombre',
        },
        ElementoCatalogoId: {
          title: 'Descripcion',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Descripcion;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Descripcion.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Cantidad: {
          title: 'Cantidad',
        },
        Sede: {
          title: 'Sede',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Dependencia: {
          title: 'Dependencia',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Ubicacion: {
          title: 'Ubicacion',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.EspacioFisicoId.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.EspacioFisicoId.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
      },
    };
  }

  onCustom(event) {
    // console.log(event);
    this.source2.remove(event.data).then((res) => {
      if (this.source2.count() === 0) {
        this.detalle2 = false;
      }
    });
    this.source2.refresh();
  }

  AgregarElementos(elemento: any) {

    this.source2.find(elemento).then((res) => {
      this.source2.update(res, elemento);

    }).catch(() => {
      this.source2.add(elemento);
      this.source2.refresh();
    });
    this.source2.refresh();
    this.detalle2 = true;
  }
}
