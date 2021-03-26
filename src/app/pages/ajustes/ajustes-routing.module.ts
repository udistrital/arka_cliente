import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AjustesComponent } from './ajustes.component';
import { ListaMovimientosComponent } from './lista-movimientos/lista-movimientos.component';

const routes: Routes = [{
  path: '',
  component: AjustesComponent,
  children: [
    {
      path: 'lista-movimientos',
      component: ListaMovimientosComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AjustesRoutingModule { }
