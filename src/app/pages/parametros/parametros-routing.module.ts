import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TiposEntradaComponent } from './tipos-entrada/tipos-entrada.component';

const routes: Routes = [
  {
    path: 'tipos-entrada',
    component: TiposEntradaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametrosRoutingModule { }
