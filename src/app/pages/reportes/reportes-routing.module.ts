import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { ConsultaReportesComponent } from './consulta-reportes/consulta-reportes.component';
import { ReportesComponent } from './reportes.component';

const routes: Routes = [{
  path: '',
  component: ReportesComponent,
  children: [
    {
      path: 'consultar',
      component: ConsultaReportesComponent,
      canActivate: [AuthGuard],
    },
    {
      path: '',
      redirectTo: 'consultar',
      pathMatch: 'full',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesRoutingModule { }
