import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BajasRoutingModule } from './bajas-routing.module';
import { SolicitudBajasComponent } from './solicitud-bajas/solicitud-bajas.component';
import { ConsultaBajasComponent } from './consulta-bajas/consulta-bajas.component';
import { AprobacionBajasComponent } from './aprobacion-bajas/aprobacion-bajas.component';
import { ConsultaSolicitudBajasComponent } from './consulta-solicitud-bajas/consulta-solicitud-bajas.component';
import { BajasComponent } from './bajas.component';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2CompleterModule } from 'ng2-completer';
import { rootReducer } from '../../@core/store/rootReducer';
import { StoreModule } from '@ngrx/store';
import { ListService } from '../../@core/store/services/list.service';
import { ThemeModule } from '../../@theme/theme.module';
import { FormElementosSeleccionadosComponent } from './form-elementos-seleccionados/form-elementos-seleccionados.component';
import { TablaElementosAgregadosComponent } from './tabla-elementos-agregados/tabla-elementos-agregados.component';
import { FormFuncionarioSolicitudComponent } from './form-funcionario-solicitud/form-funcionario-solicitud.component';
import { DetalleSolicitudComponent } from './detalle-solicitud/detalle-solicitud.component';


@NgModule({
  declarations: [
    BajasComponent,
    SolicitudBajasComponent,
    ConsultaBajasComponent,
    AprobacionBajasComponent,
    ConsultaSolicitudBajasComponent,
    FormElementosSeleccionadosComponent,
    TablaElementosAgregadosComponent,
    FormFuncionarioSolicitudComponent,
    DetalleSolicitudComponent,
  ],
  imports: [
    CommonModule,
    BajasRoutingModule,
    Ng2SmartTableModule,
    StoreModule.forRoot(rootReducer),
    TranslateModule,
    Ng2CompleterModule,
    ThemeModule,
  ],
  providers: [
    ListService,
  ],
})
export class BajasModule { }
