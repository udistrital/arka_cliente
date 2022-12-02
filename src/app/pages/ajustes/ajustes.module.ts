import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AjustesComponent } from './ajustes.component';
import { AjustesRoutingModule } from './ajustes-routing.module';
import { ListaMovimientosComponent } from './lista-movimientos/lista-movimientos.component';
import { ActaRecibidoModule } from '../acta-recibido/acta-recibido.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule,
    ActaRecibidoModule,
  ],
  exports: [
    ComprobanteComponent,
  ],
})
export class AjustesModule { }
