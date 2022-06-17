import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../@core/_guards/auth.guard';
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
      canActivate: [AuthGuard],
    },
    {
      path: 'revision_bajas',
      component: ConsultaBajasComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
    {
      path: 'aprobacion_bajas',
      component: ConsultaBajasComponent,
      data: { modo: 'aprobacion' },
      canActivate: [AuthGuard],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BajasRoutingModule { }
