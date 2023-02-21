import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { ListaBienesComponent } from './lista-bienes/lista-bienes.component';

const routes: Routes = [
  {
    path: 'consulta',
    component: ListaBienesComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BienesInmueblesRoutingModule { }
