import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-entradas',
  template: `<router-outlet></router-outlet>`,
})
export class EntradasComponent implements OnInit {

  opcionEntrada: string;

  constructor() { }

  ngOnInit() {
  }

}
