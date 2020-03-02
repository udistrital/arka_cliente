import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'solicitud-bajas',
  templateUrl: './solicitud-bajas.component.html',
  styleUrls: ['./solicitud-bajas.component.scss']
})
export class SolicitudBajasComponent implements OnInit {

  DatosElemento: any;
  DatosTabla: any;
  DatosSolicitante: any;
  constructor() { }

  ngOnInit() {
  }

  Datos_Elemento(elemento: any) {
    this.DatosElemento = elemento;
  }
  Datos_Solicitante(solicitante: any) {
    this.DatosSolicitante = solicitante;
  }
  Datos_Tabla(elementos) {
    this.DatosTabla = elementos;
  }
}
