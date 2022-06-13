import { NgModule } from '@angular/core';
import { CatalogoBienesComponent } from './catalogo-bienes.component';
import { ConsultaCatalogoComponent } from './consulta-catalogo/consulta-catalogo.component';
import { Routes, RouterModule } from '@angular/router';
import { RegistroCatalogoComponent } from './registro-catalogo/registro-catalogo.component';
import { RegistroElementosComponent } from './registro-elementos/registro-elementos.component';
import { CrudCuentasComponent } from './crud-cuentas/crud-cuentas.component';
import { TiposBienComponent } from './tipos-bien/tipos-bien.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';


const routes: Routes = [{
  path: '',
  component: CatalogoBienesComponent,
  children: [
    {
      path: 'consulta_catalogo',
      component: ConsultaCatalogoComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'registro_catalogo',
      component: RegistroCatalogoComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'registro_elementos',
      component: RegistroElementosComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'registro_cuentas_catalogo',
      component: CrudCuentasComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'tipos_bien',
      component: TiposBienComponent,
      canActivate: [AuthGuard],
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
