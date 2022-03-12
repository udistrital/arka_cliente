import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AjustesComponent } from './ajustes.component';
import { ConsultaAjusteComponent } from './consulta-ajuste/consulta-ajuste.component';
import { CrearAutoComponent } from './crear-auto/crear-auto.component';

const routes: Routes = [{
  path: '',
  component: AjustesComponent,
  children: [
    {
      path: 'lista-movimientos',
      component: CrearAutoComponent,
    },
    {
      path: 'consulta_ajustes',
      component: ConsultaAjusteComponent,
      data: { modo: 'consulta' },
    },
    {
      path: 'revision_ajustes',
      component: ConsultaAjusteComponent,
      data: { modo: 'revision' },
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AjustesRoutingModule { }
