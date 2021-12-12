import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntradasComponent } from './entradas.component';
import { RegistroComponent } from './registro/registro.component';
import { ConsultaEntradaComponent } from './consulta-entrada/consulta-entrada.component';
import { VerComprobanteComponent } from './ver-comprobante/ver-comprobante.component';

const routes: Routes = [{
  path: '',
  component: EntradasComponent,
  children: [
    {
      path: 'registro',
      component: RegistroComponent,
    },
    {
      path: 'consulta_entrada',
      component: ConsultaEntradaComponent,
      data: { modo: 'consulta' },
    },
    {
      path: 'aprobar_entrada',
      component: ConsultaEntradaComponent,
      data: { modo: 'revision' },
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
