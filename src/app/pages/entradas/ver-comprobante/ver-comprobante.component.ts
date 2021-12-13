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
  @Input() consecutivo: any;
  @Input() descripcion: any;
  totalCreditos: any;
  totalDebitos: any;

  constructor() { }

  ngOnInit() {
     this.totalCreditos = 0;
     this.totalDebitos = 0;
     this.transaccion.movimientos.forEach(obj => {
                                              if (obj.TipoMovimientoId === 344) {
                                                 this.totalDebitos += obj.Valor;
                                              }
                                              if (obj.TipoMovimientoId === 345) {
                                                 this.totalCreditos += obj.Valor;
                                              }
  });
  }
}
