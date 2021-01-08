import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalidasComponent } from './salidas.component';
import { RegistroSalidasComponent } from './registro-salidas/registro-salidas.component';
import { ConsultaSalidasComponent } from './consulta-salidas/consulta-salidas.component';

const routes: Routes = [{
  path: '',
  component: SalidasComponent,
  children: [
    {
      path: 'registro_salidas',
      component: RegistroSalidasComponent,
    },
    {
      path: 'consulta_salidas',
      component: ConsultaSalidasComponent,
    },
  ],
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalidasRoutingModule { }
