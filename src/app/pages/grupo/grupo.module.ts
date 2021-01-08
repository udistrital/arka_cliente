import { GrupoRoutingModule, routedComponents } from './grupo-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../shared/shared.module';
import { CrudGrupoComponent } from './crud-grupo/crud-grupo.component';
import { ToasterService} from 'angular2-toaster';
import { CatalogoElementosHelper } from '../../helpers/catalogo-elementos/catalogoElementosHelper';

@NgModule({
  imports: [
    ThemeModule,
    GrupoRoutingModule,
    Ng2SmartTableModule,
    ToasterModule,
    SharedModule,
  ],
  declarations: [
    ...routedComponents,
  ],
  providers: [
    CatalogoElementosHelper,
    ToasterService,
  ],
  exports: [
    CrudGrupoComponent,
  ],
})
export class GrupoModule { }
