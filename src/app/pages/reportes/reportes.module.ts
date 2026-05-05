import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';
import { ConsultaReportesComponent } from './consulta-reportes/consulta-reportes.component';
import { ReportesRoutingModule } from './reportes-routing.module';
import { ReportesComponent } from './reportes.component';

@NgModule({
  declarations: [
    ReportesComponent,
    ConsultaReportesComponent,
  ],
  imports: [
    CommonModule,
    ThemeModule,
    ReportesRoutingModule,
  ],
})
export class ReportesModule { }
