import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ngx-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.scss'],
})
export class KardexComponent implements OnInit {

  constructor(private translate: TranslateService) { 
    
  }

  sales: any[];
  kardex: any[];

  ngOnInit() {
      this.sales = [
          { brand: 'Apple', lastYearSale: '51%', thisYearSale: '40%', lastYearProfit: '$54,406.00', thisYearProfit: '$43,342' },
          { brand: 'Samsung', lastYearSale: '83%', thisYearSale: '96%', lastYearProfit: '$423,132', thisYearProfit: '$312,122' },
          { brand: 'Microsoft', lastYearSale: '38%', thisYearSale: '5%', lastYearProfit: '$12,321', thisYearProfit: '$8,500' },
          { brand: 'Philips', lastYearSale: '49%', thisYearSale: '22%', lastYearProfit: '$745,232', thisYearProfit: '$650,323,' },
          { brand: 'Song', lastYearSale: '17%', thisYearSale: '79%', lastYearProfit: '$643,242', thisYearProfit: '500,332' },
          { brand: 'LG', lastYearSale: '52%', thisYearSale: ' 65%', lastYearProfit: '$421,132', thisYearProfit: '$150,005' },
          { brand: 'Sharp', lastYearSale: '82%', thisYearSale: '12%', lastYearProfit: '$131,211', thisYearProfit: '$100,214' },
          { brand: 'Panasonic', lastYearSale: '44%', thisYearSale: '45%', lastYearProfit: '$66,442', thisYearProfit: '$53,322' },
          { brand: 'HTC', lastYearSale: '90%', thisYearSale: '56%', lastYearProfit: '$765,442', thisYearProfit: '$296,232' },
          { brand: 'Toshiba', lastYearSale: '75%', thisYearSale: '54%', lastYearProfit: '$21,212', thisYearProfit: '$12,533' }
      ];
      this.kardex = [
        { fecha: '02/01/2020', detalle: 'Ocurrio la situación x', saldoInicialUnidad: '20', saldoInicialVUnitario: '$20.000', 
        saldoInicialVTotal: '$200.000', entradaUnidad:'50', entradaVUnitario:'$30.000' ,entradaVTotal:'$300.000', salidaUnidad:'60', 
        salidaVUnitario: '$40.000', salidaVTotal: '$500.000', saldoCantidad:'10', saldoValor:'$70.000' },
        { fecha: '02/01/2020', detalle: 'Ocurrio la situación x', saldoInicialUnidad: '20', saldoInicialVUnitario: '$20.000', 
        saldoInicialVTotal: '$200.000', entradaUnidad:'50', entradaVUnitario:'$30.000' ,entradaVTotal:'$300.000', salidaUnidad:'60', 
        salidaVUnitario: '$40.000', salidaVTotal: '$500.000', saldoCantidad:'10', saldoValor:'$70.000' },
        { fecha: '02/01/2020', detalle: 'Ocurrio la situación x', saldoInicialUnidad: '20', saldoInicialVUnitario: '$20.000', 
        saldoInicialVTotal: '$200.000', entradaUnidad:'50', entradaVUnitario:'$30.000' ,entradaVTotal:'$300.000', salidaUnidad:'60', 
        salidaVUnitario: '$40.000', salidaVTotal: '$500.000', saldoCantidad:'10', saldoValor:'$70.000' }
        ];
  }

}
