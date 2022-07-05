import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ThemeModule } from '../../@theme/theme.module';
import { ParametrosRoutingModule } from './parametros-routing.module';
import { ParametrosComponent } from './parametros.component';
import { TiposEntradaComponent } from './tipos-entrada/tipos-entrada.component';
import { TiposMovimientoComponent } from './tipos-movimiento/tipos-movimiento.component';
import { RegistroTipoMovimientoComponent } from './tipos-movimiento/registro-tipo-movimiento/registro-tipo-movimiento.component';

@NgModule({
  declarations: [
    ParametrosComponent,
    TiposEntradaComponent,
    TiposMovimientoComponent,
    RegistroTipoMovimientoComponent,
  ],
  imports: [
    CommonModule,
    ParametrosRoutingModule,
    Ng2SmartTableModule,
    ThemeModule,
  ],
})

export class ParametrosModule { }
