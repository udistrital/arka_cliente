import { NgModule } from '@angular/core';
import { MatDatepickerModule, MatTreeModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { NbTreeGridModule } from '@nebular/theme';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { TreeModule } from 'angular-tree-component';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { ThemeModule } from '../../@theme/theme.module';
import { CatalogoElementosHelper } from '../../helpers/catalogo-elementos/catalogoElementosHelper';
import { ArbolComponent } from './arbol/arbol.component';
import { CatalogoRoutingModule, routedComponents } from './catalogo-routing.module';
import { CatalogoComponent } from './catalogo.component';
import { ConsultaCatalogoComponent } from './consulta-catalogo/consulta-catalogo.component';
import { CrudGrupoComponent } from './crud-grupo/crud-grupo.component';
import { CrudCuentasComponent } from './crud-cuentas/crud-cuentas.component';
import { CrudSubgrupoComponent } from './crud-subgrupo/crud-subgrupo.component';
import { FormCuentasComponent } from './form-cuentas/form-cuentas.component';
import { RegistroCatalogoComponent } from './registro-catalogo/registro-catalogo.component';
import { RegistroElementosComponent } from './registro-elementos/registro-elementos.component';
import { TiposBienComponent } from './tipos-bien/tipos-bien.component';
import { CrudCatalogoComponent } from './crud-catalogo/crud-catalogo.component';
import { FormTipoBienComponent } from './form-tipo-bien/form-tipo-bien.component';

@NgModule({
  imports: [
    CatalogoRoutingModule,
    CommonModule,
    MatDatepickerModule,
    MatTreeModule,
    NbTreeGridModule,
    Ng2SmartTableModule,
    ThemeModule,
    ToasterModule,
  ],
  declarations: [
    ArbolComponent,
    CatalogoComponent,
    ConsultaCatalogoComponent,
    CrudCuentasComponent,
    CrudGrupoComponent,
    CrudSubgrupoComponent,
    FormCuentasComponent,
    RegistroCatalogoComponent,
    RegistroElementosComponent,
    TiposBienComponent,
    ...routedComponents,
    FormTipoBienComponent,
  ],
  providers: [
    CatalogoElementosHelper,
    ToasterService,
  ],
  exports: [
    CrudCatalogoComponent,
    ConsultaCatalogoComponent,
  ],
})
export class CatalogoModule { }
