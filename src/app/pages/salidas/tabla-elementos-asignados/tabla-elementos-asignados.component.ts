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

@Component({
  selector: 'ngx-tabla-elementos-asignados',
  templateUrl: './tabla-elementos-asignados.component.html',
  styleUrls: ['./tabla-elementos-asignados.component.scss'],
})
export class TablaElementosAsignadosComponent implements OnInit {

  settings: any;
  bandera: boolean;
  navigationSubscription;
  actaRecibidoId: number;
  respuesta: any;
  Datos: ElementoSalida[];
  Consumo: any;
  ConsumoControlado: any;
  Devolutivo: any;
  DatosSeleccionados: any;
  formulario: boolean;
  Datos2: ElementoSalida[];
  bandera2: boolean;

  @Input('actaRecibidoId')
  set name(acta_id: number) {
    this.actaRecibidoId = acta_id;
  }
  source: any;
  elementos: Elemento[];

  constructor(private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager) {
    this.listService.findSubgruposConsumo();
    this.listService.findSubgruposConsumoControlado();
    this.listService.findSubgruposDevolutivo();
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
        // console.log(this.actaRecibidoId);
        // console.log(this.Consumo);
        // console.log(this.Devolutivo);
        // console.log(this.ConsumoControlado);
        if (this.actaRecibidoId !== undefined && this.Consumo !== undefined &&
          this.ConsumoControlado !== undefined && this.Devolutivo !== undefined &&
          this.respuesta === undefined) {
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
              return value.compuesto;
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
  }

  AjustarDatos(datos: any[]) {
    // console.log(datos);
    this.Datos = new Array<ElementoSalida>();
    for (const index in datos) {
      if (true) {
        // console.log(datos[index])
        const elemento = new ElementoSalida();
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
        this.Datos.push(elemento);
      }
    }

    if (this.Datos !== undefined) {
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
  funcion_Reduccion(data: any, param: string) {

  }
  onSubmit() {
    const datos_agrupados = this.source.data.reduce((accumulator, currentValue) => {
      const val = currentValue.Funcionario.Id + '-' + currentValue.Ubicacion.Id;
      accumulator[val] = accumulator[val] || { Ubicacion: 0, Funcionario: 0, Elementos: [] };
      accumulator[val].Ubicacion = currentValue.Ubicacion.Id;
      accumulator[val].Funcionario = currentValue.Funcionario.Id;
      accumulator[val].Elementos.push(currentValue.Id);

      // console.log(currentValue);
      return accumulator;

    }, {});
    // console.log(datos_agrupados);

    // console.log(Object.keys(datos_agrupados));
  }

  onBack() {

  }

}
