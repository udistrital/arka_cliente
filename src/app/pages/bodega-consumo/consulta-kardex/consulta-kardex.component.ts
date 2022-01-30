import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { parse } from 'path';
import { combineLatest } from 'rxjs';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-consulta-kardex',
  templateUrl: './consulta-kardex.component.html',
  styleUrls: ['./consulta-kardex.component.scss'],
})
export class ConsultaKardexComponent implements OnInit {

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  salidaId: string;
  Proveedores: any;
  Dependencias: any;
  Sedes: any;
  cargandoListaKardex: boolean;

  Metodos: any[] = [
    {
      Id: 1,
      Nombre: 'PP',
      // Estaba con los global pero la descripción es muy larga para el tamaño de la tabla.
      // Nombre: this.translate.instant('GLOBAL.BodegaConsumo.MetodoInventario.PP'),
    },
    {
      Id: 2,
      Nombre: 'PEPS',
    },
    {
      Id: 3,
      Nombre: 'UEPS',
    },
  ];
  kardex: any;
  elemento: any;
  constructor(
    private router: Router,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private Actas_Recibido: ActaRecibidoHelper,
    private BodegaConsumoService: BodegaConsumoHelper,
    private listService: ListService,
    private terceros: TercerosHelper,
  ) {
    this.source = new LocalDataSource();
    this.detalle = false;
  }



  ngOnInit() {
    this.loadTablaSettings();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.loadSalidas();
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.detalle'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.seleccionar'),
            title: '<i class="fas fa-eye"></i>',
          },
        ],
      },
      columns: {
        ElementoCatalogoId: {
          title: this.translate.instant('GLOBAL.Elemento.Uno'),
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              let elem = value.Codigo ? value.Codigo + ' - ' : '';
              elem += value.Nombre ? value.Nombre : '';
              return elem;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Descripcion.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Observaciones: {
          title: this.translate.instant('GLOBAL.observaciones'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '70px',
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
        /* // Esta columna no tiene sentido, una ficha se puede llenar de varias salidas
        MovimientoPadreId: {
          title: 'Salida Asociada',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Id;
            } else {
              return '';
            }
          },
        },
        // */
        MetodoValoracion: {
          title: this.translate.instant('GLOBAL.BodegaConsumo.MetodoInventario.Nombre'),
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
        CantidadMinima: {
          title: this.translate.instant('GLOBAL.Solicitudes.CantMin'),
        },
        CantidadMaxima: {
          title: this.translate.instant('GLOBAL.Solicitudes.CantMax'),
        },
      },
    };
  }
  loadSalidas(): void {
    this.cargandoListaKardex = true;

    this.BodegaConsumoService.getAperturasKardex().subscribe(res1 => {
      if (Object.keys(res1[0]).length !== 0) {
        res1.forEach(element => {
          const met = this.Metodos.find(x => x.Id === element.MetodoValoracion);
          element.MetodoValoracion = met;
        });
        // console.log(res1);
        this.source.load(res1);
      }
      this.cargandoListaKardex = false;
    });
  }
  onCustom(event) {
    // this.BodegaConsumoService.getMovimientosKardex(event.data.ElementoCatalogoId.Id).subscribe((res: any) => {
    //   this.kardex = res;
    //   console.log(res);
    // });
    this.elemento = event.data;
    this.kardex = event.data.ElementoCatalogoId.Id;
  }
  onVolver() {
    // this.source.empty().then(() => {
    this.kardex = undefined;
    //   if (this.Dependencias !== undefined && this.Sedes !== undefined && this.Proveedores !== undefined) {
    //    // console.log('ok');
    //     this.loadSalidas();
    //  }
    // });
  }
}
