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
import { ElementoSalida } from '../../../@core/data/models/salidas/salida_elementos'

@Component({
  selector: 'ngx-tabla-elementos-asignados',
  templateUrl: './tabla-elementos-asignados.component.html',
  styleUrls: ['./tabla-elementos-asignados.component.scss'],
})
export class TablaElementosAsignadosComponent implements OnInit {

  settings: any;
  navigationSubscription;
  actaRecibidoId: number;
  respuesta: any;
  Datos: ElementoSalida[];
  Consumo: any;
  ConsumoControlado: any;
  Devolutivo: any;

  @Input()


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
        console.log(this.actaRecibidoId);
        console.log(this.Consumo);
        console.log(this.Devolutivo);
        console.log(this.ConsumoControlado);
        if (this.actaRecibidoId !== undefined && this.Consumo !== undefined &&
          this.ConsumoControlado !== undefined && this.Devolutivo !== undefined &&
          this.respuesta === undefined) {
          this.actaRecibidoHelper.getElementosActa(this.actaRecibidoId).subscribe((res: any) => {
            console.log(res)
            this.respuesta = res;
            this.AjustarDatos(res);
          });
        }
      },
    );

  }
  cargarCampos() {

    this.settings = {
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
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
            return value;
          },
        },
        SubgrupoCatalogoId: {
          title: 'Subgrupo',
          valuePrepareFunction: (value: any) => {
            return value;
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
            return value;
          },
        },
        Sede: {
          title: 'Sede',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Dependencia: {
          title: 'Dependencia',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Ubicacion: {
          title: 'Ubicacion',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
      },
    };
  }

  AjustarDatos(datos: any[]) {
    console.log(datos);
    this.Datos = new Array<ElementoSalida>()
    for (const index in datos) {
      console.log(datos[index])
      const elemento = new ElementoSalida()
      elemento.Id = datos[index].Id;
      elemento.Nombre = datos[index].Nombre;
      elemento.Cantidad = datos[index].Cantidad;
      elemento.Marca = datos[index].Marca;
      elemento.Serie = datos[index].Serie;
      elemento.TipoBienId = datos[index].TipoBienId.Nombre;
      elemento.Funcionario = null;
      elemento.Sede = null;
      elemento.Dependencia = null;
      elemento.Ubicacion = null;
      if (datos[index].TipoBienId.Id == 1 && Object.keys(this.Consumo[0]).length !== 0) {
        elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.Id === datos[index].SubgrupoCatalogoId).Nombre;
      } 
      if (datos[index].TipoBienId.Id == 2 && Object.keys(this.ConsumoControlado[0]).length !== 0) {
        elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.Id === datos[index].SubgrupoCatalogoId).Nombre;
      } 
      if (datos[index].TipoBienId.Id == 3 && Object.keys(this.Devolutivo[0]).length !== 0) {
        elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.Id === datos[index].SubgrupoCatalogoId).Nombre;
      } 
      console.log(elemento);
      this.Datos.push(elemento);
    }

    if (this.Datos !== undefined) {
      this.source.load(this.Datos);
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

  onBack() {

  }

}
