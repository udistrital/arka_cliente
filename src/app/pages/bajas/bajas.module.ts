import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BajasRoutingModule } from './bajas-routing.module';
import { BajasComponent } from './bajas.component';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { TranslateModule } from '@ngx-translate/core';
import { Ng2CompleterModule } from 'ng2-completer';
import { rootReducer } from '../../@core/store/rootReducer';
import { StoreModule } from '@ngrx/store';
import { ListService } from '../../@core/store/services/list.service';
import { ThemeModule } from '../../@theme/theme.module';
import { FormSolicitudComponent } from './form-solicitud/form-solicitud.component';


@NgModule({
  declarations: [
    BajasComponent,
    FormSolicitudComponent,
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
