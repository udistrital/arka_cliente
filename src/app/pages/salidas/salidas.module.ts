import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SalidasRoutingModule } from './salidas-routing.module';
import { SalidasComponent } from './salidas.component';
import { ThemeModule } from '../../@theme/theme.module';
import { ConsultaSalidasComponent } from './consulta-salidas/consulta-salidas.component';
import { RegistroSalidasComponent } from './registro-salidas/registro-salidas.component';
import { TablaEntradaAprobadaComponent } from './tabla-entrada-aprobada/tabla-entrada-aprobada.component';
import { FormElementosSeleccionadosComponent } from './form-elementos-seleccionados/form-elementos-seleccionados.component';
import { TablaElementosAsignadosComponent } from './tabla-elementos-asignados/tabla-elementos-asignados.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { TranslateModule } from '@ngx-translate/core';
import { NbStepperModule } from '@nebular/theme';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import { MatPaginatorModule, MatSortModule } from '@angular/material';
import { Ng2CompleterModule } from 'ng2-completer';
import { NgxCurrencyModule } from 'ngx-currency';
import { rootReducer } from '../../@core/store/rootReducer';
import { Store, StoreModule } from '@ngrx/store';
import { ListService } from '../../@core/store/services/list.service';
import { ConsultaSalidaEspecificaComponent } from './consulta-salida-especifica/consulta-salida-especifica.component';
import { EntradasModule} from './../entradas/entradas.module';
import { AjustesModule } from '../ajustes/ajustes.module';


@NgModule({
  declarations: [
    SalidasComponent,
    ConsultaSalidasComponent,
    RegistroSalidasComponent,
    TablaEntradaAprobadaComponent,
    FormElementosSeleccionadosComponent,
    TablaElementosAsignadosComponent,
    ConsultaSalidaEspecificaComponent,
  ],
  imports: [
    CommonModule,
    SalidasRoutingModule,
    ThemeModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    Ng2SmartTableModule,
    StoreModule.forRoot(rootReducer),
    NgxCurrencyModule,
    ThemeModule,
    Ng2SmartTableModule,
    TranslateModule,
    Ng2CompleterModule,
    NbStepperModule,
    MatTabsModule,
    MatStepperModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    EntradasModule,
    AjustesModule,
  ],
  providers: [
    CurrencyPipe,
    ListService,
  ],
})
export class SalidasModule { }
