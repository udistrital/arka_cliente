import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';

import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';
import { NbDialogService } from '@nebular/theme';
import { AjustarCantidadComponent } from '../ajustar-cantidad/ajustar-cantidad.component';
import { Store } from '@ngrx/store';
import { ListService } from '../../../@core/store/services/list.service';
import { IAppState } from '../../../@core/store/app.state';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-detalle-solicitud',
  templateUrl: './detalle-solicitud.component.html',
  styleUrls: ['./detalle-solicitud.component.scss'],
})

export class DetalleSolicitudComponent implements OnInit {
  salida_id: any;
  settings: any;
  source: LocalDataSource;
  Solicitud: any;
  Editar: boolean;
  verificar: boolean = true;
  FormatosKardex: any;
  EstadosMovimiento: any;
  form_apertura: FormGroup;
  Detalle_Solicitud: any;
  submitted: boolean;
  @Output() done = new EventEmitter<boolean>();
  @Input('Editar')
  set name4(edit: boolean) {
    this.Editar = edit;
    // console.log(edit)
  }

  @Input('salida_id')
  set name(salida_id: any) {
    this.salida_id = salida_id;
    // console.log(this.subgrupo_id);
    if (this.salida_id !== undefined && this.Editar !== undefined) {
      // console.log({salida_id: this.salida_id, Editar: this.Editar});
      this.loadTablaSettings(this.Editar);
      this.loadSolicitud();
    }
  }

  constructor(
    private translate: TranslateService,
    private dialogService: NbDialogService,
    private bodegaHelper: BodegaConsumoHelper,
    private tercerosHelper: TercerosHelper,
    private actasHelper: ActaRecibidoHelper,
    private router: Router,
    private store: Store<IAppState>,
    private fb: FormBuilder,
    private BodegaConsumo: BodegaConsumoHelper,
    private listService: ListService,
    private pUpManager: PopUpManager) {
    this.source = new LocalDataSource();
    if (this.Editar === undefined) {
      this.Editar = false;
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        // console.log(list.listFormatosKardex[0]);
        // console.log(list.listEstadosMovimiento[0])
        this.FormatosKardex = list.listFormatosKardex[0];
        this.EstadosMovimiento = list.listEstadosMovimiento[0];
      },
    );
  }

  ngOnInit() {
    // console.log('salida id: ', this.salida_id)
    if (this.Editar) {
      this.listService.findformatosKardex();
      this.listService.findEstadosMovimiento();
      this.loadLists();
      this.form_apertura = this.fb.group({
        Observaciones: ['', Validators.required],
      });
    }
  }

  loadTablaSettings(editar: boolean) {
    const settings = {
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: false,
        delete: false,
        edit: this.Editar,
      },
      edit: {
        editButtonContent: '<i class="fas fa-pencil-alt" title="' + this.translate.instant('GLOBAL.editar') + '"></i>',
      },
      mode: 'external',
      columns: {
        SubgrupoCatalogoId: {
          title: this.translate.instant('GLOBAL.BodegaConsumo.Solicitud.ColumnaElementoCatalogo'),
          valuePrepareFunction: (value: any) => {
            return !value ? '' : value.Codigo ? value.Codigo + ' - ' + value.Nombre : value.Nombre;
          },
          filterFunction: this.filterFunction,
        },
        ElementoCatalogoId: {
          title: this.translate.instant('GLOBAL.Elemento.Relacionado'),
          valuePrepareFunction: (value: any) => {
            return !value ? '' : value.Codigo ? value.Codigo + ' - ' + value.Nombre : value.Nombre;
          },
          filterFunction: this.filterFunction,
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
        Cantidad: {
          title: this.translate.instant('GLOBAL.Solicitudes.CantSolicitada'),
        },
      },
    };
    if (editar) {
      settings.columns['SaldoCantidad'] = {
        title: this.translate.instant('GLOBAL.Solicitudes.CantDisponible'),
      };
    }
    settings.columns['CantidadAprobada'] = {
      title: this.translate.instant('GLOBAL.Solicitudes.CantAprobada'),
    };

    this.settings = settings;
  }

  loadSolicitud(): void {
    this.bodegaHelper.getSolicitudBodega(this.salida_id.Id).subscribe(res => {
      // console.log({res});
      if (Object.keys(res).length !== 0) {
        if (Array.isArray(res.Elementos)) {
          this.source.load(res.Elementos);
        }
        this.Solicitud = res.Solicitud[0];
        this.Detalle_Solicitud = JSON.parse(this.Solicitud.Detalle);
      }
    });
  }

  onEdit(event) {
    // console.log({event});
    this.dialogService.open(AjustarCantidadComponent, {
      context: {
        row: event.data,
      },
    }).onClose.subscribe(data => {
      if (data) {
        this.AgregarElementos(data);
        this.RevisarCantidadesAprobadas();
      }
    });
  }

  RevisarCantidadesAprobadas() {
    this.source.getAll().then((res) => {
      this.verificar = true;
      let verificar2 = true;
      for (const elementos of res) {
        if (elementos.CantidadAprobada === 0) {
          verificar2 = false;
        } else {
          this.verificar = false;
        }
        this.Detalle_Solicitud.Elementos.forEach((element: any) => {
          if (element.ElementoCatalogoId === elementos.ElementoCatalogoId.Id) {
            element.CantidadAprobada = elementos.CantidadAprobada;
          }
        });
      }
      if (verificar2) {
        this.Solicitud.EstadoMovimientoId = this.EstadosMovimiento.find(x => x.Id === 6);
      } else {
        this.Solicitud.EstadoMovimientoId = this.EstadosMovimiento.find(x => x.Id === 7);
      }
    });
  }

  AgregarElementos(elemento: any) {

    this.source.find(elemento).then((res) => {
      this.source.update(res, elemento);

    }).catch(() => {
      this.source.add(elemento);
      this.source.refresh();
    });
    this.source.refresh();
  }

  onAprobar() {
    if (this.submitted) {
      return;
    } else {
      this.submitted = true;
    }

    const SalidaKardex = {
      Movimiento: [],
    };

    this.Solicitud.Detalle = JSON.stringify(this.Detalle_Solicitud);
    const form = this.form_apertura.value;
    const Movimiento: any = {};
    Movimiento.Observacion = form.Observaciones;
    Movimiento.Activo = true;
    Movimiento.Detalle = JSON.stringify({});
    Movimiento.FormatoTipoMovimientoId = this.FormatosKardex.find(x => x.CodigoAbreviacion === 'SAL_KDX');
    Movimiento.EstadoMovimientoId = this.Solicitud.EstadoMovimientoId;
    Movimiento.MovimientoPadreId = this.Solicitud;
    SalidaKardex.Movimiento.push(
      {
        Kardex: Movimiento,
        Elementos: [],
      },
    );

    this.source.getAll().then((elementos) => {
      // console.log({res});
      elementos.forEach(element => {

        const elemento: any = {};
        const valor_promedio = element.SaldoValor / element.SaldoCantidad;
        // console.log(valor_promedio)
        elemento.Id = element.Id;
        elemento.Activo = true;
        elemento.ElementoCatalogoId = element.ElementoCatalogoId.Id;
        elemento.Unidad = element.CantidadAprobada;
        elemento.ValorTotal = element.CantidadAprobada * valor_promedio;
        elemento.ValorUnitario = valor_promedio;
        elemento.SaldoCantidad = element.SaldoCantidad - element.CantidadAprobada;
        elemento.SaldoValor = element.SaldoValor - (valor_promedio * element.CantidadAprobada);

        SalidaKardex.Movimiento[0].Elementos.push(elemento);

      });

      this.BodegaConsumo.postResponderSolicitud(SalidaKardex).subscribe((res: any) => {
        if (res) {
          this.done.emit(true);
          this.pUpManager.showAlertWithOptions(this.optionsAprobacion);
        }
      });
    });

  }

  onRechazar() {
    if (this.submitted) {
      return;
    } else {
      this.submitted = true;
    }

    this.Solicitud.EstadoMovimientoId = this.EstadosMovimiento.find(x => x.Id === 8);
    this.Detalle_Solicitud.Elementos.forEach((element: any) => {
      element.CantidadAprobada = 0;
    });
    this.Solicitud.Detalle = JSON.stringify(this.Detalle_Solicitud);

    this.BodegaConsumo.postRechazarSolicitud(this.Solicitud).subscribe((res: any) => {
      if (res) {
        this.done.emit(true);
        this.pUpManager.showAlertWithOptions(this.optionsRechazo);
      }
    });
  }

  private filterFunction(cell?: any, search?: string): boolean {
    if (cell && search.length) {
      if (cell.Codigo && cell.Nombre) {
        if ((cell.Codigo + ' - ' + cell.Nombre.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
          return true;
        } else {
          return false;
        }
      } else if (cell.Nombre) {
        if ((cell.Nombre.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  get optionsRechazo() {
    return {
      title: this.translate.instant('GLOBAL.movimientos.SalidaRechazadaTitle'),
      text: this.translate.instant('GLOBAL.movimientos.SalidaRechazadaText', { CONSECUTIVO: this.Detalle_Solicitud.Consecutivo }),
      type: 'success',
    };
  }

  get optionsAprobacion() {
    return {
      title: this.translate.instant('GLOBAL.salidas.exito_registro_titulo'),
      text: this.translate.instant('GLOBAL.salidas.exito_registro_texto', { CONSECUTIVO: this.Detalle_Solicitud.Consecutivo }),
      type: 'success',
    };
  }

}
