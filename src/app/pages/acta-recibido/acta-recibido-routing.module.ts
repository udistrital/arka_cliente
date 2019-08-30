import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActaRecibidoComponent } from './acta-recibido.component';
import { RegistroActaRecibidoComponent } from './registro-acta-recibido/registro-acta-recibido.component';
import { VerificacionActaRecibidoComponent } from './verificacion-acta-recibido/verificacion-acta-recibido.component';
import { ConsultaActaRecibidoComponent } from './consulta-acta-recibido/consulta-acta-recibido.component';
import { EdicionActaRecibidoComponent } from './edicion-acta-recibido/edicion-acta-recibido.component';

const routes: Routes = [{
  path: '',
  component: ActaRecibidoComponent,
  children: [
    {
      path: 'consulta_acta_recibido',
      component: ConsultaActaRecibidoComponent,
    },
    {
      path: 'registro_acta_recibido',
      component: RegistroActaRecibidoComponent,
    },
    {
      path: 'edicion_acta_recibido',
      component: EdicionActaRecibidoComponent,
    },
    {
      path: 'verificacion_acta_recibido',
      component: VerificacionActaRecibidoComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActaRecibidoRoutingModule { }
