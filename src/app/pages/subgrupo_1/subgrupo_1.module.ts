import { Subgrupo1RoutingModule, routedComponents } from './subgrupo_1-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../shared/shared.module';
import { CrudSubgrupo1Component } from './crud-subgrupo_1/crud-subgrupo_1.component';
import { ToasterService} from 'angular2-toaster';
import { CatalogoElementosHelper } from '../../helpers/catalogo-elementos/catalogoElementosHelper';

@NgModule({
  imports: [
    ThemeModule,
    Subgrupo1RoutingModule,
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
    CrudSubgrupo1Component,
  ],
})
export class Subgrupo1Module { }
