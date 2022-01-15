import { Component, Input, OnInit } from '@angular/core';

export const MVTO_DB = 344;
export const MVTO_CR = 345;

@Component({
   selector: 'ngx-ver-comprobante',
   templateUrl: './ver-comprobante.component.html',
   styleUrls: ['./ver-comprobante.component.scss'],
})
export class VerComprobanteComponent implements OnInit {
   @Input() transaccion: any;
   @Input() tercero: any;
   @Input() consecutivo: any;
   @Input() descripcion: any;
   totalCreditos: any;
   totalDebitos: any;
   m_db = MVTO_DB;
   m_cr = MVTO_CR;
   constructor() { }

   ngOnInit() {
      this.totalCreditos = 0;
      this.totalDebitos = 0;
      this.transaccion.Movimientos.forEach(obj => {
         if (obj.TipoMovimientoId === MVTO_DB) {
            this.totalDebitos += obj.Valor;
         }
         if (obj.TipoMovimientoId === MVTO_CR) {
            this.totalCreditos += obj.Valor;
         }
      });
   }
}
