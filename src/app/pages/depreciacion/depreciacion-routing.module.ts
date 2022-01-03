import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultaDepreciacionComponent } from './consulta-depreciacion/consulta-depreciacion.component';
import { DepreciacionComponent } from './depreciacion.component';

const routes: Routes = [{
  path: '',
  component: DepreciacionComponent,
  children: [
    {
      path: 'consulta',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'consulta' },
    },
    {
      path: 'revision',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'revision' },
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepreciacionRoutingModule { }
