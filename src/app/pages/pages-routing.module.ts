import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';

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
    },
    {
      path: 'catalogo',
      loadChildren: './catalogo/catalogo.module#CatalogoModule',
    },
    {
      path: 'movimientos',
      loadChildren: './movimientos/movimientos.module#MovimientosModule',
    },
    {
      path: 'entradas',
      loadChildren: './entradas/entradas.module#EntradasModule',
    },
    {
      path: 'salidas',
      loadChildren: './salidas/salidas.module#SalidasModule',
    },
    {
      path: 'reportes',
      loadChildren: './reportes/reportes.module#ReportesModule',
    },
    {
      path: 'catalogo_bienes',
      loadChildren: './catalogo-bienes/catalogo-bienes.module#CatalogoBienesModule',
    },
    {
      path: 'bodega_consumo',
      loadChildren: './bodega-consumo/bodega-consumo.module#BodegaConsumoModule',
    },
    {
      path: 'bajas',
      loadChildren: './bajas/bajas.module#BajasModule',
    },
    {
      path: 'ajustes',
      loadChildren: './ajustes/ajustes.module#AjustesModule',
    },
    {
      path: 'bienes-inmuebles',
      loadChildren: './bienes-inmuebles/bienes-inmuebles.module#BienesInmueblesModule',
    },
    {
      path: 'parametros',
      loadChildren: './parametros/parametros.module#ParametrosModule',
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
