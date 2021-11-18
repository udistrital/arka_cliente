import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultaTrasladosComponent } from './consulta-traslados/consulta-traslados.component';
import { FormTrasladoComponent } from './form-traslado/form-traslado.component';
import { RegistroTrasladoComponent } from './registro-traslado/registro-traslado.component';
import { TrasladosComponent } from './traslados.component';

const routes: Routes = [{
  path: '',
  component: TrasladosComponent,
  children: [
    {
      path: 'consulta-traslados',
      component: ConsultaTrasladosComponent,
    },
    {
      path: 'registrar-solicitud',
      component: RegistroTrasladoComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrasladosRoutingModule { }
