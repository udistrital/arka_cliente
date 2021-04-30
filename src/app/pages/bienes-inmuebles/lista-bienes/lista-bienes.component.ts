import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { ActaRecibido, ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Tercero } from '../../../@core/data/models/terceros';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';

@Component({
  selector: 'ngx-lista-bienes',
  templateUrl: './lista-bienes.component.html',
  styleUrls: ['./lista-bienes.component.scss'],
})
export class ListaBienesComponent implements OnInit {

  mostrar: boolean = false;

  // Datos Tabla
  source: LocalDataSource;
  tiposDeEntradas: string[];
  // Bienes
  bienSeleccionado: string;
  settings: any;
  opcionEntrada: string;
  data: any;


  @Input() EntradaEdit: any;

  private terceros: Partial<Tercero>[];
  private actas: any[];

  constructor(
    private pUpManager: PopUpManager,
    private translate: TranslateService,

  ) {
    this.source = new LocalDataSource();
    this.bienSeleccionado = '';
  }

  ngOnInit() {
    this.loadData();
    this.loadTablaSettings();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.mostrarData();
    this.bienSeleccionado = this.EntradaEdit ? this.EntradaEdit.ActaRecibidoId : '';
  }
  loadData() {
    const Prueba = [
      {Id: 0, FechaRegistro: '2021/01/02', BienInmueble: 'Edificio Sabio Caldas'},
      {Id: 1, FechaRegistro: '2021/01/02', BienInmueble: 'Edificio Arturo Suarez copete'},
      {Id: 2, FechaRegistro: '2021/01/02', BienInmueble: 'Edificio Macarena A'},
      {Id: 3, FechaRegistro: '2021/01/02', BienInmueble: 'Edificio Macarena B'},
    ];
    this.data = Prueba;
    // console.log({Prueba: this.data});

  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_actas_entrada'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'detalle',
            title: '<i class="fas fa-door-open" title="Seleccionar"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        FechaRegistro: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        BienInmueble: {
          title: this.translate.instant('GLOBAL.revisor'),
        },
        /*
        EstadoActaId: {
          title: this.translate.instant('GLOBAL.estado'),
          valuePrepareFunction: (value: any) => {
            return value.CodigoAbreviacion.toUpperCase();
          },
        },
        // */
        // Observaciones: {
        //   title: this.translate.instant('GLOBAL.observaciones'),
        //   valuePrepareFunction: (value: any) => {
        //     return value.toUpperCase();
        //   },
        // },
      },
    };
  }
  private mostrarData(): void {
    if (!this.mostrar) {
      this.source.load(this.data);
      this.mostrar = true;
      // console.log({Data: this.source});
    }
  }

  onCustom(event) {
    // console.log(event.data.Id);
    this.bienSeleccionado = event.data.Id;
  }

}
