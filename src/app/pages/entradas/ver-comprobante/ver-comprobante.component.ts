import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-ver-comprobante',
  templateUrl: './ver-comprobante.component.html',
  styleUrls: ['./ver-comprobante.component.scss']
})


export class VerComprobanteComponent implements OnInit {
  @Input() transaccion: any;
  constructor() { }

  ngOnInit() {
     console.log("esta es la transaccion: ")  
     console.log(this.transaccion)  
     console.log(this.transaccion.Movimientos)  
  }

}
