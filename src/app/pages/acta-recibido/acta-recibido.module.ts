import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { ActaRecibidoRoutingModule } from './acta-recibido-routing.module';
import { ActaRecibidoComponent } from './acta-recibido.component';
import { RegistroActaRecibidoComponent } from './registro-acta-recibido/registro-acta-recibido.component';
import { ConsultaActaRecibidoComponent } from './consulta-acta-recibido/consulta-acta-recibido.component';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NbStepperModule } from '@nebular/theme';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import { MatIconModule, MatPaginatorModule, MatSortModule } from '@angular/material';
import { EdicionActaRecibidoComponent } from './edicion-acta-recibido/edicion-acta-recibido.component';
import { GestionarElementosComponent } from './gestionar-elementos/gestionar-elementos.component';
import { Ng2CompleterModule } from 'ng2-completer';
import { NgxCurrencyModule } from 'ngx-currency';
import { rootReducer } from '../../@core/store/rootReducer';
import { Store, StoreModule } from '@ngrx/store';
import { ListService } from '../../@core/store/services/list.service';
import { VerActaRecibidoComponent } from './ver-acta-recibido/ver-acta-recibido.component';


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
    StoreModule.forRoot(rootReducer),
    NgxCurrencyModule,
    ActaRecibidoRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
    TranslateModule,
    Ng2CompleterModule,
    NbStepperModule,
    MatTabsModule,
    MatIconModule,
    MatStepperModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  exports: [
    VerActaRecibidoComponent,
    GestionarElementosComponent,
  ],
  providers: [
    CurrencyPipe,
    ListService,
  ],
})
export class ActaRecibidoModule { }
