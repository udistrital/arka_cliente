import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Subgrupo1Component } from './subgrupo_1.component';
import { ListSubgrupo1Component } from './list-subgrupo_1/list-subgrupo_1.component';
import { CrudSubgrupo1Component } from './crud-subgrupo_1/crud-subgrupo_1.component';



const routes: Routes = [{
  path: '',
  component: Subgrupo1Component,
  children: [{
    path: 'list-subgrupo_1',
    component: ListSubgrupo1Component,
  }, {
    path: 'crud-subgrupo_1',
    component: CrudSubgrupo1Component,
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

export class Subgrupo1RoutingModule { }

export const routedComponents = [
  Subgrupo1Component,
  ListSubgrupo1Component,
  CrudSubgrupo1Component,
];
