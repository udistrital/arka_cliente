import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';
import { RegistroEntradasComponent } from './registro-entradas/registro-entradas.component';
//import { RegistroSalidasComponente } from './registro-salidasss/registro-salidas.component';
import { ToasterModule } from 'angular2-toaster';
import { RegistroSalidasComponent } from './registro-salidas/registro-salidas.component';

@NgModule({
  declarations: [ReportesComponent, RegistroEntradasComponent, RegistroSalidasComponent],
  imports: [
    CommonModule,
    ThemeModule,
    ToasterModule,
    ReportesRoutingModule,
  ],
})
export class ReportesModule { }
