import { CatalogoRoutingModule, routedComponents } from './catalogo-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../shared/shared.module';
import { CrudCatalogoComponent } from './crud-catalogo/crud-catalogo.component';
import { ToasterService} from 'angular2-toaster';
import { CatalogoElementosHelper } from '../../helpers/catalogo-elementos/catalogoElementosHelper';
import { MatDatepickerModule } from '@angular/material';

@NgModule({
  imports: [
    ThemeModule,
    CatalogoRoutingModule,
    Ng2SmartTableModule,
    MatDatepickerModule,
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
    CrudCatalogoComponent,
  ],
})
export class CatalogoModule { }
