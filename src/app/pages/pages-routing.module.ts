import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { AuthGuard } from '../@core/_guards/auth.guard';
import { CanLoadChildren } from '../@core/_guards/children.guard';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'acta_recibido',
      loadChildren: () => import('./acta-recibido/acta-recibido.module').then(m => m.ActaRecibidoModule),
      canLoad: [CanLoadChildren],
    },
    {
      path: 'catalogo',
      loadChildren: () => import('./catalogo/catalogo.module').then(m => m.CatalogoModule),
      canActivate: [AuthGuard],
    },
    {
      path: 'entradas',
      loadChildren: () => import('./entradas/entradas.module').then(m => m.EntradasModule),
      canLoad: [CanLoadChildren],
    },
    {
      path: 'salidas',
      loadChildren: () => import('./salidas/salidas.module').then(m => m.SalidasModule),
      canLoad: [CanLoadChildren],
    },
    {
      path: 'bodega_consumo',
      loadChildren: () => import('./bodega-consumo/bodega-consumo.module').then(m => m.BodegaConsumoModule),
      canActivate: [AuthGuard],
    },
    {
      path: 'bajas',
      loadChildren: () => import('./bajas/bajas.module').then(m => m.BajasModule),
      canActivate: [AuthGuard],
    },
    {
      path: 'ajustes',
      loadChildren: () => import('./ajustes/ajustes.module').then(m => m.AjustesModule),
      canActivate: [AuthGuard],
    },
    {
      path: 'bienes-inmuebles',
      loadChildren: () => import('./bienes-inmuebles/bienes-inmuebles.module').then(m => m.BienesInmueblesModule),
      canActivate: [AuthGuard],
    },
    {
      path: 'parametros',
      loadChildren: () => import('./parametros/parametros.module').then(m => m.ParametrosModule),
      canActivate: [AuthGuard],
    },
    {
      path: 'traslados',
      loadChildren: () => import('./traslados/traslados.module').then(m => m.TrasladosModule),
      canActivate: [AuthGuard],
    },
    {
      path: 'cierres',
      loadChildren: () => import('./depreciacion/depreciacion.module').then(m => m.DepreciacionModule),
      canActivate: [AuthGuard],
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    }, {
      path: '**',
      component: NotFoundComponent,
    }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
