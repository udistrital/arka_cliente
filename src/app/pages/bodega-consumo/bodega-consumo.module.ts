import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BodegaConsumoRoutingModule } from './bodega-consumo-routing.module';
import { BodegaConsumoComponent } from './bodega-consumo.component';
import { KardexComponent } from './kardex/kardex.component';

@NgModule({
  declarations: [BodegaConsumoComponent, KardexComponent],
  imports: [
    CommonModule,
    BodegaConsumoRoutingModule
  ]
})
export class BodegaConsumoModule { }
