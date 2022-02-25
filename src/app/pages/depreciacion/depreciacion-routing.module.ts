import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
    },
    {
      path: 'depreciacion/revision',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'revision', tipo: 'depreciacion' },
    },
    {
      path: 'amortizacion/consulta',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'consulta', tipo: 'amortizacion'  },
    },
    {
      path: 'amortizacion/revision',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'revision', tipo: 'amortizacion' },
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepreciacionRoutingModule { }
