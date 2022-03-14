import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ElementosPolizasComponent } from './elementos-polizas/elementos-polizas.component';
import { PolizasComponent } from './polizas.component';

const routes: Routes = [{
  path: '',
  component: PolizasComponent,
  children: [
    {
      path: 'elementos',
      component: ElementosPolizasComponent,
      data: { modo: 'consulta' },
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PolizasRoutingModule { }
