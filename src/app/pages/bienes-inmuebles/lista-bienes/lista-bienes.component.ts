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
  // Acta de recibido
  actaSeleccionada: string;
  settings: any;
  opcionEntrada: string;
  movimientoId: number;
  data:any;


  @Input() EntradaEdit: any;

  private terceros: Partial<Tercero>[];
  private actas: any[];

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
    private listService: ListService,
    private store: Store<IAppState>,
    private tercerosHelper: TercerosHelper,

  ) {
    this.source = new LocalDataSource();
    this.actaSeleccionada = '';
  }

  ngOnInit() {
    this.loadData();
    this.loadTablaSettings();
    this.loadActas();
    this.listService.findClases();
    this.listService.findImpuestoIVA();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.loadTerceros();
    this.actaSeleccionada = this.EntradaEdit ? this.EntradaEdit.ActaRecibidoId : '';
    this.movimientoId = this.EntradaEdit ? this.EntradaEdit.Id : '';
  }
  loadData()
  { 
    let Prueba = [
      {Id:0,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Sabio Caldas"},
      {Id:1,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Arturo Suarez copete"},
      {Id:2,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Macarena A"},
      {Id:3,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Macarena B"}
    ]
    this.data= Prueba;
    // this.data[0]={Id:0,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Sabio Caldas"}
    // this.data[1]={Id:1,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Arturo Suarez copete"}
    // this.data[2]={Id:2,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Macarena A"}
    // this.data[3]={Id:3,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Macarena B"}
    console.log({Prueba:this.data})
    
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
        FechaCreacion: {
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

  loadActas(): void {
    this.actaRecibidoHelper.getActasRecibido().subscribe(res => {
      if (Array.isArray(res) && res.length !== 0) {
        const data = <Array<ActaRecibidoUbicacion>>res;
        this.actas = data;
        this.mostrarData();
      }
    });
  }

  private loadTerceros(): void {
    this.tercerosHelper.getTerceros().subscribe(terceros => {
      this.terceros = terceros;
      this.mostrarData();
      // console.log({terceros: this.terceros});
    });
  }

  private mostrarData(): void {
    if (!this.mostrar) {
      this.source.load(this.data);
      this.mostrar = true;
      console.log({Data:this.source})
    }
  }

  onCustom(event) {
  }

}