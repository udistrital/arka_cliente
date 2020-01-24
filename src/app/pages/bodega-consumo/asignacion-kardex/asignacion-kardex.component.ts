import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-asignacion-kardex',
  templateUrl: './asignacion-kardex.component.html',
  styleUrls: ['./asignacion-kardex.component.scss'],
})
export class AsignacionKardexComponent implements OnInit {

  ElementoSinAsignar: any;
  ElementoCatalogo: any;
  ElementoPorAsignar: any;
  

  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });

  }

  Asignar_Elemento_Bodega(event) {
    this.ElementoSinAsignar = event;
    console.log(event);
  }
  Asignar_Elemento_Movimiento(event) {
    this.ElementoPorAsignar = event;
    console.log(event);
  }
  Asignar_Elemento_Catalogo(event) {
    this.ElementoCatalogo = event;
    console.log(event);

  }
  onVolver() {
    if (this.ElementoPorAsignar !== undefined) {
      this.ElementoPorAsignar = undefined;
    } else {
      this.ElementoCatalogo = undefined;
      this.ElementoSinAsignar = undefined;
    }
    
  }
  ngOnInit() {

  }

}
