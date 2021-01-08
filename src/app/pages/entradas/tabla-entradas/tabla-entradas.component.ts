import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { ElementoActa } from '../../../@core/data/models/acta_recibido/elemento';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-tabla-entradas',
  templateUrl: './tabla-entradas.component.html',
  styleUrls: ['./tabla-entradas.component.scss'],
})
export class TablaEntradasComponent implements OnInit {

  source: LocalDataSource;
  elementos: Array<ElementoActa>;
  settings: any;

  @Input() actaRecibidoId: string;

  constructor(private actaRecibidoHelper: ActaRecibidoHelper, private pUpManager: PopUpManager, private translate: TranslateService) {
    this.source = new LocalDataSource();
    this.elementos = new Array<ElementoActa>();
    this.loadTablaSettings();
  }

  loadElementos(): void {
    this.actaRecibidoHelper.getElementosActa(this.actaRecibidoId).subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos) && data[datos].Id !== undefined) {
            const elemento = new ElementoActa;
            const tipoBien = new TipoBien;
            const soporteActa = new SoporteActa;

            elemento.Nombre = data[datos].Nombre;
            elemento.Cantidad = data[datos].Cantidad;
            elemento.Marca = data[datos].Marca;
            elemento.Serie = data[datos].Serie;

            elemento.UnidadMedidaId = data[datos].UnidadMedida;

            elemento.ValorUnitario = data[datos].ValorUnitario;
            elemento.Subtotal = data[datos].Subtotal;
            elemento.Descuento = data[datos].Descuento;
            elemento.ValorTotal = data[datos].ValorTotal;

            elemento.PorcentajeIvaId = data[datos].PorcentajeIvaId;

            elemento.ValorIva = data[datos].ValorIva;
            elemento.ValorFinal = data[datos].ValorFinal;
            elemento.Descuento = data[datos].Descuento;
            elemento.Verificado = data[datos].Verificado;
            tipoBien.Id = data[datos].TipoBienId.Id;
            tipoBien.Nombre = data[datos].TipoBienId.Nombre;
            elemento.TipoBienId = tipoBien;
            soporteActa.Consecutivo = data[datos].SoporteActaId.Consecutivo;
            elemento.SoporteActaId = soporteActa;
            elemento.SubgrupoCatalogoId = data[datos].SubgrupoCatalogoId;

            this.elementos.push(elemento);
          }
        }
        this.source.load(this.elementos);
      }
    });
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: true,
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Seleccionar',
        position: 'right',
        add: false,
        edit: false,
        delete: false,
      },
      columns: {
        SoporteActaId: {
          title: this.translate.instant('GLOBAL.factura'),
          valuePrepareFunction: (value: any) => {
            return value.Consecutivo;
          },
        },
        TipoBienId: {
          title: this.translate.instant('GLOBAL.tipo_bien'),
          valuePrepareFunction: (value: any) => {
            return value.Nombre.toUpperCase( );
          },
        },
        SubgrupoCatalogoId: {
          // TODO: Actualizar dinamicamente este texto:
          title: this.translate.instant('GLOBAL.subgrupo.segmento.nombre'),
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.descripcion'),
          valuePrepareFunction: (value: any) => {
            return value.toUpperCase( );
          },
        },
        Cantidad: {
          title: this.translate.instant('GLOBAL.cantidad'),
        },
        Marca: {
          title: this.translate.instant('GLOBAL.marca'),
          valuePrepareFunction: (value: any) => {
            return value.toUpperCase( );
          },
        },
        Serie: {
          title: this.translate.instant('GLOBAL.serie'),
        },
        UnidadMedidaId: {
          title: this.translate.instant('GLOBAL.unidad_medida'),
          valuePrepareFunction: (value: any) => {
            return value.Unidad;
          },
        },
        ValorUnitario: {
          title: this.translate.instant('GLOBAL.valor_unitario'),
          valuePrepareFunction: (value: any) => {
            const formatter = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
            });
            return formatter.format(value);
          },
        },
        Subtotal: {
          title: this.translate.instant('GLOBAL.subtotal'),
          valuePrepareFunction: (value: any) => {
            const formatter = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
            });
            return formatter.format(value);
          },
        },
        Descuento: {
          title: this.translate.instant('GLOBAL.descuento'),
          valuePrepareFunction: (value: any) => {
            const formatter = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
            });
            return formatter.format(value);
          },
        },
        PorcentajeIvaId: {
          title: '%' + this.translate.instant('GLOBAL.iva'),
          valuePrepareFunction: (value: any) => {
            return value.Tarifa;
          },
        },
        ValorIva: {
          title: this.translate.instant('GLOBAL.valor_iva'),
          valuePrepareFunction: (value: any) => {
            const formatter = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
            });
            return formatter.format(value);
          },
        },
        ValorFinal: {
          title: this.translate.instant('GLOBAL.valor_total'),
          valuePrepareFunction: (value: any) => {
            const formatter = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
            });
            return formatter.format(value);
          },
        },
      },
    };
  }

  ngOnInit() {
    this.loadElementos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
  }

}
