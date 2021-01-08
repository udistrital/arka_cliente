import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MovimientosComponent } from './movimientos.component';
import { SolicitudBajaBienComponent } from './solicitud-baja-bien/solicitud-baja-bien.component';
import { AprobacionBajaBienComponent } from './aprobacion-baja-bien/aprobacion-baja-bien.component';
import { ConsultaBajaBienComponent } from './consulta-baja-bien/consulta-baja-bien.component';

const routes: Routes = [{
  path: '',
  component: MovimientosComponent,
  children: [
    {
      path: 'solicitud_baja_bien',
      component: SolicitudBajaBienComponent,
    },
    {
      path: 'aprobacion_baja_bien',
      component: AprobacionBajaBienComponent,
    },
    {
      path: 'consulta_baja_bien',
      component: ConsultaBajaBienComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MovimientosRoutingModule { }
