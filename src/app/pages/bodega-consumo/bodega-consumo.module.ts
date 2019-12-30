import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BodegaConsumoRoutingModule } from './bodega-consumo-routing.module';
import { BodegaConsumoComponent } from './bodega-consumo/bodega-consumo.component';
import { AgregarElementosComponent } from './agregar-elementos/agregar-elementos.component';

@NgModule({
  declarations: [BodegaConsumoComponent, AgregarElementosComponent],
  imports: [
    CommonModule,
    BodegaConsumoRoutingModule,
  ],
})
export class BodegaConsumoModule { }
