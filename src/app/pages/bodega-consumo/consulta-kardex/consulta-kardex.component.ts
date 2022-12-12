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
          ...this.tabla.getSettingsDate(),
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
