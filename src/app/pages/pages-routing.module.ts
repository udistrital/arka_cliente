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
      loadChildren: './acta-recibido/acta-recibido.module#ActaRecibidoModule',
      canLoad: [CanLoadChildren],
    },
    {
      path: 'catalogo',
      loadChildren: './catalogo/catalogo.module#CatalogoModule',
      canActivate: [AuthGuard],
    },
    {
      path: 'entradas',
      loadChildren: './entradas/entradas.module#EntradasModule',
      canLoad: [CanLoadChildren],
    },
    {
      path: 'salidas',
      loadChildren: './salidas/salidas.module#SalidasModule',
      canLoad: [CanLoadChildren],
    },
    {
      path: 'reportes',
      loadChildren: './reportes/reportes.module#ReportesModule',
      canActivate: [AuthGuard],
    },
    {
      path: 'bodega_consumo',
      loadChildren: './bodega-consumo/bodega-consumo.module#BodegaConsumoModule',
      canActivate: [AuthGuard],
    },
    {
      path: 'bajas',
      loadChildren: './bajas/bajas.module#BajasModule',
      canActivate: [AuthGuard],
    },
    {
      path: 'ajustes',
      loadChildren: './ajustes/ajustes.module#AjustesModule',
      canActivate: [AuthGuard],
    },
    {
      path: 'bienes-inmuebles',
      loadChildren: './bienes-inmuebles/bienes-inmuebles.module#BienesInmueblesModule',
      canActivate: [AuthGuard],
    },
    {
      path: 'parametros',
      loadChildren: './parametros/parametros.module#ParametrosModule',
      canActivate: [AuthGuard],
    },
    {
      path: 'traslados',
      loadChildren: './traslados/traslados.module#TrasladosModule',
      canActivate: [AuthGuard],
    },
    {
      path: 'mediciones_posteriores',
      loadChildren: './depreciacion/depreciacion.module#DepreciacionModule',
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
export class PagesRoutingModule {
}
