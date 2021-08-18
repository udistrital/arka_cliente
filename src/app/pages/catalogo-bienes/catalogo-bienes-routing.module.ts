import { NgModule } from '@angular/core';
import { CatalogoBienesComponent } from './catalogo-bienes.component';
import { ConsultaCatalogoComponent } from './consulta-catalogo/consulta-catalogo.component';
import { Routes, RouterModule } from '@angular/router';
import { RegistroCatalogoComponent } from './registro-catalogo/registro-catalogo.component';
import { RegistroElementosComponent } from './registro-elementos/registro-elementos.component';
import { RegistroCuentasCatalogoComponent } from './registro-cuentas-catalogo/registro-cuentas-catalogo.component';
import { CrudMovimientoComponent } from './crud-movimientos/crud-movimiento.component';


const routes: Routes = [{
  path: '',
  component: CatalogoBienesComponent,
  children: [
    {
      path: 'consulta_catalogo',
      component: ConsultaCatalogoComponent,
    },
    {
      path: 'registro_catalogo',
      component: RegistroCatalogoComponent,
    },
    {
      path: 'registro_elementos',
      component: RegistroElementosComponent,
    },
    {
      path: 'registro_cuentas_catalogo',
      component: RegistroCuentasCatalogoComponent,
    },
    {
      path: 'registro_cuentas',
      component: CrudMovimientoComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  entryComponents: [],
})
export class CatalogoBienesRoutingModule { }

export const routedComponents = [
];
