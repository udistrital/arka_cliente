import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BajasRoutingModule } from './bajas-routing.module';
import { ConsultaBajasComponent } from './consulta-bajas/consulta-bajas.component';
import { BajasComponent } from './bajas.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2CompleterModule } from 'ng2-completer';
import { rootReducer } from '../../@core/store/rootReducer';
import { StoreModule } from '@ngrx/store';
import { ListService } from '../../@core/store/services/list.service';
import { ThemeModule } from '../../@theme/theme.module';
import { FormSolicitudComponent } from './form-solicitud/form-solicitud.component';
import { CrudBajasComponent } from './crud-bajas/crud-bajas.component';
import { FormResolucionComponent } from './form-resolucion/form-resolucion.component';


@NgModule({
  declarations: [
    BajasComponent,
    ConsultaBajasComponent,
    FormSolicitudComponent,
    CrudBajasComponent,
    FormResolucionComponent,
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
