import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BodegaConsumoComponent} from './bodega-consumo.component'
import {KardexComponent} from './kardex/kardex.component'
const routes: Routes = [{
  path:'',
  component: BodegaConsumoComponent,
  children:[
    {
      path: 'kardex',
      component: KardexComponent
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BodegaConsumoRoutingModule { }
