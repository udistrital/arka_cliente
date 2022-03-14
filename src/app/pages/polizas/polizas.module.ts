import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PolizasRoutingModule } from './polizas-routing.module';
import { PolizasComponent } from './polizas.component';
import { ElementosPolizasComponent } from './elementos-polizas/elementos-polizas.component';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';


@NgModule({
  declarations: [
    PolizasComponent,
    ElementosPolizasComponent,
  ],
  imports: [
    CommonModule,
    PolizasRoutingModule,
    CommonModule,
    ThemeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    Ng2SmartTableModule,
  ],
})
export class PolizasModule { }
