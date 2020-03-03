import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BajasComponent } from './bajas.component';
import { SolicitudBajasComponent } from './solicitud-bajas/solicitud-bajas.component';
import { ConsultaBajasComponent } from './consulta-bajas/consulta-bajas.component';
import { AprobacionBajasComponent } from './aprobacion-bajas/aprobacion-bajas.component';
import { ConsultaSolicitudBajasComponent } from './consulta-solicitud-bajas/consulta-solicitud-bajas.component';

const routes: Routes = [{
  path: '',
  component: BajasComponent,
  children: [
    {
      path: 'solicitud_bajas',
      component: SolicitudBajasComponent,
    },
    {
      path: 'consulta_bajas',
      component: ConsultaBajasComponent,
    },
    {
      path: 'consulta_solicitud_bajas',
      component: ConsultaSolicitudBajasComponent,
    },
    {
      path: 'aprobacion_bajas',
      component: AprobacionBajasComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BajasRoutingModule { }
