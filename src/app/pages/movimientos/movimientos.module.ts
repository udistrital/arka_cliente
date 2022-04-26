import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { MovimientosRoutingModule } from './movimientos-routing.module';
import { MovimientosComponent } from './movimientos.component';
import { SolicitudBajaBienComponent } from './solicitud-baja-bien/solicitud-baja-bien.component';
import { AprobacionBajaBienComponent } from './aprobacion-baja-bien/aprobacion-baja-bien.component';
import { ConsultaBajaBienComponent } from './consulta-baja-bien/consulta-baja-bien.component';
import { TiposMovimientoComponent } from './tipos-movimiento/tipos-movimiento.component';
import { RegistroTipoMovimientoComponent } from './tipos-movimiento/registro-tipo-movimiento/registro-tipo-movimiento.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
  declarations: [
    MovimientosComponent,
    SolicitudBajaBienComponent,
    AprobacionBajaBienComponent,
    ConsultaBajaBienComponent,
    TiposMovimientoComponent,
    RegistroTipoMovimientoComponent,
  ],
  imports: [
    CommonModule,
    MovimientosRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
  ],
})
export class MovimientosModule { }
