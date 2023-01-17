import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-agregar-elementos',
  templateUrl: './agregar-elementos.component.html',
  styleUrls: ['./agregar-elementos.component.scss'],
})

export class AgregarElementosComponent implements OnInit {

  source: LocalDataSource;
  entradas: Array<Entrada>;
  consecutivoEntrada: string;
  settings: any;
  DatosEnviados: any;
  mostrar: boolean;

  constructor(
    private translate: TranslateService,
    private bodegaConsumo: BodegaConsumoHelper,
  ) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
  }

  ngOnInit() {
    this.loadTablaSettings();
    this.loadEntradas();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Solicitudes.Accion'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.Solicitudes.Accion'),
            title: '<span class="fas fa-plus" title="' + this.translate.instant('GLOBAL.Solicitudes.Accion') + '"></span>',
          },
        ],
      },
      columns: {
        ElementoCatalogoId: {
          title: this.translate.instant('GLOBAL.Elemento.Relacionado'),
          valuePrepareFunction: (value: any) => {
            return !value ? '' : value.Codigo ? value.Codigo + ' - ' + value.Nombre : value.Nombre;
          },
          filterFunction: this.filterFunction,
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.Descripcion'),
        },
        SaldoCantidad: {
          title: this.translate.instant('GLOBAL.Existencias'),
        },
      },
    };
  }

  loadEntradas(): void {
    this.bodegaConsumo.getExistenciasKardex().subscribe((res: any) => {
      if (res.length) {
        res.forEach(el => {
          el.Descripcion = el.ElementoCatalogoId.Descripcion;
        });
      }
      this.source.load(res);
      this.mostrar = true;
    });
  }

  onCustom(event) {
    this.DatosEnviados = event.data;
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
