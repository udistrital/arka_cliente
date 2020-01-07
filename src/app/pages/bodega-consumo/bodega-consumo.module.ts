import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BodegaConsumoRoutingModule } from './bodega-consumo-routing.module';
import { BodegaConsumoComponent } from './bodega-consumo.component';
import { KardexComponent } from './kardex/kardex.component';
import {TableModule} from 'primeng/table';
@NgModule({
  declarations: [BodegaConsumoComponent, KardexComponent],
  imports: [
    TranslateModule,
    CommonModule,
    BodegaConsumoRoutingModule,
    TableModule,
  ],
})
export class BodegaConsumoModule { }
