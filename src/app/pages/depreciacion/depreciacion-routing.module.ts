import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { ConsultaDepreciacionComponent } from './consulta-depreciacion/consulta-depreciacion.component';
import { DepreciacionComponent } from './depreciacion.component';

const routes: Routes = [{
  path: '',
  component: DepreciacionComponent,
  children: [
    {
      path: 'depreciacion/consulta',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'consulta', tipo: 'depreciacion' },
      canActivate: [AuthGuard],
    },
    {
      path: 'depreciacion/revision',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'revision', tipo: 'depreciacion' },
      canActivate: [AuthGuard],
    },
    {
      path: 'amortizacion/consulta',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'consulta', tipo: 'amortizacion'  },
      canActivate: [AuthGuard],
    },
    {
      path: 'amortizacion/revision',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'revision', tipo: 'amortizacion' },
      canActivate: [AuthGuard],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepreciacionRoutingModule { }
