import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { LocalDataSource } from 'ng2-smart-table';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';
import { UserService } from '../../../@core/data/users.service';
import { CentroCostosHelper } from '../../../helpers/movimientos/centroCostosHelper';

@Component({
  selector: 'ngx-form-elementos-seleccionados',
  templateUrl: './form-elementos-seleccionados.component.html',
  styleUrls: ['./form-elementos-seleccionados.component.scss'],
})

export class FormElementosSeleccionadosComponent implements OnInit {

  Ubicaciones: any;
  ubicacionesFiltradas: any[] = [];
  form_salida: FormGroup;
  Datos: any;
  settings2: any;
  source2: LocalDataSource;
  detalle2: boolean;
  consecutivo: number;

  @Input('Datos')
  set name(datos_seleccionados: any) {
    this.Datos = datos_seleccionados;
  }
  @Output() DatosEnviados = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
    private store: Store<IAppState>,
    private listService: ListService,
    private bodegaConsumoHelper: BodegaConsumoHelper,
    private userService: UserService,
    private pUpManager: PopUpManager,
    public centroCostosHelper: CentroCostosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.source2 = new LocalDataSource();
    this.loadTablaSettings();

  }

  ngOnInit() {
    this.form_salida = this.Formulario;
    this.Traer_Relacion_Ubicaciones();
  }
  get Formulario(): FormGroup {
    return this.fb.group({
      Cantidad: [0, Validators.min(1)],
      Sede: [''],
      Dependencia: [''],
      Ubicacion: ['', Validators.required],
    });
  }
  Traer_Relacion_Ubicaciones() {
    this.centroCostosHelper.getAllCentroCostos().subscribe((res: any) => {
      this.Ubicaciones = res || [];
      this.ubicacionesFiltradas = this.Ubicaciones;
    });
  }

  onSeleccionarElemento() {
    const form = this.form_salida.value;
    // console.log(form);
    // console.log(this.Datos);
    if (!this.form_salida.valid || form.Cantidad > this.Datos.SaldoCantidad) {
      // console.log('valor excede limite')
      (Swal as any).fire({
        title: 'Cantidad No Valida',
        text: 'La cantidad no debe ser nula ni exceder la cantidad máxima disponible',
        type: 'warning',
      });
    } else {

      // console.log(this.Datos)
      const elemento = this.Datos;
      const ubicacion = this.centroCostosHelper.findCentroCostoById(
        this.Ubicaciones,
        this.centroCostosHelper.getCentroCostoId(form.Ubicacion),
      ) || form.Ubicacion;

      // elemento.Funcionario = this.Proveedores.find(z => z.compuesto === form.Proveedor);
      elemento.Sede = { Nombre: ubicacion && ubicacion.Sede ? ubicacion.Sede : '' };
      elemento.Dependencia = { Nombre: ubicacion && ubicacion.Dependencia ? ubicacion.Dependencia : '' };
      elemento.Ubicacion = ubicacion;
      elemento.Cantidad = parseInt(form.Cantidad, 10);
      // this.DatosEnviados.emit(elemento);
      this.AgregarElementos(elemento);
    }

  }

  muestraCentroCosto = (centroCosto: any): string => this.centroCostosHelper.muestraCentroCosto(centroCosto);

  onSubmit() {
    if (!this.checkTercero()) {
      return;
    }

    this.source2.getElements().then((res: any) => {
      const detalle_solicitud = [];
      for (const elements of res) {
        const elemento = {
          Ubicacion: elements.Ubicacion.Id,
          ElementoCatalogoId: elements.ElementoCatalogoId.Id,
          Cantidad: elements.Cantidad,
        };
        detalle_solicitud.push(elemento);
      }
      const solicitud = {
        Funcionario: this.userService.getPersonaId(),
        Elementos: detalle_solicitud,
      };

      this.bodegaConsumoHelper.postSolicitud(solicitud).subscribe((res_: any) => {
        if (res_.Id) {
          this.consecutivo = res_.Consecutivo;
          this.pUpManager.showAlertWithOptions(this.optionsRegistro);
          this.router.navigate(['/pages/bodega_consumo/consulta_solicitud']);
        }
      });
    });
  }

  private checkTercero(): boolean {
    if (!this.userService.getPersonaId()) {
      this.pUpManager.showAlertWithOptions(this.optionsErrorTercero);
      return false;
    }

    return true;

  }

  loadTablaSettings() {
    this.settings2 = {
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.eliminar'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.eliminar'),
            title: '<i class="fas fa-times" title="Ver"></i>',
          },
        ],
      },
      columns: {
        CodigoElemento: {
          title: this.translate.instant('GLOBAL.codigo'),
        },
        NombreElemento: {
          title: this.translate.instant('GLOBAL.Nombre'),
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.Descripcion'),
        },
        Cantidad: {
          title: this.translate.instant('GLOBAL.cantidad'),
        },
        Sede: {
          title: this.translate.instant('GLOBAL.sede'),
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
          title: this.translate.instant('GLOBAL.dependencia'),
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
          title: this.translate.instant('GLOBAL.ubicacion'),
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return this.centroCostosHelper.muestraCentroCosto(value);
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            if (Object.keys(cell).length !== 0) {
              if (this.centroCostosHelper.muestraCentroCosto(cell).indexOf(search) > -1) {
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
      elemento.NombreElemento = elemento.ElementoCatalogoId.Nombre;
      elemento.CodigoElemento = elemento.ElementoCatalogoId.Codigo;
      elemento.Descripcion = elemento.ElementoCatalogoId.Descripcion;
      this.source2.add(elemento);
      this.source2.refresh();
    });
    this.source2.refresh();
    this.detalle2 = true;
  }

  get optionsRegistro() {
    return {
      type: 'success',
      title: this.translate.instant('GLOBAL.salidas.exitoRegistroSolicitudTtl'),
      text: this.translate.instant('GLOBAL.salidas.exitoRegistroSolicitudTxt', { CONSECUTIVO: this.consecutivo }),
    };
  }

  get optionsErrorTercero() {
    return {
      type: 'error',
      title: this.translate.instant('GLOBAL.error'),
      text: this.translate.instant('GLOBAL.Errores.errorTercero'),
    };
  }

}
