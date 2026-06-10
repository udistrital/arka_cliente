import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { ConsultaTrasladosComponent } from './consulta-traslados/consulta-traslados.component';
import { RegistrarTrasladoComponent } from './registrar-traslado/registrar-traslado.component';
import { TrasladosComponent } from './traslados.component';

const routes: Routes = [{
  path: '',
  component: TrasladosComponent,
  children: [
    {
      path: 'consulta',
      component: ConsultaTrasladosComponent,
      data: { modo: 'consulta' },
      canActivate: [AuthGuard],
    },
    {
      path: 'aprobar',
      component: ConsultaTrasladosComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
    {
      path: 'confirmar',
      component: ConsultaTrasladosComponent,
      data: { modo: 'confirmacion' },
      canActivate: [AuthGuard],
    },
    {
      path: 'registrar',
      component: RegistrarTrasladoComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrasladosRoutingModule { }
