import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';
import { RegistroEntradasComponent } from './registro-entradas/registro-entradas.component';
import { ToasterModule } from 'angular2-toaster';
import { RegistroSalidasComponent } from './registro-salidas/registro-salidas.component';
import { SafePipe } from './registro-entradas/sanitize.pipe';

@NgModule({
  declarations: [ReportesComponent, RegistroEntradasComponent, RegistroSalidasComponent, SafePipe],
  imports: [
    CommonModule,
    ThemeModule,
    ToasterModule,
    ReportesRoutingModule,
  ],
})
export class ReportesModule { }
