import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-ver-comprobante',
  templateUrl: './ver-comprobante.component.html',
  styleUrls: ['./ver-comprobante.component.scss']
})


export class VerComprobanteComponent implements OnInit {
  @Input() transaccion: any;
  @Input() consecutivo: any;
  @Input() descripcion: any;
  totalCreditos: any; 
  totalDebitos: any; 

  constructor() { }

  ngOnInit() {
     console.log("esta es la transaccion: ")  
     console.log(this.transaccion)  
     console.log("Estos son los movimientos",this.transaccion.movimientos)  
     this.totalCreditos = 0;
     this.totalDebitos = 0;
this.transaccion.movimientos.forEach(obj => { console.log("elk valor",obj.Valor); 
                                              if (obj.TipoMovimientoId == 344) {this.totalDebitos += obj.Valor}
                                              if (obj.TipoMovimientoId == 345) {this.totalCreditos += obj.Valor}
  });
      console.log("El total del comprobante", this.totalCreditos, this.totalDebitos);
  }

}
