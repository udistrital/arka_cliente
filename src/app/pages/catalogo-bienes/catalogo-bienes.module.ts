import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbTreeGridModule } from '@nebular/theme';
import { TreeModule } from 'angular-tree-component';
import { ToasterModule } from 'angular2-toaster';
import { MatTreeModule } from '@angular/material';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { ThemeModule } from '../../@theme/theme.module';
import { ArbolComponent } from './arbol/arbol.component';
import { CatalogoBienesRoutingModule, routedComponents } from './catalogo-bienes-routing.module';
import { CatalogoBienesComponent } from './catalogo-bienes.component';
import { ConsultaCatalogoComponent } from './consulta-catalogo/consulta-catalogo.component';
import { CrudGrupoComponent } from './crud-grupo/crud-grupo.component';
import { CrudCuentasComponent } from './crud-cuentas/crud-cuentas.component';
import { CrudSubgrupoComponent } from './crud-subgrupo/crud-subgrupo.component';
import { FormCuentasComponent } from './form-cuentas/form-cuentas.component';
import { RegistroCatalogoComponent } from './registro-catalogo/registro-catalogo.component';
import { RegistroElementosComponent } from './registro-elementos/registro-elementos.component';
import { TiposBienComponent } from './tipos-bien/tipos-bien.component';
import { RegistroTipoBienComponent } from './tipos-bien/registro-tipo-bien/registro-tipo-bien.component';

@NgModule({
  declarations: [
    ArbolComponent,
    CatalogoBienesComponent,
    ConsultaCatalogoComponent,
    CrudCuentasComponent,
    CrudGrupoComponent,
    CrudSubgrupoComponent,
    FormCuentasComponent,
    RegistroCatalogoComponent,
    RegistroElementosComponent,
    RegistroTipoBienComponent,
    TiposBienComponent,
  ],
  imports: [
    CommonModule,
    CatalogoBienesRoutingModule,
    ToasterModule,
    ThemeModule,
    MatTreeModule,
    Ng2SmartTableModule,
    NbTreeGridModule,
  ],
  exports: [
    ConsultaCatalogoComponent,
  ],
})
export class CatalogoBienesModule { }
