import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalidasComponent } from './salidas.component';
import { RegistroSalidasComponent } from './registro-salidas/registro-salidas.component';
import { ConsultaSalidasComponent } from './consulta-salidas/consulta-salidas.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: SalidasComponent,
  children: [
    {
      path: 'registro_salidas',
      component: RegistroSalidasComponent,
      canActivate: [AuthGuard],
    },
    {
      path: 'consulta_salidas',
      component: ConsultaSalidasComponent,
      data: { modo: 'consulta' },
      canActivate: [AuthGuard],
    },
    {
      path: 'aprobar_salidas',
      component: ConsultaSalidasComponent,
      data: { modo: 'revision' },
      canActivate: [AuthGuard],
    },
  ],
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalidasRoutingModule { }
