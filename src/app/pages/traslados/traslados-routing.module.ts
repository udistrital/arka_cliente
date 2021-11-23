import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultaTrasladosComponent } from './consulta-traslados/consulta-traslados.component';
import { TrasladosComponent } from './traslados.component';

const routes: Routes = [{
  path: '',
  component: TrasladosComponent,
  children: [
    {
      path: 'consulta-traslados',
      component: ConsultaTrasladosComponent,
      data: { modo: 'consulta' },
    },
    {
      path: 'aprobar-traslados',
      component: ConsultaTrasladosComponent,
      data: { modo: 'revision' },
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrasladosRoutingModule { }
