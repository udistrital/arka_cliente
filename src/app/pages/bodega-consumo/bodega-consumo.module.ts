import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BodegaConsumoRoutingModule } from './bodega-consumo-routing.module';
import { BodegaConsumoComponent } from './bodega-consumo.component';
import { AgregarElementosComponent } from './agregar-elementos/agregar-elementos.component';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

@NgModule({
  declarations: [
    BodegaConsumoComponent,
    AgregarElementosComponent,
  ],
  imports: [
    CommonModule,
    BodegaConsumoRoutingModule,
    ThemeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    Ng2SmartTableModule,
  ],
})
export class BodegaConsumoModule { }
