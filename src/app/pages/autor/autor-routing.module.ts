import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VerAutorComponent } from './ver-autor/ver-autor.component';
import { AuthGuard } from '../../@core/_guards/auth.guard';


const routes: Routes = [{
  path: '',
  component: VerAutorComponent,
  children: [
    {
      path: 'ver',
      component: VerAutorComponent,
      // canActivate: [AuthGuard],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutorRoutingModule { }
