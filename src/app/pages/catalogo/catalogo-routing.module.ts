import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatalogoComponent } from './catalogo.component';
import { ListCatalogoComponent } from './list-catalogo/list-catalogo.component';
import { CrudCatalogoComponent } from './crud-catalogo/crud-catalogo.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: CatalogoComponent,
  children: [{
    path: 'list-catalogo',
    component: ListCatalogoComponent,
    canActivate: [AuthGuard],
  }, {
    path: 'crud-catalogo',
    component: CrudCatalogoComponent,
    canActivate: [AuthGuard],
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
