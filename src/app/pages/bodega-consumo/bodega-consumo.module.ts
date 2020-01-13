import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BodegaConsumoRoutingModule } from './bodega-consumo-routing.module';
import { BodegaConsumoComponent } from './bodega-consumo.component';
import { AgregarElementosComponent } from './agregar-elementos/agregar-elementos.component';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { FormElementosSeleccionadosComponent } from './form-elementos-seleccionados/form-elementos-seleccionados.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { KardexComponent } from './kardex/kardex.component';
import { TranslateModule } from '@ngx-translate/core';
import {TableModule} from 'primeng/table';
import { ConsultaSolicitudComponent } from './consulta-solicitud/consulta-solicitud.component';
import { DetalleSolicitudComponent } from './detalle-solicitud/detalle-solicitud.component';

@NgModule({
  declarations: [
    BodegaConsumoComponent,
    AgregarElementosComponent,
    FormElementosSeleccionadosComponent,
    KardexComponent,
    ConsultaSolicitudComponent,
    DetalleSolicitudComponent,
  ],
  imports: [
    NgxCurrencyModule,
    CommonModule,
    BodegaConsumoRoutingModule,
    ThemeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    Ng2SmartTableModule,
    TranslateModule,
    TableModule,
  ],
})
export class BodegaConsumoModule { }
