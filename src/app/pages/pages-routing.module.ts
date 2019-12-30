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
      path: 'grupo',
      loadChildren: './grupo/grupo.module#GrupoModule',
    },
    {
      path: 'subgrupo_1',
      loadChildren: './subgrupo_1/subgrupo_1.module#Subgrupo1Module',
    },
    {
      path: 'subgrupo_2',
      loadChildren: './subgrupo_2/subgrupo_2.module#Subgrupo2Module',
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
