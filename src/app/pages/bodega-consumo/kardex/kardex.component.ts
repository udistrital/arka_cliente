import { Component, OnInit, LOCALE_ID, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Validators, FormBuilder, FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import { getCurrencySymbol, formatCurrency } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Kardex } from '../../../@core/data/models/bodega-consumo.ts/kardex';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.scss'],
})
export class KardexComponent implements OnInit {

  encargado: string;
  elementos: any[];
  sales: any[];
  kardex: Kardex[];
  cargando: boolean;

  @Input('Kardex')
  set name(elemento: number) {
    this.cargando = true;

    if (elemento !== undefined) {
      this.bodegaConsumoService.getElementosKardex(elemento).subscribe((res: any) => {
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

  @Input('Entrada')
  set name3(elemento: any) {
    this.cargando = true;

    if (Object.keys(elemento).length !== 0) {
      this.bodegaConsumoService.getElementosKardex(elemento.ElementoCatalogoId).subscribe((res: any) => {
        if (res.length) {
          this.ArmarHojaKardex(res);
          this.ArmarMovimientoPrevio(elemento);
        }
        this.cargando = false;
      });
    }
  }

  @Output() DatosEnviados = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private bodegaConsumoService: BodegaConsumoHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.kardex = new Array<Kardex>();
  }

  ngOnInit() {
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
          kardex_.SaldoValorUnitario = elemento_.SaldoValor / elemento_.SaldoCantidad;
          Kardexx.push(kardex_);

          break;
        case 'ENT_KDX':
          const kardex_2 = elemento_;
          kardex_2.Unidad_E = elemento_.Unidad;
          kardex_2.ValorUnitario_E = elemento_.ValorUnitario;
          kardex_2.ValorTotal_E = elemento_.ValorTotal;
          kardex_2.SaldoValorUnitario = elemento_.SaldoValor / elemento_.SaldoCantidad;
          Kardexx.push(kardex_2);
          break;
        case 'SAL_KDX':
          const kardex_3 = elemento_;
          kardex_3.Unidad_S = elemento_.Unidad;
          kardex_3.ValorUnitario_S = elemento_.ValorUnitario;
          kardex_3.ValorTotal_S = elemento_.ValorTotal;
          kardex_3.SaldoValorUnitario = elemento_.SaldoValor / elemento_.SaldoCantidad;
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
    this.kardex.push(kardex_);

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
