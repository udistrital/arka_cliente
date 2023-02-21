import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { ActaRecibidoRoutingModule } from './acta-recibido-routing.module';
import { ActaRecibidoComponent } from './acta-recibido.component';
import { RegistroActaRecibidoComponent } from './registro-acta-recibido/registro-acta-recibido.component';
import { ConsultaActaRecibidoComponent } from './consulta-acta-recibido/consulta-acta-recibido.component';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { EdicionActaRecibidoComponent } from './edicion-acta-recibido/edicion-acta-recibido.component';
import { GestionarElementosComponent } from './gestionar-elementos/gestionar-elementos.component';
import { ListService } from '../../@core/store/services/list.service';
import { VerActaRecibidoComponent } from './ver-acta-recibido/ver-acta-recibido.component';
import { CommonActas } from './shared';


@NgModule({
  declarations: [
    ActaRecibidoComponent,
    RegistroActaRecibidoComponent,
    VerActaRecibidoComponent,
    ConsultaActaRecibidoComponent,
    EdicionActaRecibidoComponent,
    GestionarElementosComponent,
  ],
  imports: [
    CommonModule,
    ActaRecibidoRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
    TranslateModule,
  ],
  exports: [
    GestionarElementosComponent,
  ],
  providers: [
    CurrencyPipe,
    ListService,
    CommonActas,
  ],
})
export class ActaRecibidoModule { }
