import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { Store } from '@ngrx/store';
import { ListService } from '../../../@core/store/services/list.service';
import { IAppState } from '../../../@core/store/app.state';
import { LocalDataSource } from 'ngx-smart-table';

@Component({
  selector: 'ngx-verificacion-elementos',
  templateUrl: './verificacion-elementos.component.html',
  styleUrls: ['./verificacion-elementos.component.scss'],
})
export class VerificacionElementosComponent implements OnInit {
  selectMode: string;
  selectedItems: any;

  @Input('DatosRecibidos')
  set name(data: any[]) {
    // console.log({data});
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Clases = list.listClases[0];
        if (this.Clases !== undefined) {
          this.AjustarDatos(data);
        }
      },
    );

  }

  @Input('mode')
  set name2(w: any) {
    // console.log(w);
    this.selectMode = w;
    this.cargarCampos();
  }
  @Output() DatosEnviados = new EventEmitter();

  source: LocalDataSource;
  elementos: Elemento[];
  Clases: any;
  settings: any;
  Datos: Elemento[];

  private clasesValidas: boolean = false;

  constructor(private translate: TranslateService,
    private store: Store<IAppState>,
    private listService: ListService) {
    this.listService.findClases();
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

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Clases = list.listClases[0];
      },
    );

  }
  onRowSelect(event) {
    const todosMarcados = event.source.data.length === event.selected.length;
    const alMenosUno = event.source.data.length > 0;

    const valido = todosMarcados && alMenosUno && this.clasesValidas;
    this.DatosEnviados.emit(valido);
  }
  cargarCampos() {
    this.settings = {
      hideSubHeader: true,
      selectMode: this.selectMode,
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        delete: false,
        edit: false,
      },
      mode: 'external',
      columns: {
        SubgrupoCatalogoId: {
          title: 'Clase',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
          },
        },
        TipoBienId: {
          title: 'Tipo de Bien',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Nombre: {
          title: 'Nombre',
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
        UnidadMedida: {
          title: 'Unidad de Medida',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        ValorUnitario: {
          title: 'Valor Unitario',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Subtotal: {
          title: 'Subtotal',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Descuento: {
          title: 'Descuento',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        PorcentajeIvaId: {
          title: 'IVA',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        ValorIva: {
          title: 'Valor IVA',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        ValorTotal: {
          title: 'Valor Total',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
      },
      pager: {
        display: false,
        perPage: 99999,
      },
    };
  }

  AjustarDatos(datos: any[]) {
    // console.log(datos);
    this.Datos = new Array<any>();
    for (const index in datos) {
      if (true) {
        // console.log(datos[index])
        const elemento: any = {};
        elemento.ValorUnitario = datos[index].ValorUnitario;
        elemento.ValorTotal = datos[index].ValorTotal;
        elemento.Id = datos[index].Id;
        elemento.Nombre = datos[index].Nombre;
        elemento.Cantidad = datos[index].Cantidad;
        elemento.Marca = datos[index].Marca;
        elemento.Serie = datos[index].Serie;
        elemento.TipoBienId = datos[index].TipoBienId;
        elemento.Subtotal = datos[index].Subtotal;
        elemento.Descuento = datos[index].Descuento;
        elemento.UnidadMedida = datos[index].UnidadMedida;
        elemento.ValorIva = datos[index].ValorIva;
        elemento.PorcentajeIvaId = datos[index].PorcentajeIvaId;
        // console.log(datos[index])

        if (datos[index].TipoBienId === 'Consumo' && Object.keys(this.Consumo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId).SubgrupoId;
        }
        if (datos[index].TipoBienId === 'Consumo Controlado' && Object.keys(this.ConsumoControlado[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId).SubgrupoId;
        }
        if (datos[index].TipoBienId === 'Devolutivo' && Object.keys(this.Devolutivo[0]).length !== 0) {
          elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.SubgrupoId.Id === datos[index].SubgrupoCatalogoId).SubgrupoId;
        }
        this.Datos.push(elemento);
      }
    }
    if (this.Datos !== undefined) {
      // console.log({'this.Datos': this.Datos});
      this.source.load(this.Datos);
      this.clasesValidas = this.Datos.every(elem => elem.hasOwnProperty('SubgrupoCatalogoId') && elem.SubgrupoCatalogoId.hasOwnProperty('Id'));
    }
  }

}
