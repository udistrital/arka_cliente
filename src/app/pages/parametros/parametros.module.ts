import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { ThemeModule } from '../../@theme/theme.module';


import { ParametrosRoutingModule } from './parametros-routing.module';
import { ParametrosComponent } from './parametros.component';
import { TiposEntradaComponent } from './tipos-entrada/tipos-entrada.component';
import { TiposBienComponent } from './tipos-bien/tipos-bien.component';

@NgModule({
  declarations: [
    ParametrosComponent,
    TiposEntradaComponent,
    TiposBienComponent,
  ],
  imports: [
    CommonModule,
    ParametrosRoutingModule,
    Ng2SmartTableModule,
    ThemeModule,
  ],
})
export class ParametrosModule { }
