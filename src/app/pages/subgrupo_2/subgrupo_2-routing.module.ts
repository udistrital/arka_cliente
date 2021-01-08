import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Subgrupo2Component } from './subgrupo_2.component';
import { ListSubgrupo2Component } from './list-subgrupo_2/list-subgrupo_2.component';
import { CrudSubgrupo2Component } from './crud-subgrupo_2/crud-subgrupo_2.component';



const routes: Routes = [{
  path: '',
  component: Subgrupo2Component,
  children: [{
    path: 'list-subgrupo_2',
    component: ListSubgrupo2Component,
  }, {
    path: 'crud-subgrupo_2',
    component: CrudSubgrupo2Component,
  }],
}];

@NgModule({
  imports: [
      RouterModule.forChild(routes),
  ],
  exports: [
      RouterModule,
  ],
})

export class Subgrupo2RoutingModule { }

export const routedComponents = [
  Subgrupo2Component,
  ListSubgrupo2Component,
  CrudSubgrupo2Component,
];
