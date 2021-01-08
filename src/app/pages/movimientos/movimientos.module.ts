import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { MovimientosRoutingModule } from './movimientos-routing.module';
import { MovimientosComponent } from './movimientos.component';
import { SolicitudBajaBienComponent } from './solicitud-baja-bien/solicitud-baja-bien.component';
import { AprobacionBajaBienComponent } from './aprobacion-baja-bien/aprobacion-baja-bien.component';
import { ConsultaBajaBienComponent } from './consulta-baja-bien/consulta-baja-bien.component';

@NgModule({
  declarations: [
    MovimientosComponent,
    SolicitudBajaBienComponent,
    AprobacionBajaBienComponent,
    ConsultaBajaBienComponent,
  ],
  imports: [
    CommonModule,
    MovimientosRoutingModule,
    ThemeModule,
  ],
})
export class MovimientosModule { }
