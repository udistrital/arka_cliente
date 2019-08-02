import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntradasComponent } from './entradas.component';
import { RegistroComponent } from './registro/registro.component';
import { ConsultaEntradaComponent } from './consulta-entrada/consulta-entrada.component';
import { SmartTableDatepickerComponent, SmartTableDatepickerRenderComponent } from './consulta-entrada/smart-table-datepicker/smart-table-datepicker.component'

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
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  entryComponents: [SmartTableDatepickerComponent, SmartTableDatepickerRenderComponent]
})
export class EntradasRoutingModule { }

export const routedComponents = [
  SmartTableDatepickerComponent,
  SmartTableDatepickerRenderComponent,
];
