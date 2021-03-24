import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AjustesComponent } from './ajustes.component';
import { AjustesRoutingModule } from './ajustes-routing.module';
import { ListaMovimientosComponent } from './lista-movimientos/lista-movimientos.component';

@NgModule({
  declarations: [
    AjustesComponent,
    ListaMovimientosComponent,
  ],
  imports: [
    CommonModule,
    AjustesRoutingModule
  ]
})
export class AjustesModule { }
