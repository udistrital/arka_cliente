import { Subgrupo2RoutingModule, routedComponents } from './subgrupo_2-routing.module';
import { NgModule } from '@angular/core';
import { ThemeModule } from '../../@theme/theme.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ToasterModule } from 'angular2-toaster';
import { SharedModule } from '../shared/shared.module';
import { CrudSubgrupo2Component } from './crud-subgrupo_2/crud-subgrupo_2.component';
import { ToasterService} from 'angular2-toaster';
import { CatalogoElementosHelper } from '../../helpers/catalogo-elementos/catalogoElementosHelper';

@NgModule({
  imports: [
    ThemeModule,
    Subgrupo2RoutingModule,
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
    CrudSubgrupo2Component,
  ],
})
export class Subgrupo2Module { }
