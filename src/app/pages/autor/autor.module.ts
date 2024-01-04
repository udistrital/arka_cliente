import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AutorRoutingModule } from './autor-routing.module';
import { VerAutorComponent } from './ver-autor/ver-autor.component';
import { VerPublicacionComponent } from './ver-publicacion/ver-publicacion.component';
import { ThemeModule } from '../../@theme/theme.module';


@NgModule({
  declarations: [VerAutorComponent, VerPublicacionComponent],
  imports: [
    CommonModule,
    AutorRoutingModule,
    ThemeModule,
  ],
})
export class AutorModule { }
