import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';
import { SmartTableService } from '../../../@core/data/SmartTableService';

@Component({
  selector: 'ngx-consulta-kardex',
  templateUrl: './consulta-kardex.component.html',
  styleUrls: ['./consulta-kardex.component.scss'],
})
export class ConsultaKardexComponent implements OnInit {

  source: LocalDataSource;
  detalle: boolean;
  settings: any;
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
    private translate: TranslateService,
    private BodegaConsumoService: BodegaConsumoHelper,
    private tabla: SmartTableService,
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
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            title: '<i class="fas fa-eye" title="' + this.translate.instant('GLOBAL.BodegaConsumo.Consulta.detalleKardex') + '"></i>',
          },
        ],
      },
      columns: {
        ElementoCatalogoId: {
          title: this.translate.instant('GLOBAL.Elemento.Uno'),
          valuePrepareFunction: (value: any) => {
            if (value) {
              let elem = value.Codigo ? value.Codigo + ' - ' : '';
              elem += value.Nombre ? value.Nombre : '';
              return elem;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            if (cell && search.length) {
              if ((cell.Codigo + ' - ' + cell.Nombre).indexOf(search) > -1) {
                return true;
              }
            }
            return false;
          },
        },
        Observaciones: {
          title: this.translate.instant('GLOBAL.observaciones'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        MetodoValoracion: {
          title: this.translate.instant('GLOBAL.BodegaConsumo.MetodoInventario.Nombre'),
          ...this.tabla.getSettingsObject('Nombre'),
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

    this.BodegaConsumoService.getAperturasKardex().subscribe(res => {
      if (res && res.length) {
        res.forEach(element => {
          const met = this.Metodos.find(x => x.Id === element.MetodoValoracion);
          element.MetodoValoracion = met;
        });
        this.source.load(res);
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
