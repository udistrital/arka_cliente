import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BajasComponent } from './bajas.component';
import { ConsultaBajasComponent } from './consulta-bajas/consulta-bajas.component';

const routes: Routes = [{
  path: '',
  component: BajasComponent,
  children: [
    {
      path: 'consulta_bajas',
      component: ConsultaBajasComponent,
      data: { modo: 'consulta' },
    },
    {
      path: 'revision_bajas',
      component: ConsultaBajasComponent,
      data: { modo: 'revision' },
    },
    {
      path: 'aprobacion_bajas',
      component: ConsultaBajasComponent,
      data: { modo: 'aprobacion' },
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BajasRoutingModule { }
