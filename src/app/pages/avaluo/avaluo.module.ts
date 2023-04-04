import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AvaluoRoutingModule } from './avaluo-routing.module';
import { ConsultaAvaluosComponent } from './consulta-avaluos/consulta-avaluos.component';
import { AvaluoComponent } from './avaluo.component';
import { FormAvaluoComponent } from './form-avaluo/form-avaluo.component';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';


@NgModule({
  declarations: [
    ConsultaAvaluosComponent,
    AvaluoComponent,
    FormAvaluoComponent,
  ],
  imports: [
    CommonModule,
    AvaluoRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
  ],
})
export class AvaluoModule { }
