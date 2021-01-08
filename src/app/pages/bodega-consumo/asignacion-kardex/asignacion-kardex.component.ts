import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-asignacion-kardex',
  templateUrl: './asignacion-kardex.component.html',
  styleUrls: ['./asignacion-kardex.component.scss'],
})
export class AsignacionKardexComponent implements OnInit {

  ElementoSinAsignar: any;
  ElementoCatalogo: any;
  ElementoPorAsignar: any;
  entrada: any;
  apertura: any;
  ElementosKardex: any;


  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
    private BodegaConsumo: BodegaConsumoHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });

  }

  Asignar_Elemento_Bodega(event) {
    this.ElementoSinAsignar = event;
    // console.log(event);
  }
  Asignar_Elemento_Movimiento(event) {
    this.ElementoPorAsignar = event;
    // console.log(event);
  }
  Asignar_Elemento_Catalogo(event) {
    this.ElementoCatalogo = event;

    this.BodegaConsumo.getElementosKardex(event.Id).subscribe((res: any) => {

      if (Object.keys(res[0]).length !== 0) {
        this.ElementosKardex = res;
        this.entrada = true;
      } else {
        this.apertura = true;
      }
    });

    // console.log(event);

  }
  onVolver() {
    if (this.ElementoPorAsignar !== undefined) {
      this.ElementoPorAsignar = undefined;
    } else {
      this.ElementoCatalogo = undefined;
      this.ElementoSinAsignar = undefined;
      this.entrada = undefined;
      this.apertura = undefined;
    }

  }
  ngOnInit() {

  }

}
