import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { BienesInmueblesRoutingModule } from './bienes-inmuebles-routing.module';
import { ListaBienesComponent } from './lista-bienes/lista-bienes.component';
import { BienesInmueblesComponent } from './bienes-inmuebles.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AvaluoComponent } from './avaluo/avaluo.component';
import { RegistroInmueblesComponent } from './registro-inmuebles/registro-inmuebles.component';

@NgModule({
  declarations: [ListaBienesComponent, BienesInmueblesComponent, AvaluoComponent, RegistroInmueblesComponent],
  imports: [
    CommonModule,
    BienesInmueblesRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
  ],
})
export class BienesInmueblesModule { }
