import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BienesInmueblesRoutingModule } from './bienes-inmuebles-routing.module';
import { ListaBienesComponent } from './lista-bienes/lista-bienes.component';
import { BienesInmueblesComponent } from './bienes-inmuebles.component';

@NgModule({
  declarations: [ListaBienesComponent, BienesInmueblesComponent],
  imports: [
    CommonModule,
    BienesInmueblesRoutingModule
  ]
})
export class BienesInmueblesModule { }
