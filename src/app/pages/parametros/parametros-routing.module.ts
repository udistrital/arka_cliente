import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TiposBienComponent } from './tipos-bien/tipos-bien.component';
import { TiposEntradaComponent } from './tipos-entrada/tipos-entrada.component';

const routes: Routes = [
  {
    path: 'tipos-entrada',
    component: TiposEntradaComponent,
  },
  {
    path: 'tipos-bien',
    component: TiposBienComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParametrosRoutingModule { }
