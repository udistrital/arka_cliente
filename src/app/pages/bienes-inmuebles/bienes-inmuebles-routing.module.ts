import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BienesInmueblesComponent } from './bienes-inmuebles.component';
import { ListaBienesComponent } from './lista-bienes/lista-bienes.component';

const routes: Routes = [
  {
    path: 'lista-bienes',
    component: ListaBienesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BienesInmueblesRoutingModule { }
