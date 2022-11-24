import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';

@Component({
  selector: 'ngx-bodega-sin-asignar',
  templateUrl: './bodega-sin-asignar.component.html',
  styleUrls: ['./bodega-sin-asignar.component.scss'],
})
export class BodegaSinAsignarComponent implements OnInit {

  source: LocalDataSource;
  source2: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  mostrar: boolean;
  documentoId: boolean;
  settings2: any;

  @Input() DatosRecibidos: any;
  @Output() DatosEnviados = new EventEmitter();
  @Output() DatosTotales = new EventEmitter();

  constructor(
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
  ) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.detalle = false;
  }

  ngOnInit() {
    this.loadTablaSettings();
    this.ElementosSinAsignar();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.seleccionar'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.seleccionar'),
            title: '<span class="fas fa-arrow-right" title="' + this.translate.instant('GLOBAL.seleccionar') + '"></span>',
          },
        ],
      },
      columns: {
        MovimientoId: {
          title: this.translate.instant('GLOBAL.Salida'),
          width: '20%',
          valuePrepareFunction: (value: any) => {
            return value && value.Detalle && JSON.parse(value.Detalle) ? JSON.parse(value.Detalle).consecutivo : '';
          },
        },
        SubgrupoCatalogoId: {
          title: this.translate.instant('GLOBAL.subgrupo.clase.nombre'),
          width: '20%',
          valuePrepareFunction: (value: any) => {
            return value.Codigo + ' - ' + value.Nombre;
          },
          filterFunction: this.filterFunction,
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.Descripcion'),
          width: '30%',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Marca: {
          title: this.translate.instant('GLOBAL.marca'),
          width: '20%',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        SaldoCantidad: {
          title: this.translate.instant('GLOBAL.Existencias'),
          width: '10%',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
      },
    };
  }

  ElementosSinAsignar(): void {
    this.salidasHelper.getElementos2().subscribe((res: any) => {
      this.mostrar = true;
      // console.log(res);
      this.source.load(res);
    });
  }

  onCustom(event) {
    this.DatosEnviados.emit(event.data);
    this.detalle = true;
  }

  onVolver() {
    this.detalle = !this.detalle;
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

}
