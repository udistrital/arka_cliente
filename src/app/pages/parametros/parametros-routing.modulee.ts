import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TiposEntradaComponent } from './tipos-entrada/tipos-entrada.component';
import { TiposMovimientoComponent} from './tipos-movimiento/tipos-movimiento.component';

const routes: Routes = [
  {
    path: 'tipos-entrada',
    component: TiposEntradaComponent,
  },
  {
    path: 'tipos_movimiento',
    component: TiposMovimientoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ParametrosRoutingModule { }
