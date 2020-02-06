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
import { RespuestaSolicitudesComponent } from './respuesta-solicitudes/respuesta-solicitudes.component';

const routes: Routes = [{
  path: '',
  component: BodegaConsumoComponent,
  children: [
    {
      path: 'kardex',
      component: KardexComponent,
    },
    {
      path: 'agregar_elementos',
      component: AgregarElementosComponent,
    },
    {
      path: 'kardex',
      component: KardexComponent,
    },
    {
      path: 'consulta_solicitud',
      component: ConsultaSolicitudComponent,
    },
    {
      path: 'detalle_solicitud',
      component: DetalleSolicitudComponent,
    },
    {
      path: 'asignacion_kardex',
      component: AsignacionKardexComponent,
    },
    {
      path: 'consulta_kardex',
      component: ConsultaKardexComponent,
    },
    {
      path: 'bodega_sin_asignar',
      component: BodegaSinAsignarComponent,
    },
    {
      path: 'responder_solicitudes',
      component: RespuestaSolicitudesComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  entryComponents: [],
})
export class BodegaConsumoRoutingModule { }

export const routedComponents = [
];
