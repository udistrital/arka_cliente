import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BodegaConsumoComponent } from './bodega-consumo.component';
import { AgregarElementosComponent } from './agregar-elementos/agregar-elementos.component';
import { KardexComponent } from './kardex/kardex.component';
import { ConsultaSolicitudComponent } from './consulta-solicitud/consulta-solicitud.component';
import { DetalleSolicitudComponent } from './detalle-solicitud/detalle-solicitud.component';
import { AsignacionKardexComponent } from './asignacion-kardex/asignacion-kardex.component';
import { BodegaSinAsignarComponent } from './bodega-sin-asignar/bodega-sin-asignar.component';
import { ConsultaKardexComponent } from './consulta-kardex/consulta-kardex.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: BodegaConsumoComponent,
  children: [
    {
      path: 'kardex',
      component: KardexComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'agregar_elementos',
      component: AgregarElementosComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'kardex',
      component: KardexComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'consulta_solicitud',
      component: ConsultaSolicitudComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'detalle_solicitud',
      component: DetalleSolicitudComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'asignacion_kardex',
      component: AsignacionKardexComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'consulta_kardex',
      component: ConsultaKardexComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'bodega_sin_asignar',
      component: BodegaSinAsignarComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'responder_solicitudes',
      component: ConsultaSolicitudComponent,
      data: { Editar: true },
      canActivate: [AuthGuard],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BodegaConsumoRoutingModule { }
