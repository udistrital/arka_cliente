import { Ubicacion } from './../../../@core/data/models/acta_recibido/soporte_acta';
import { Row } from 'ngx-smart-table/lib/data-set/row';
import { Proveedor } from './../../../@core/data/models/acta_recibido/Proveedor';
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
import {Ng2SmartTableComponent} from 'ng2-smart-table/ng2-smart-table.component';

@Component({
  selector: 'ngx-tabla-elementos-asignados',
  templateUrl: './tabla-elementos-asignados.component.html',
  styleUrls: ['./tabla-elementos-asignados.component.scss'],
})
export class TablaElementosAsignadosComponent implements OnInit {

  @ViewChild('table') table: Ng2SmartTableComponent;
  settings: any;
  settings2: any;
  bandera: boolean;
  navigationSubscription;
  actaRecibidoId: number;
  respuesta: any;
  Datos: ElementoSalida[];
  DatosConsumo: ElementoSalida[];
  DatosElementos: any;
  ElementosConsumoNoAsignados: ElementoSalida[];
  ElementosConsumoAsignados: ElementoSalida[];
  ElementosConsumoSinAsignar: ElementoSalida[];
  ElementosConsumoControladoSinAsignar: ElementoSalida[];
  IndicesSeleccionados: number[] = new Array();
  Consumo: any;
  Sedes: any;
  Dependencias: any;
  ConsumoControlado: any;
  Clases: any;
  Devolutivo: any;
  DatosSeleccionados: any;
  ConsumoSeleccionados: any;
  AsignarDeConsumo: boolean;
  formulario: boolean;
  Datos2: ElementoSalida[];
  bandera2: boolean;
  Observaciones: string;
  ObservacionesConsumo: string;
  entradaId: string;
  Datos_Salida_Consumo: any;
  selected = new FormControl(0);
  estadoShift: boolean;
  rango: any = null;
  JefeOficinaId: number;
  showControlado: boolean;
  showConsumo: boolean;
  mode: string = 'determinate';
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
    this.listService.findClases();
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseInvites();
      }
    });

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.cargarCampos();
    });
    this.respuesta = undefined;
    this.source = new LocalDataSource(); // create the source
    this.source2 = new LocalDataSource();
    this.elementos = new Array<Elemento>();
    this.Datos2 = new Array<any>();
    this.cargarCampos();
    this.loadLists();

  }
  ngOnInit() {
    this.respuesta = undefined;
    this.source = new LocalDataSource(); // create the source
    this.source2 = new LocalDataSource();
    this.elementos = new Array<Elemento>();
    this.Datos2 = new Array<any>();
    this.cargarCampos();
    this.salidasHelper.getJefeOficina().subscribe((res: any) => {
      if (res) {
        this.JefeOficinaId = res[0].TerceroPrincipalId.Id;
      }
    });
    this.loadLists();
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
        if (this.actaRecibidoId !== undefined && this.Consumo !== undefined &&
          this.ConsumoControlado !== undefined && this.Devolutivo !== undefined &&
          this.respuesta === undefined && this.Sedes !== undefined && this.Dependencias !== undefined) {
          this.actaRecibidoHelper.getElementosActa(this.actaRecibidoId).subscribe((res: any) => {
            this.respuesta = res;
            this.AjustarDatos(res);
          });
        }
      },
    );

  }
  onRowSelect(event) {
    const result = this.table.grid.getRows().filter(row => row.isSelected);
    result.forEach((row) => {
      if (this.IndicesSeleccionados.length > 0) {
          const found = this.IndicesSeleccionados.find(element => element === row.index);
          if (found === undefined)
             this.IndicesSeleccionados.push(row.index);

      } else {
         this.IndicesSeleccionados.push(row.index);
      }
    });

// si sacan de elementos seleccionados los que hayan sido deseleccionados

    let seleccionar = false;
    const numeroelementos = this.IndicesSeleccionados.length;
    if (this.estadoShift === true && numeroelementos > 1) {
        if (this.IndicesSeleccionados[numeroelementos - 1] > this.IndicesSeleccionados[numeroelementos - 2] + 1)
          seleccionar = true;
    }


    this.IndicesSeleccionados.forEach((row, index) => {
       const found = result.find(element => element.index === row);
       if (found === undefined) {
          this.IndicesSeleccionados.splice(index);
          seleccionar = false;
       }
    });

    if (seleccionar === true) {
      this.table.grid.getRows().forEach((row) => {
        if (row.index > this.IndicesSeleccionados[numeroelementos - 2] &&
           row.index <= this.IndicesSeleccionados[numeroelementos - 1])
             this.table.grid.multipleSelectRow(row);
      });
    }
    this.DatosSeleccionados = event;
    if (Object.keys(this.DatosSeleccionados.selected).length !== 0) {
      this.formulario = true;
    } else { // if (Object.keys(this.DatosSeleccionados.data[0]) === 1)
      this.formulario = false;
    }



/*
    this.DatosSeleccionados = event;
    if (Object.keys(this.DatosSeleccionados.selected).length !== 0) {
      this.formulario = true;
    } else { // if (Object.keys(this.DatosSeleccionados.data[0]) === 1)
      this.formulario = false;
    }*/
  }

  onRowSelect2(event) {
    if (this.rango && event.data && event.data.Id === this.rango.Id && event.isSelected === false) {
      this.rango = null;
    }
    if (!event.isSelected) {
      this.rango = null;
    }
    if (event.isSelected === true && event.selected) {
      const dataFilter = this.source2.getFilteredAndSorted();
      const dConsumo = dataFilter.__zone_symbol__value.map((row, index) => ({ ...row, ...{ index: index } }));
      if (!this.estadoShift && !this.rango) {
        this.rango = dConsumo.filter((data) => (data.Id === event.data.Id))[0];

      } else if (this.estadoShift && this.rango) {
        const valorFinal = dConsumo.filter((data) => (data.Id === event.data.Id))[0];
        const asc = this.rango.index < valorFinal.index;
        dConsumo.filter((dato) => {
          return (asc ? (dato.index > this.rango.index && dato.index < valorFinal.index) :
            (dato.index < this.rango.index && dato.index > valorFinal.index));
        }).map((i: any) => (setTimeout(() => {
          (<any>(document.getElementsByClassName('ng2-smart-actions ng2-smart-action-multiple-select')[i.index])).click();
        }, 50)));
        this.rango = null;
      }
    }

    this.ConsumoSeleccionados = event;
    if (Object.keys(this.ConsumoSeleccionados.selected).length !== 0) {
      this.AsignarDeConsumo = true;
    } else {
      this.AsignarDeConsumo = false;
    }
  }

  cargarCampos() {

    this.settings = {
      pager: {
        display: true,
        perPage: 10,
      },
      hideSubHeader: false,
      selectMode: 'multi',
      noDataMessage: 'No se encontraron elementos de consumo controlado asociados a esta entrada.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        delete: false,
        edit: false,
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
        Placa: {
          title: 'Placa',
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
      selectMode: 'multi',
      noDataMessage: 'No se encontraron elementos de consumo asociados a esta entrada.',
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
    this.DatosConsumo = new Array<ElementoSalida>();
    this.ElementosConsumoSinAsignar = new Array<ElementoSalida>();
    this.ElementosConsumoControladoSinAsignar = new Array<ElementoSalida>();
    this.DatosElementos = new Array();
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
        elemento.Placa = datos[index].Placa;
        elemento.TipoBienId = datos[index].TipoBienId;
        elemento.Funcionario = null;
        elemento.Sede = null;
        elemento.Asignado = false;
        elemento.Dependencia = null;
        elemento.Ubicacion = null;
        // console.log({Consumo:this.Consumo, ConsumoCon:this.ConsumoControlado});
        if (datos[index].TipoBienId.Id === 1 && Object.keys(this.Consumo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId).SubgrupoId;
        }
        if (datos[index].TipoBienId.Id === 2 && Object.keys(this.ConsumoControlado[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId).SubgrupoId;
        }
        if (datos[index].TipoBienId.Id === 3 && Object.keys(this.Devolutivo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.Id === datos[index].SubgrupoCatalogoId);
        }
        if (datos[index].TipoBienId.Id === 1) {
          this.ElementosConsumoSinAsignar.push(elemento);
          this.DatosConsumo.push(elemento);
        } else {
          this.ElementosConsumoControladoSinAsignar.push(elemento);
          this.DatosElementos.push(datos[index]);
          this.Datos.push(elemento);
        }
      }
    }

    if (this.DatosConsumo.length > 0) {
      this.source2.load(this.DatosConsumo);
    }
    if (this.Datos.length > 0) {
      this.source.load(this.Datos);
    }

    this.showControlado = true;
    this.showConsumo = true;
  }

  AjustarDatos2(datos: any[]) {
    this.Datos2 = new Array<ElementoSalida>();
    this.ElementosConsumoControladoSinAsignar = new Array<ElementoSalida>();
    const elementosConsumoControladoSinAsignar = new Array<any>();
    const datos2 = new Array<any>();
    for (const index in datos) {
      if (true) {





        // console.log(datos[index])
        const elemento = new ElementoSalida();

        if (datos[index].Asignado === true) {
          const filtrado = this.DatosElementos.filter((row) => row.Id === datos[index].Id);
          this.asignarPlacas(filtrado[0], index);
       }



        elemento.ValorUnitario = datos[index].ValorUnitario;
        elemento.ValorTotal = datos[index].ValorTotal;
        elemento.Id = datos[index].Id;
        elemento.Nombre = datos[index].Nombre;
        elemento.Cantidad = datos[index].Cantidad;
        elemento.Marca = datos[index].Marca;
        elemento.Serie = datos[index].Serie;
        elemento.Placa = datos[index].Placa;
        elemento.Asignado = datos[index].Asignado;
        elemento.TipoBienId = datos[index].TipoBienId;
        elemento.Placa = datos[index].Placa;
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
          elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId.Id).SubgrupoId;
        }
        if (datos[index].TipoBienId.Id === 2 && Object.keys(this.ConsumoControlado[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId.Id).SubgrupoId;
        }
        if (datos[index].TipoBienId.Id === 3 && Object.keys(this.Devolutivo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.Id === datos[index].SubgrupoCatalogoId.Id).SubgrupoId;
        }
        // elemento.SubgrupoCatalogoId = datos[index].SubgrupoCatalogoId;
        datos2.push(elemento);

        if (!elemento.Funcionario || !elemento.Ubicacion) {
          elementosConsumoControladoSinAsignar.push(elemento);
        }
      }
    }

    if (datos2 !== undefined) {
      this.ElementosConsumoControladoSinAsignar = elementosConsumoControladoSinAsignar;
      this.source.load(datos2);
      this.formulario = false;
      // console.log(this.source);
    }
  }


  asignarPlacas(datos: any, elemento: any) {
    this.salidasHelper.getElemento(datos).subscribe((res: any) => {
        if (res.Placa === '') {
           this.salidasHelper.putElemento(res).subscribe((res1: any) => {
              return res1.placa; 
           });
        }
    });
    return '';
 }




  AjustarDatosConsumo(datos: any[]) {
    this.Datos2 = new Array<ElementoSalida>();
    const datos2 = new Array<any>();
    const elementosConsumoAsignados = new Array<any>();
    const elementosConsumoNoAsignados = new Array<any>();
    const elementosConsumoSinAsignar = new Array<any>();
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
          elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId.Id).SubgrupoId;
        }
        if (datos[index].TipoBienId.Id === 2 && Object.keys(this.ConsumoControlado[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId.Id).SubgrupoId;
        }
        if (datos[index].TipoBienId.Id === 3 && Object.keys(this.Devolutivo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.Id === datos[index].SubgrupoCatalogoId.Id).SubgrupoId;
        }
        datos2.push(elemento);
        if (elemento.Funcionario && elemento.Funcionario.Id === this.JefeOficinaId && elemento.Ubicacion && elemento.Ubicacion.Id === 3) {
          elementosConsumoNoAsignados.push(elemento);
        } else if ((elemento.Funcionario && elemento.Ubicacion) && (elemento.Funcionario.Id === this.JefeOficinaId || elemento.Ubicacion.Id === 3)) {
          elementosConsumoAsignados.push(elemento);
        } else {
          elementosConsumoSinAsignar.push(elemento);
        }
      }
    }

    if (datos2 !== undefined) {
      this.ElementosConsumoNoAsignados = elementosConsumoNoAsignados;
      this.ElementosConsumoAsignados = elementosConsumoAsignados;
      this.ElementosConsumoSinAsignar = elementosConsumoSinAsignar;
      this.source2.load(datos2);
      this.AsignarDeConsumo = false;
      this.Salida_Consumo();
    }
  }

  checkElementosAsignados() {

    const alertControlado = (this.Datos && this.Datos.length) &&
      (this.ElementosConsumoControladoSinAsignar && this.ElementosConsumoControladoSinAsignar.length) ? true : false;

    const alertConsumo = (this.DatosConsumo && this.DatosConsumo.length) &&
      (this.ElementosConsumoSinAsignar && this.ElementosConsumoSinAsignar.length) ? true : false;

    const alert = alertControlado && alertConsumo ? 'GLOBAL.entradas.alerta_ambos' :
      alertConsumo ? 'GLOBAL.entradas.alerta_consumo' : alertControlado ? 'GLOBAL.entradas.alerta_controlado' : null;

    alert ? (Swal as any).fire({
      title: this.translate.instant('GLOBAL.entradas.alerta_descargue'),
      text: this.translate.instant(alert),
      type: 'warning',
    }) : this.onSubmit();

  }

  Traer_Relacion_Ubicaciones() {

  }
  Salida_Consumo() {

    if (this.ElementosConsumoNoAsignados && Object.keys(this.ElementosConsumoNoAsignados).length !== 0) {
      const sede = 'FICC';
      const dependencia = 'ALMACEN GENERAL E INVENTARIOS';

      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.CodigoAbreviacion === sede);
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      this.actaRecibidoHelper.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
        const detalle = {
          ubicacion: res[0].Relaciones[0].Id,
          funcionario: this.JefeOficinaId,
        };
        const Salida = {
          Salida: {
            Observacion: 'Salida Automatica para Bodega de Consumo',
            Detalle: JSON.stringify(detalle),
            Activo: true,
            MovimientoPadreId: {
              Id: parseFloat(this.entradaId),
            },
            FormatoTipoMovimientoId: {
              Id: 9,
            },
            EstadoMovimientoId: {
              Id: 3,
            },
          },
          Elementos: [],
        };
        for (const currentValue of this.ElementosConsumoNoAsignados) {
          const elemento = {};
          elemento['Activo'] = true;
          elemento['ElementoActaId'] = currentValue.Id;
          elemento['SaldoCantidad'] = currentValue.Cantidad;
          elemento['SaldoValor'] = currentValue.ValorTotal;
          elemento['Unidad'] = currentValue.Cantidad;
          elemento['ValorUnitario'] = currentValue.ValorUnitario;
          elemento['ValorTotal'] = currentValue.ValorTotal;

          Salida.Elementos.push(elemento);
        }
        this.Datos_Salida_Consumo = Salida;
        return Salida;
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
        const obs = 'Salida con elementos de consumo controlado asignados a funcionario.';
        accumulator[val] = accumulator[val] || {
          Salida: {
            Observacion: this.Observaciones ? obs + ' // ' + this.Observaciones : obs,
            Detalle: JSON.stringify(detalle),
            Activo: true,
            MovimientoPadreId: {
              Id: parseFloat(this.entradaId),
            },
            FormatoTipoMovimientoId: {
              Id: 7,
            },
            EstadoMovimientoId: {
              Id: 3,
            },
          },
          Elementos: [],
        };
        const elemento = {};
        elemento['Activo'] = true;
        elemento['ElementoActaId'] = currentValue.Id;
        elemento['SaldoCantidad'] = currentValue.Cantidad;
        elemento['SaldoValor'] = currentValue.ValorTotal;
        elemento['Unidad'] = currentValue.Cantidad;
        elemento['ValorUnitario'] = currentValue.ValorUnitario;
        elemento['ValorTotal'] = currentValue.ValorTotal;

        accumulator[val].Elementos.push(elemento);
        return accumulator;

      }, {});

      return datos_agrupados2;
    } else {
      return this.Datos;
    }
  }

  Salida_General_Consumo() {
    if (this.ElementosConsumoAsignados && Object.keys(this.ElementosConsumoAsignados).length !== 0) {
      const datos_agrupados2 = this.ElementosConsumoAsignados.reduce((accumulator, currentValue) => {
        if (currentValue.Funcionario.Id) {
          const detalle = {
            funcionario: currentValue.Funcionario.Id,
            ubicacion: currentValue.Ubicacion.Id,
          };
          const val = currentValue.Funcionario.Id + '-' + currentValue.Ubicacion.Id;
          const obs = 'Salida con elementos de consumo asignados a funcionario.';
          accumulator[val] = accumulator[val] || {
            Salida: {
              Observacion: this.ObservacionesConsumo ? obs + ' // ' + this.ObservacionesConsumo : obs,
              Detalle: JSON.stringify(detalle),
              Activo: true,
              MovimientoPadreId: {
                Id: parseFloat(this.entradaId),
              },
              FormatoTipoMovimientoId: {
                Id: 7,
              },
              EstadoMovimientoId: {
                Id: 3,
              },
            },
            Elementos: [],
          };
          const elemento = {};
          elemento['Activo'] = true;
          elemento['ElementoActaId'] = currentValue.Id;
          elemento['SaldoCantidad'] = currentValue.Cantidad;
          elemento['SaldoValor'] = currentValue.ValorTotal;
          elemento['Unidad'] = currentValue.Cantidad;
          elemento['ValorUnitario'] = currentValue.ValorUnitario;
          elemento['ValorTotal'] = currentValue.ValorTotal;

          accumulator[val].Elementos.push(elemento);
          return accumulator;
        }
      }, {});

      return datos_agrupados2;
    } else {
      return this.ElementosConsumoAsignados;
    }
  }

  onSubmit() {

    const datos_agrupados = this.Salida_General(); // elementos de consumo controlado, diferencia por proveedores, ubicaciones...
    const datos_agrupados2 = this.Salida_General_Consumo(); // elementos de consumo asignados
    this.Salida_Consumo(); // elementos de consumo, diferencia por proveedores, ubicaciones...
    const Salidas = {
      Salidas: [],
    };
    if (datos_agrupados2 && Object.keys(datos_agrupados2).length !== 0) {
      for (const salida of Object.keys(datos_agrupados2)) {
        Salidas.Salidas.push(datos_agrupados2[salida]);
      }

    }

    if (this.ElementosConsumoNoAsignados && Object.keys(this.ElementosConsumoNoAsignados).length !== 0) {
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
      text: 'Está seguro de registrar los datos suministrados',
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
            type: 'success',
            title: 'Salida Registrada',
            text: 'La Salida ha sido Registrada exitosamente',
          });
        });
        this.router.navigate(['/pages/salidas/consulta_salidas']);
      }
    });
  }

  onBack() {
  }

  keyDownTablaShift(evento: KeyboardEvent) {
    this.estadoShift = true;
  }

  keyUpTabla(evento: KeyboardEvent) {
    this.estadoShift = evento.shiftKey;
  }



}
