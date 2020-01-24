import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BodegaConsumoRoutingModule } from './bodega-consumo-routing.module';
import { BodegaConsumoComponent } from './bodega-consumo.component';
import { AgregarElementosComponent } from './agregar-elementos/agregar-elementos.component';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { FormElementosSeleccionadosComponent } from './form-elementos-seleccionados/form-elementos-seleccionados.component';
import { NgxCurrencyModule } from 'ngx-currency';
import { KardexComponent, CurrencyCustomPipe } from './kardex/kardex.component';
import { TableModule } from 'primeng/table';
import { ConsultaSolicitudComponent } from './consulta-solicitud/consulta-solicitud.component';
import { DetalleSolicitudComponent } from './detalle-solicitud/detalle-solicitud.component';
import { BodegaSinAsignarComponent } from './bodega-sin-asignar/bodega-sin-asignar.component';
import { RelacionCatalogoComponent } from './relacion-catalogo/relacion-catalogo.component';
import { AperturaKardexComponent } from './apertura-kardex/apertura-kardex.component';
import { AsignacionKardexComponent } from './asignacion-kardex/asignacion-kardex.component';
import { ConsultaKardexComponent } from './consulta-kardex/consulta-kardex.component';

@NgModule({
  declarations: [
    BodegaConsumoComponent,
    AgregarElementosComponent,
    FormElementosSeleccionadosComponent,
    KardexComponent,
    ConsultaSolicitudComponent,
    DetalleSolicitudComponent,
    BodegaSinAsignarComponent,
    RelacionCatalogoComponent,
    AperturaKardexComponent,
    AsignacionKardexComponent,
    ConsultaKardexComponent,
    CurrencyCustomPipe,
  ],
  imports: [
    TranslateModule,
    NgxCurrencyModule,
    CommonModule,
    BodegaConsumoRoutingModule,
    ThemeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    Ng2SmartTableModule,
    TableModule,
  ],
})
export class BodegaConsumoModule { }
