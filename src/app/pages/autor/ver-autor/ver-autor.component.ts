import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ver-autor',
  templateUrl: './ver-autor.component.html',
  styleUrls: ['./ver-autor.component.scss'],
})
export class VerAutorComponent implements OnInit {

  nombre = '';
  nacionalidad = '';
  edad = 0;
  publicaciones: any[];
  generos: string[];
  verPublicaciones = false;

  constructor() { }

  ngOnInit() {
    this.nombre = 'Alejandra';
    this.edad = 0;
    this.nacionalidad = '';

    this.publicaciones = [
      {
        titulo: 'Capacitación front OATI',
        year: '2012',
        resumen: 'Vemos cositas generales de angular y de la oati',
        ISBN: '5467890hjg'
      },
      {
        titulo: 'Capacitación backend OATI',
        year: '2023',
        resumen: 'Vemos cositas generales del manejo de apis',
        ISBN: '5467890hjgjfghjhg'
      },
    ];
  }

  public togglePublicaciones() {
    this.verPublicaciones = !this.verPublicaciones;
  }

}
