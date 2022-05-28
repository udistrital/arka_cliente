import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportesComponent } from './reportes.component';
import { RegistroEntradasComponent } from './registro-entradas/registro-entradas.component';
import { RegistroSalidasComponent } from './registro-salidas/registro-salidas.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';

const routes: Routes = [{
  path: '',
  component: ReportesComponent,
  children: [
    {
    path: 'registro-entradas',
    component: RegistroEntradasComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'registro-salidas',
    component: RegistroSalidasComponent,
    canActivate: [AuthGuard],
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesRoutingModule { }
