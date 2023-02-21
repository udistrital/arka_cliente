import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CatalogoComponent } from './catalogo.component';
import { CrudCatalogoComponent } from './crud-catalogo/crud-catalogo.component';
import { ConsultaCatalogoComponent } from './consulta-catalogo/consulta-catalogo.component';
import { CrudCuentasComponent } from './crud-cuentas/crud-cuentas.component';
import { ListCatalogoComponent } from './list-catalogo/list-catalogo.component';
import { RegistroCatalogoComponent } from './registro-catalogo/registro-catalogo.component';
import { RegistroElementosComponent } from './registro-elementos/registro-elementos.component';
import { TiposBienComponent } from './tipos-bien/tipos-bien.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: CatalogoComponent,
  children: [
    {
      path: 'list-catalogo',
      component: ListCatalogoComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'crud-catalogo',
      component: CrudCatalogoComponent,
      canActivate: [AuthGuard],
    },
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
  imports: [
      RouterModule.forChild(routes),
  ],
  exports: [
      RouterModule,
  ],
})

export class CatalogoRoutingModule { }
