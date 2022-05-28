import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { BienesInmueblesComponent } from './bienes-inmuebles.component';
import { ListaBienesComponent } from './lista-bienes/lista-bienes.component';

const routes: Routes = [
  {
    path: 'lista-bienes',
    component: ListaBienesComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BienesInmueblesRoutingModule { }
