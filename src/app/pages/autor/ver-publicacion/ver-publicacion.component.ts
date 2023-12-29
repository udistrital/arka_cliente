import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ver-publicacion',
  templateUrl: './ver-publicacion.component.html',
  styleUrls: ['./ver-publicacion.component.scss'],
})
export class VerPublicacionComponent implements OnInit {
  @Input() titulo;
  @Input() year;
  @Input() resumen;
  @Input() ISBN;

  constructor() { }

  ngOnInit() {
  }

}
