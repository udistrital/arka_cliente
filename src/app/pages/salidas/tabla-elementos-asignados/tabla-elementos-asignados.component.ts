import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as XLSX from 'xlsx';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { DatosLocales, DatosLocales2 } from './datos_locales';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';
import { Impuesto, ElementoActa, Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Store } from '@ngrx/store';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { IAppState } from '../../../@core/store/app.state';
import { Router, NavigationEnd } from '@angular/router';
import { LocalDataSource } from 'ngx-smart-table';
import { ElementoSalida } from '../../../@core/data/models/salidas/salida_elementos';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';

@Component({
  selector: 'ngx-tabla-elementos-asignados',
  templateUrl: './tabla-elementos-asignados.component.html',
  styleUrls: ['./tabla-elementos-asignados.component.scss'],
})
export class TablaElementosAsignadosComponent implements OnInit {

  settings: any;
  settings2: any;
  bandera: boolean;
  navigationSubscription;
  actaRecibidoId: number;
  respuesta: any;
  Datos: ElementoSalida[];
  DatosConsumo: ElementoSalida[];
  Consumo: any;
  Sedes: any;
  Dependencias: any;
  ConsumoControlado: any;
  Devolutivo: any;
  DatosSeleccionados: any;
  formulario: boolean;
  Datos2: ElementoSalida[];
  bandera2: boolean;
  Observaciones: string;
  entradaId: string;
  Datos_Salida_Consumo: any;
  selected = new FormControl(0);

  @Input('actaRecibidoId')
  set name(acta_id: number) {
    this.actaRecibidoId = acta_id;
  }
  @Input('entradaId')
  set name2(entrada_id: string) {
    this.entradaId = entrada_id;
    // console.log(this.entradaId);
  }
  source: any;
  source2: any;
  elementos: Elemento[];

  constructor(private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private salidasHelper: SalidaHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager) {
    this.listService.findSubgruposConsumo();
    this.listService.findSubgruposConsumoControlado();
    this.listService.findSubgruposDevolutivo();
    this.listService.findDependencias();
    this.listService.findSedes();
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseInvites();
      }
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.cargarCampos();
    });
    this.source = new LocalDataSource(); // create the source
    this.source2 = new LocalDataSource();
    this.elementos = new Array<Elemento>();
    this.Datos2 = new Array<any>();
    this.cargarCampos();
    this.loadLists();

  }
  ngOnInit() {
  }
  initialiseInvites() {
    // Set default values and re-fetch any data you need.
    // this.ngOnInit();
    // console.log('1')
  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Consumo = list.listConsumo[0];
        this.ConsumoControlado = list.listConsumoControlado[0];
        this.Devolutivo = list.listDevolutivo[0];
        this.Sedes = list.listSedes[0];
        this.Dependencias = list.listDependencias[0];
        // console.log(this.actaRecibidoId);
        // console.log(this.Consumo);
        // console.log(this.Devolutivo);
        // console.log(this.ConsumoControlado);
        if (this.actaRecibidoId !== undefined && this.Consumo !== undefined &&
          this.ConsumoControlado !== undefined && this.Devolutivo !== undefined &&
          this.respuesta === undefined && this.Sedes !== undefined && this.Dependencias !== undefined) {
          this.actaRecibidoHelper.getElementosActa(this.actaRecibidoId).subscribe((res: any) => {
            // console.log(res)
            this.respuesta = res;
            this.AjustarDatos(res);
          });
        }
      },
    );

  }
  onRowSelect(event) {
    // console.log(event);
    this.DatosSeleccionados = event;
    if (Object.keys(this.DatosSeleccionados.selected).length !== 0) {
      this.formulario = true;
    } else {
      this.formulario = false;
    }

  }
  cargarCampos() {

    this.settings = {
      hideSubHeader: false,
      selectMode: 'multi',
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        delete: false,
        edit: false,
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="fas fa-pencil-alt"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-eye"></i>',
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: 'Elemento',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Cantidad: {
          title: 'Cantidad',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        TipoBienId: {
          title: 'Tipo de Bien',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
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
        SubgrupoCatalogoId: {
          title: 'Subgrupo',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
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
        Marca: {
          title: 'Marca',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Serie: {
          title: 'Serie',
          valuePrepareFunction: (value: any) => {
            return value;
          },

        },
        Funcionario: {
          title: 'Funcionario',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.NombreCompleto;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.compuesto.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
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
      },
    };

    this.settings2 = {
      hideSubHeader: false,
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        delete: false,
        edit: false,
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="fas fa-pencil-alt"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-eye"></i>',
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: 'Elemento',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Cantidad: {
          title: 'Cantidad',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        TipoBienId: {
          title: 'Tipo de Bien',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
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
        SubgrupoCatalogoId: {
          title: 'Subgrupo',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
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
        Marca: {
          title: 'Marca',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Serie: {
          title: 'Serie',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
      },
    };

  }

  AjustarDatos(datos: any[]) {
    // console.log(datos);
    this.Datos = new Array<ElementoSalida>();
    this.DatosConsumo = new Array<ElementoSalida>();
    for (const index in datos) {
      if (true) {
        // console.log(datos[index])
        const elemento = new ElementoSalida();
        elemento.ValorUnitario = datos[index].ValorUnitario;
        elemento.ValorTotal = datos[index].ValorTotal;
        elemento.Id = datos[index].Id;
        elemento.Nombre = datos[index].Nombre;
        elemento.Cantidad = datos[index].Cantidad;
        elemento.Marca = datos[index].Marca;
        elemento.Serie = datos[index].Serie;
        elemento.TipoBienId = datos[index].TipoBienId;
        elemento.Funcionario = null;
        elemento.Sede = null;
        elemento.Asignado = false;
        elemento.Dependencia = null;
        elemento.Ubicacion = null;
        if (datos[index].TipoBienId.Id === 1 && Object.keys(this.Consumo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        if (datos[index].TipoBienId.Id === 2 && Object.keys(this.ConsumoControlado[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        if (datos[index].TipoBienId.Id === 3 && Object.keys(this.Devolutivo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        // console.log(elemento);
        if (datos[index].TipoBienId.Id === 1) {
          this.DatosConsumo.push(elemento);
        } else {
          this.Datos.push(elemento);
        }
      }
    }

    if (this.DatosConsumo !== undefined) {
      this.Salida_Consumo();
      this.source2.load(this.DatosConsumo);
    }
    if (this.Datos !== undefined) {
      // console.log(this.Datos);
      if (Object.keys(this.Datos).length === 0) {
        // console.log('ok');
        this.bandera2 = true;
      }
      this.source.load(this.Datos);
    }
  }
  AjustarDatos2(datos: any[]) {
    this.Datos2 = new Array<ElementoSalida>();
    const datos2 = new Array<any>();
    for (const index in datos) {
      if (true) {
        // console.log(datos[index])
        const elemento = new ElementoSalida();
        elemento.ValorUnitario = datos[index].ValorUnitario;
        elemento.ValorTotal = datos[index].ValorTotal;
        elemento.Id = datos[index].Id;
        elemento.Nombre = datos[index].Nombre;
        elemento.Cantidad = datos[index].Cantidad;
        elemento.Marca = datos[index].Marca;
        elemento.Serie = datos[index].Serie;
        elemento.Asignado = datos[index].Asignado;
        elemento.TipoBienId = datos[index].TipoBienId;
        if (datos[index].Funcionario !== null) {
          if (datos[index].Funcionario !== undefined) {
            elemento.Funcionario = datos[index].Funcionario;
          }
        }
        if (datos[index].Sede !== null) {
          if (datos[index].Sede !== undefined) {
            elemento.Sede = datos[index].Sede;
          }
        }
        if (datos[index].Dependencia !== null) {
          if (datos[index].Dependencia !== undefined) {
            elemento.Dependencia = datos[index].Dependencia;
          }
        }
        if (datos[index].Ubicacion !== null) {
          if (datos[index].Ubicacion !== undefined) {
            elemento.Ubicacion = datos[index].Ubicacion;
          }
        }
        if (datos[index].TipoBienId.Id === 1 && Object.keys(this.Consumo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        if (datos[index].TipoBienId.Id === 2 && Object.keys(this.ConsumoControlado[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        if (datos[index].TipoBienId.Id === 3 && Object.keys(this.Devolutivo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        elemento.SubgrupoCatalogoId = datos[index].SubgrupoCatalogoId;
        datos2.push(elemento);
      }
    }
    if (datos2 !== undefined) {
      this.source.load(datos2);
      this.formulario = false;
      // console.log(this.source);
      this.checkElementosAsignados();
    }
  }

  checkElementosAsignados() {
    this.bandera = false;
    // console.log(this.source);
    for (const datos of this.source.data) {
      if (datos.Asignado !== true) {
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
  onEdit(event): void {
  }

  itemselec(event): void {

  }
  onCreate(event): void {

  }

  onDelete(event): void {

  }
  Traer_Relacion_Ubicaciones() {

  }
  Salida_Consumo() {

    if (Object.keys(this.DatosConsumo).length !== 0) {
      const sede = 'FICC';
      const dependencia = 'ALMACEN GENERAL E INVENTARIOS';

      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Codigo === sede);
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      // console.log(transaccion);
      this.actaRecibidoHelper.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
        // console.log(res)
        const detalle = {
          ubicacion: res[0].Relaciones[0].Id,
        };
        const Salida = {
          Salida: {
            Observacion: 'Salida Automatica para Bodega de Consumo',
            Detalle: JSON.stringify(detalle),
            Activo: true,
            MovimientoPadreId: null, // parseFloat(this.entradaId),
            FormatoTipoMovimientoId: {
              Id: 9,
            },
            EstadoMovimientoId: {
              Id: 3,
            },
          },
          Elementos: [],
        };

        for (const currentValue of this.DatosConsumo) {
          const elemento = {};
          elemento['Activo'] = true;
          elemento['ElementoActaId'] = currentValue.Id;
          elemento['SaldoCantidad'] = currentValue.Cantidad;
          elemento['SaldoValor'] = currentValue.ValorTotal;
          elemento['Unidad'] = currentValue.Cantidad;
          elemento['ValorUnitario'] = currentValue.ValorUnitario;
          elemento['ValorTotal'] = currentValue.ValorTotal;

          Salida.Elementos.push(elemento);
          // console.log(Salida)
        }
        this.Datos_Salida_Consumo = Salida;
      });
    }

  }
  Salida_General() {
    if (Object.keys(this.Datos).length !== 0) {
      const datos_agrupados2 = this.source.data.reduce((accumulator, currentValue) => {
        const detalle = {
          funcionario: currentValue.Funcionario.Id,
          ubicacion: currentValue.Ubicacion.Id,
        };
        const val = currentValue.Funcionario.Id + '-' + currentValue.Ubicacion.Id;
        accumulator[val] = accumulator[val] || {
          Salida: {
            Observacion: this.Observaciones,
            Detalle: JSON.stringify(detalle),
            Activo: true,
            MovimientoPadreId: null, // parseFloat(this.entradaId),
            FormatoTipoMovimientoId: {
              Id: 7,
            },
            EstadoMovimientoId: {
              Id: 3,
            },
          },
          Elementos: [],
        };
        // accumulator[val].Ubicacion = currentValue.Ubicacion.Id;
        // accumulator[val].Funcionario = currentValue.Funcionario.Id;
        const elemento = {};
        elemento['Activo'] = true;
        elemento['ElementoActaId'] = currentValue.Id;
        elemento['SaldoCantidad'] = currentValue.Cantidad;
        elemento['SaldoValor'] = currentValue.ValorTotal;
        elemento['Unidad'] = currentValue.Cantidad;
        elemento['ValorUnitario'] = currentValue.ValorUnitario;
        elemento['ValorTotal'] = currentValue.ValorTotal;

        accumulator[val].Elementos.push(elemento);
        // console.log(currentValue);
        return accumulator;

      }, {});

      return datos_agrupados2;
    } else {
      return this.Datos;
    }

  }
  onSubmit() {

    const datos_agrupados = this.Salida_General();
    // console.log(datos_agrupados);
    // console.log(Object.keys(datos_agrupados));
    const Salidas = {
      Salidas: [],
    };
    if (Object.keys(this.DatosConsumo).length !== 0) {
      Salidas.Salidas.push(this.Datos_Salida_Consumo);
    }

    if (Object.keys(datos_agrupados).length !== 0) {
      for (const salida of Object.keys(datos_agrupados)) {
        Salidas.Salidas.push(datos_agrupados[salida]);
      }
    }


    // console.log(Salidas);

    (Swal as any).fire({
      title: 'Desea Registrar Salida?',
      text: 'Esta seguro de registrar los datos suministrados',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        this.salidasHelper.postSalidas(Salidas).subscribe(res => {
          // console.log(res);
          (Swal as any).fire({
            title: 'Salida Registrada',
            text: 'Ok',
          });
        });

      }
    });
  }


  onBack() {

  }

}
