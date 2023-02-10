import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { SmartTableService } from '../../../@core/data/SmartTableService';

@Component({
  selector: 'ngx-bodega-sin-asignar',
  templateUrl: './bodega-sin-asignar.component.html',
  styleUrls: ['./bodega-sin-asignar.component.scss'],
})
export class BodegaSinAsignarComponent implements OnInit {

  source: LocalDataSource;
  source2: LocalDataSource;
  detalle: boolean;
  settings: any;
  mostrar: boolean;
  settings2: any;

  @Input() DatosRecibidos: any;
  @Output() DatosEnviados = new EventEmitter();
  @Output() DatosTotales = new EventEmitter();

  constructor(
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private tabla: SmartTableService,
  ) {
    this.source = new LocalDataSource();
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
          ...this.tabla.getSettingsObject('Consecutivo'),
        },
        SubgrupoCatalogoId: {
          title: this.translate.instant('GLOBAL.subgrupo.clase.nombre'),
          width: '20%',
          ...this.tabla.getSettingsCodigoNombre(),
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.Descripcion'),
          width: '30%',
        },
        Marca: {
          title: this.translate.instant('GLOBAL.marca'),
          width: '20%',
        },
        SaldoCantidad: {
          title: this.translate.instant('GLOBAL.Existencias'),
          width: '10%',
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

}
