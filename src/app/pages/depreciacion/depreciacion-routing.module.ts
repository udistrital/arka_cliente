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
      path: 'consultar',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'consulta' },
      canActivate: [AuthGuard],
    },
    {
      path: 'revisar',
      component: ConsultaDepreciacionComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepreciacionRoutingModule { }
