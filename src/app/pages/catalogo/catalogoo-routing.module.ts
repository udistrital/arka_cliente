import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CatalogoComponent } from './catalogo.component';
import { ListCatalogoComponent } from './list-catalogo/list-catalogo.component';
import { CrudCatalogoComponent } from './crud-catalogo/crud-catalogo.component';


const routes: Routes = [{
  path: '',
  component: CatalogoComponent,
  children: [{
    path: 'list-catalogo',
    component: ListCatalogoComponent,
  }, {
    path: 'crud-catalogo',
    component: CrudCatalogoComponent,
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

export class CatalogoRoutingModule { }

export const routedComponents = [
  CatalogoComponent,
  ListCatalogoComponent,
  CrudCatalogoComponent,
];
