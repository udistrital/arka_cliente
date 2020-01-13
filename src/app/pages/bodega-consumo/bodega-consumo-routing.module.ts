import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BodegaConsumoComponent } from './bodega-consumo.component';
import { AgregarElementosComponent } from './agregar-elementos/agregar-elementos.component';
import { KardexComponent } from './kardex/kardex.component';

const routes: Routes = [{
  path: '',
  component: BodegaConsumoComponent,
  children: [
    {
      path: 'kardex',
      component: KardexComponent,
    },
    {
      path: 'agregar_elementos',
      component: AgregarElementosComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  entryComponents: [],
})
export class BodegaConsumoRoutingModule { }

export const routedComponents = [
];
