import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntradasComponent } from './entradas.component';
import { ConsultaEntradaComponent } from './consulta-entrada/consulta-entrada.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: EntradasComponent,
  children: [
    {
      path: 'consulta_entrada',
      component: ConsultaEntradaComponent,
      data: { modo: 'consulta' },
      canActivate: [AuthGuard],
    },
    {
      path: 'aprobar_entrada',
      component: ConsultaEntradaComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  entryComponents: [],
})

export class EntradasRoutingModule { }

export const routedComponents = [
];
