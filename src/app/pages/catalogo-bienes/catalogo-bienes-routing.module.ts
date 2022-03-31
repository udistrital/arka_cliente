import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CatalogoBienesComponent } from './catalogo-bienes.component';
import { ConsultaCatalogoComponent } from './consulta-catalogo/consulta-catalogo.component';
import { CrudCuentasComponent } from './crud-cuentas/crud-cuentas.component';
import { RegistroCatalogoComponent } from './registro-catalogo/registro-catalogo.component';
import { RegistroElementosComponent } from './registro-elementos/registro-elementos.component';
import { TiposBienComponent } from './tipos-bien/tipos-bien.component';


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
      component: CrudCuentasComponent,
    },
    {
      path: 'tipos_bien',
      component: TiposBienComponent,
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
