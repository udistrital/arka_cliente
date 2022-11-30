import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AjustesComponent } from './ajustes.component';
import { AjustesRoutingModule } from './ajustes-routing.module';
import { ListaMovimientosComponent } from './lista-movimientos/lista-movimientos.component';
import { ActaRecibidoModule } from '../acta-recibido/acta-recibido.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatSortModule } from '@angular/material';
import { NgxCurrencyModule } from 'ngx-currency';
import { ThemeModule } from '../../@theme/theme.module';
import { ComprobanteComponent } from './comprobante/comprobante.component';
import { ConsultaAjusteComponent } from './consulta-ajuste/consulta-ajuste.component';
import { CrudAjusteComponent } from './crud-ajuste/crud-ajuste.component';

@NgModule({
  declarations: [
    AjustesComponent,
    ListaMovimientosComponent,
    ComprobanteComponent,
    ConsultaAjusteComponent,
    CrudAjusteComponent,
  ],
  imports: [
    CommonModule,
    AjustesRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
    NgxCurrencyModule,
    Ng2SmartTableModule,
    TranslateModule,
    MatTabsModule,
    MatStepperModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ActaRecibidoModule,
  ],
  exports: [
    ComprobanteComponent,
  ],
})
export class AjustesModule { }
