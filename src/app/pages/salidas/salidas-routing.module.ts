import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalidasComponent } from './salidas.component';
import { ConsultaSalidasComponent } from './consulta-salidas/consulta-salidas.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { TablaEntradaAprobadaComponent } from './tabla-entrada-aprobada/tabla-entrada-aprobada.component';

const routes: Routes = [{
  path: '',
  component: SalidasComponent,
  children: [
    {
      path: 'registro_salidas',
      component: TablaEntradaAprobadaComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'consulta_salidas',
      component: ConsultaSalidasComponent,
      data: { modo: 'consulta' },
      canActivate: [AuthGuard],
    },
    {
      path: 'consulta_salidas/q/:filter',
      component: ConsultaSalidasComponent,
      data: { modo: 'consulta' },
      canActivate: [AuthGuard],
    },
    {
      path: 'consulta_salidas/:id',
      component: ConsultaSalidasComponent,
      data: { modo: 'consulta' },
      canActivate: [AuthGuard],
    },
    {
      path: 'aprobar_salidas',
      component: ConsultaSalidasComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
    {
      path: 'aprobar_salidas/q/:filter',
      component: ConsultaSalidasComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
    {
      path: 'aprobar_salidas/:id',
      component: ConsultaSalidasComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
  ],
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalidasRoutingModule { }
