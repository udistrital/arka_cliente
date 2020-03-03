import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
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
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { BajasHelper } from '../../../helpers/bajas/bajasHelper';

@Component({
  selector: 'ngx-tabla-elementos-agregados',
  templateUrl: './tabla-elementos-agregados.component.html',
  styleUrls: ['./tabla-elementos-agregados.component.scss']
})
export class TablaElementosAgregadosComponent implements OnInit {

  source: LocalDataSource;
  settings: any;
  navigationSubscription;
  bandera: boolean;
  bandera2: boolean;

  @Output() DatosEnviados = new EventEmitter();

  @Input('Elemento')
  set name(Elemento: any) {
    console.log(Elemento)
    if (Elemento !== false) {
    this.Agregar_Elemento(Elemento);
    }
  }
  constructor(
    private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private sanitization: DomSanitizer,
    private pUpManager: PopUpManager,
    private bajasHelper: BajasHelper
  ) {
    this.source = new LocalDataSource();
    this.cargarCampos();
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initialiseInvites();
      }
    });
  }

  ngOnInit() {
  }

  initialiseInvites() {
    // Set default values and re-fetch any data you need.
    // this.ngOnInit();
    // console.log('1')
  }

  Agregar_Elemento(elemento: any) {
    this.source.getElements().then((elements: any) => {
      this.bandera = false;
      elements.forEach(element => {
        if (element.Id === elemento.Placa.Id) {
          this.bandera = true;
        }
      });
      if (this.bandera === false) {
        this.bajasHelper.GetElemento(elemento.Placa.Id).subscribe((res: any) => {
          console.log(res)
          res.Soporte = elemento.Soporte;
          res.TipoBaja = elemento.TipoBaja;
          res.Observaciones = elemento.Observaciones;
          this.source.prepend(res).then(() => {
            this.source.refresh();
            this.source.getElements().then((elements) => {
              this.DatosEnviados.emit(elements);
            })
          });
        });
      } else {
        this.bandera = false;
      }
    })
    
    
  }

  cargarCampos() {

    this.settings = {
      hideSubHeader: false,
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        delete: true,
        edit: true,
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="fas fa-file-pdf"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-times"></i>',
      },
      mode: 'external',
      columns: {
        Placa: {
          title: 'Placa',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        TipoBaja: {
          title: 'Tipo de Baja',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Observaciones: {
          title: 'Observaciones',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Nombre: {
          title: 'Elemento',
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
        Entrada: {
          title: 'Entrada',
          valuePrepareFunction: (value: any) => {
            return value.Id;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Id.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Salida: {
          title: 'Salida',
          valuePrepareFunction: (value: any) => {
            return value.Id;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Id.indexOf(search) > -1) {
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
  }
  onEdit(event: any) {
    if (event.data.Soporte !== undefined) {
      this.download(event.data.Soporte);
    }
  }
  onDelete(event: any) {
    this.source.remove(event.data).then(() => {
      this.source.refresh();
    })
  }

  download(file) {

    const new_tab = window.open(file.urlTemp, file.urlTemp, '_blank');
    new_tab.onload = () => {
      new_tab.location = file.urlTemp;
    };
    new_tab.focus();
  }
}
