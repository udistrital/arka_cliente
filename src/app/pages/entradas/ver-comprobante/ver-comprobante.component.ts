import { Component, Input, OnInit } from '@angular/core';
import { ParametrosHelper } from '../../../helpers/parametros/parametrosHelper';

@Component({
   selector: 'ngx-ver-comprobante',
   templateUrl: './ver-comprobante.component.html',
   styleUrls: ['./ver-comprobante.component.scss'],
})
export class VerComprobanteComponent implements OnInit {
   @Input() transaccion: any;
   @Input() consecutivo: any;
   totalCreditos: any;
   totalDebitos: any;
   constructor(
      private p: ParametrosHelper,
   ) {}

   ngOnInit() {
      this.totalCreditos = 0;
      this.totalDebitos = 0;
      this.transaccion.Movimientos.forEach(obj => {
         if (obj.TipoMovimientoId === this.p.getParametroDebito()) {
            this.totalDebitos += obj.Valor;
         }
         if (obj.TipoMovimientoId === this.p.getParametroCredito()) {
            this.totalCreditos += obj.Valor;
         }
      });
   }
}
