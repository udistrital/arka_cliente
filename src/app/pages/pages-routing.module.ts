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
