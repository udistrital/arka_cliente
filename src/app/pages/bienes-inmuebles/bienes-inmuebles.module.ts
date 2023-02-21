import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { BienesInmueblesRoutingModule } from './bienes-inmuebles-routing.module';
import { ConsultaInmueblesComponent } from './consulta-inmuebles/consulta-inmuebles.component';
import { BienesInmueblesComponent } from './bienes-inmuebles.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormInmuebleComponent } from './form-inmueble/form-inmueble.component';
import { RegistroInmueblesComponent } from './registro-inmuebles/registro-inmuebles.component';

@NgModule({
  declarations: [
    ConsultaInmueblesComponent,
    BienesInmueblesComponent,
    FormInmuebleComponent,
    RegistroInmueblesComponent,
  ],
  imports: [
    CommonModule,
    BienesInmueblesRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
  ],
})
export class BienesInmueblesModule { }
