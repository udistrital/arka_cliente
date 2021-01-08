import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GrupoComponent } from './grupo.component';
import { ListGrupoComponent } from './list-grupo/list-grupo.component';
import { CrudGrupoComponent } from './crud-grupo/crud-grupo.component';



const routes: Routes = [{
  path: '',
  component: GrupoComponent,
  children: [{
    path: 'list-grupo',
    component: ListGrupoComponent,
  }, {
    path: 'crud-grupo',
    component: CrudGrupoComponent,
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

export class GrupoRoutingModule { }

export const routedComponents = [
  GrupoComponent,
  ListGrupoComponent,
  CrudGrupoComponent,
];
