import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { EntradasRoutingModule, routedComponents } from './entradas-routing.module';
import { EntradasComponent } from './entradas.component';
import { ReposicionComponent } from './reposicion/reposicion.component';
import { ElaboracionPropiaComponent } from './elaboracion-propia/elaboracion-propia.component';
import { DonacionComponent } from './donacion/donacion.component';
import { AdquisicionComponent } from './adquisicion/adquisicion.component';
import { SobranteComponent } from './sobrante/sobrante.component';
import { RegistroComponent } from './registro/registro.component';
import { TercerosComponent } from './terceros/terceros.component';
import { ConsultaEntradaComponent } from './consulta-entrada/consulta-entrada.component';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { TablaEntradasComponent } from './tabla-entradas/tabla-entradas.component';

@NgModule({
  declarations: [
    ...routedComponents,
    EntradasComponent,
    ReposicionComponent,
    ElaboracionPropiaComponent,
    DonacionComponent,
    AdquisicionComponent,
    SobranteComponent,
    RegistroComponent,
    TercerosComponent,
    ConsultaEntradaComponent,
    TablaEntradasComponent,
  ],
  imports: [
    CommonModule,
    EntradasRoutingModule,
    ThemeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    Ng2SmartTableModule,
  ],
})
export class EntradasModule { }
