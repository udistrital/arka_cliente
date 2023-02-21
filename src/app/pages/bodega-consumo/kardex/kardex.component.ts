import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { formatCurrency } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Kardex } from '../../../@core/data/models/bodega-consumo.ts/kardex';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.scss'],
})
export class KardexComponent implements OnInit {

  prev = false;
  next = true;
  SizePage: string;

  kardex: Kardex[];
  cargando: boolean;

  @Input('Kardex') _Kardex: number;
  _limit: number;
  _offset: number;
  name(elemento: number, limit: number, offset: number) {
    this.cargando = true;
    if (elemento) {
      this.bodegaConsumoService.getElementosKardex(elemento, limit, offset, 'desc').subscribe((res: any) => {
        if (res.length < this._limit) {
          this.next = false;
        }
        if (res.length === 0) {
          this.next = false;
          this._offset -= limit;
        }
        if (res.length) {
          this.ArmarHojaKardex(res);
        }
        this.cargando = false;
      });
    }
  }

  @Input('Apertura')
  set name2(elemento: any[]) {
    this.cargando = true;
    // console.log('ok');
    if (Object.keys(elemento).length !== 0) {
      this.ArmarMovimientoPrevio(elemento);
    }
    this.cargando = false;
  }

  @Input('Entrada') _Entrada: number;
  name3(elemento: any, limit: number, offset: number) {
    this.cargando = true;

    if (elemento && elemento.ElementoCatalogoId) {
      this.bodegaConsumoService.getElementosKardex(elemento.ElementoCatalogoId, limit, offset, 'desc').subscribe((res: any) => {
        this.ArmarHojaKardex(res);
        this.ArmarMovimientoPrevio(elemento);
        this.cargando = false;
      });
    }
  }

  @Output() DatosEnviados = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private bodegaConsumoService: BodegaConsumoHelper,
  ) {
    this._limit = 10;
    this._offset = 0;
    this.SizePage = '10';
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.kardex = new Array<Kardex>();
  }

  changeItemsPerPage() {
    this._limit = Number(this.SizePage);
    this._offset = 0;
    if (this._Kardex) {
      this.name(this._Kardex, this._limit, this._offset);
    } else if (this._Entrada) {
      this.name3(this._Entrada, this._limit, this._offset);
    }
  }

  previousPage() {
    if (this.prev) {
      this._offset = this._offset - Number(this.SizePage);
    }

    if (this._offset === 0) {
      this.prev = false;
    }
    if (this._Kardex) {
      this.name(this._Kardex, this._limit, this._offset);
    }
    this.next = true;
  }

  nextPage() {
    this._offset = this._offset + Number(this.SizePage);
    this.prev = true;
    if (this._Kardex) {
      this.name(this._Kardex, this._limit, this._offset);
    }
  }

  ngOnInit() {
    if (this._Kardex) {
      this.name(this._Kardex, this._limit, this._offset);
    } else if (this._Entrada) {
      this.name3(this._Entrada, this._limit, this._offset);
    }
  }

  ArmarHojaKardex(elementos: any[]) {

    const Kardexx = new Array<Kardex>();

    for (const elemento_ of elementos) {
      switch (elemento_.MovimientoId.FormatoTipoMovimientoId.CodigoAbreviacion) {
        case 'AP_KDX':
          const kardex_ = elemento_;
          kardex_.Unidad_E = elemento_.Unidad;
          kardex_.ValorUnitario_E = elemento_.ValorUnitario;
          kardex_.ValorTotal_E = elemento_.ValorTotal;
          kardex_.SaldoValorUnitario = elemento_.SaldoCantidad ? elemento_.SaldoValor / elemento_.SaldoCantidad : 0;
          Kardexx.push(kardex_);

          break;
        case 'ENT_KDX':
          const kardex_2 = elemento_;
          kardex_2.Unidad_E = elemento_.Unidad;
          kardex_2.ValorUnitario_E = elemento_.ValorUnitario;
          kardex_2.ValorTotal_E = elemento_.ValorTotal;
          kardex_2.SaldoValorUnitario = elemento_.SaldoCantidad ? elemento_.SaldoValor / elemento_.SaldoCantidad : 0;
          Kardexx.push(kardex_2);
          break;
        case 'SAL_KDX':
          const kardex_3 = elemento_;
          kardex_3.Unidad_S = elemento_.Unidad;
          kardex_3.ValorUnitario_S = elemento_.ValorUnitario;
          kardex_3.ValorTotal_S = elemento_.ValorTotal;
          kardex_3.SaldoValorUnitario = elemento_.SaldoCantidad ? elemento_.SaldoValor / elemento_.SaldoCantidad : 0;
          Kardexx.push(kardex_3);
          break;
        default:
          break;
      }
    }
    this.kardex = Kardexx;
  }

  ArmarMovimientoPrevio(elemento_: any) {

    const kardex_: Kardex = elemento_;
    kardex_.Unidad_E = elemento_.Unidad;
    kardex_.ValorUnitario_E = elemento_.ValorUnitario;
    kardex_.ValorTotal_E = elemento_.ValorTotal;
    kardex_.SaldoValorUnitario = elemento_.SaldoValor / elemento_.SaldoCantidad;
    kardex_.FechaCreacion = new Date().toISOString();
    this.kardex.unshift(kardex_);

  }

}

@Pipe({ name: 'currencycustom' })

export class CurrencyCustomPipe implements PipeTransform {
  transform(value: any): string {
    if (isNaN(value)) {
      return value;
    } else {
      // console.log(formatCurrency(value, 'en-US', '$', '', '2.2-2'));
      return formatCurrency(value, 'en-US', '$', '', '2.2-2');
    }
  }
}
