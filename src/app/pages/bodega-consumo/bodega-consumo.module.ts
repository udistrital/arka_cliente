import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BodegaConsumoRoutingModule } from './bodega-consumo-routing.module';
import { BodegaConsumoComponent } from './bodega-consumo.component';
import { AgregarElementosComponent } from './agregar-elementos/agregar-elementos.component';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormElementosSeleccionadosComponent } from './form-elementos-seleccionados/form-elementos-seleccionados.component';
import { KardexComponent, CurrencyCustomPipe } from './kardex/kardex.component';
import { TableModule } from 'primeng/table';
import { ConsultaSolicitudComponent } from './consulta-solicitud/consulta-solicitud.component';
import { DetalleSolicitudComponent } from './detalle-solicitud/detalle-solicitud.component';
import { BodegaSinAsignarComponent } from './bodega-sin-asignar/bodega-sin-asignar.component';
import { RelacionCatalogoComponent } from './relacion-catalogo/relacion-catalogo.component';
import { AperturaKardexComponent } from './apertura-kardex/apertura-kardex.component';
import { AsignacionKardexComponent } from './asignacion-kardex/asignacion-kardex.component';
import { ConsultaKardexComponent } from './consulta-kardex/consulta-kardex.component';
import { EntradaKardexComponent } from './entrada-kardex/entrada-kardex.component';
import { AjustarCantidadComponent } from './ajustar-cantidad/ajustar-cantidad.component';

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
    EntradaKardexComponent,
    AjustarCantidadComponent,
  ],
  imports: [
    TranslateModule,
    CommonModule,
    BodegaConsumoRoutingModule,
    ThemeModule,
    Ng2SmartTableModule,
    TableModule,
  ],
  entryComponents: [
    AjustarCantidadComponent,
  ],
})
export class BodegaConsumoModule { }
