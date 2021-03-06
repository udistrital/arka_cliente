import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AjustesComponent } from './ajustes.component';
import { AjustesRoutingModule } from './ajustes-routing.module';
import { ListaMovimientosComponent } from './lista-movimientos/lista-movimientos.component';
import { ActaRecibidoModule } from '../acta-recibido/acta-recibido.module';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatSortModule } from '@angular/material';
import { Ng2CompleterModule } from 'ng2-completer';
import { NgxCurrencyModule } from 'ngx-currency';
import { rootReducer } from '../../@core/store/rootReducer';
import { Store, StoreModule } from '@ngrx/store';
import { ListService } from '../../@core/store/services/list.service';
import { ThemeModule } from '../../@theme/theme.module';

@NgModule({
  declarations: [
    AjustesComponent,
    ListaMovimientosComponent,
  ],
  imports: [
    CommonModule,
    AjustesRoutingModule,
    ThemeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    Ng2SmartTableModule,
    StoreModule.forRoot(rootReducer),
    NgxCurrencyModule,
    Ng2SmartTableModule,
    TranslateModule,
    Ng2CompleterModule,
    MatTabsModule,
    MatStepperModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ActaRecibidoModule,
  ],
})
export class AjustesModule { }
