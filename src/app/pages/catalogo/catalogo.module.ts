import { NgModule } from '@angular/core';
import { MatDatepickerModule } from '@angular/material';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { ThemeModule } from '../../@theme/theme.module';
import { CatalogoElementosHelper } from '../../helpers/catalogo-elementos/catalogoElementosHelper';
import { CatalogoBienesModule } from '../catalogo-bienes/catalogo-bienes.module';
import { CatalogoRoutingModule, routedComponents } from './catalogo-routing.module';
import { CrudCatalogoComponent } from './crud-catalogo/crud-catalogo.component';

@NgModule({
  imports: [
    CatalogoBienesModule,
    CatalogoRoutingModule,
    MatDatepickerModule,
    Ng2SmartTableModule,
    ThemeModule,
    ToasterModule,
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
