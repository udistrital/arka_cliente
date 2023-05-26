import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { ConsultaInmueblesComponent } from './consulta-inmuebles/consulta-inmuebles.component';

const routes: Routes = [
  {
    path: 'consulta',
    component: ConsultaInmueblesComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BienesInmueblesRoutingModule { }
