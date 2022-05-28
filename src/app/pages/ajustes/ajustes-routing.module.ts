import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../@core/_guards/auth.guard';
import { AjustesComponent } from './ajustes.component';
import { ConsultaAjusteComponent } from './consulta-ajuste/consulta-ajuste.component';
import { ListaMovimientosComponent } from './lista-movimientos/lista-movimientos.component';

const routes: Routes = [{
  path: '',
  component: AjustesComponent,
  children: [
    {
      path: 'automatico',
      component: ListaMovimientosComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'consulta_ajustes',
      component: ConsultaAjusteComponent,
      data: { modo: 'consulta' },
      canActivate: [AuthGuard],
    },
    {
      path: 'revision_ajustes',
      component: ConsultaAjusteComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AjustesRoutingModule { }
