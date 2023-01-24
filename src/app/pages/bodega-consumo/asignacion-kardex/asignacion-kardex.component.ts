import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
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
  apertura: any;
  ElementosKardex: any;
  paso: number;
  modoKardexCargado: boolean;

  constructor(
    private translate: TranslateService,
    private BodegaConsumo: BodegaConsumoHelper,
  ) {
    this.paso = 0;
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  Asignar_Elemento_Bodega(event) {
    this.ElementoSinAsignar = event;
    this.paso = 1;
    // console.log(event);
  }

  Asignar_Elemento_Movimiento(event) {
    this.ElementoPorAsignar = event;
    // console.log(event);
  }

  Asignar_Elemento_Catalogo(event) {
    this.paso = 2;
    this.ElementoCatalogo = event;

    this.modoKardexCargado = false;
    this.BodegaConsumo.getElementosKardex(event.Id, -1, 0, 'asc').subscribe((res: any) => {
      if (res.length && res.some(el => el.MovimientoId.FormatoTipoMovimientoId.CodigoAbreviacion === 'AP_KDX')) {
          this.ElementosKardex = res;
          this.apertura = false;
      } else {
        this.apertura = true;
      }
      this.modoKardexCargado = true;
    });
    // console.log(event);
  }

  onVolver() {
    if (this.paso > 0) {
      this.paso--;
    }

    switch (this.paso) {

      case 0:
        this.ElementoSinAsignar = undefined;
        break;

      case 1:
        this.ElementoCatalogo = undefined;
        this.ElementosKardex = undefined;
        this.apertura = undefined;
        this.modoKardexCargado = false;
        break;

      default:
        break;
    }
  }

}
