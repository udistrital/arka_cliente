import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { CatalogoBienesRoutingModule, routedComponents } from './catalogo-bienes-routing.module';
import { CatalogoBienesComponent } from './catalogo-bienes.component';
import { ConsultaCatalogoComponent } from './consulta-catalogo/consulta-catalogo.component';
import { NbTreeGridModule } from '@nebular/theme';
import { ArbolComponent } from './arbol/arbol.component';
import { TreeModule } from 'angular-tree-component';
import { RegistroCatalogoComponent } from './registro-catalogo/registro-catalogo.component';
import { ToasterModule } from 'angular2-toaster';
import { CrudGrupoComponent } from './crud-grupo/crud-grupo.component';
import { CrudSubgrupoComponent } from './crud-subgrupo/crud-subgrupo.component';
import { RegistroElementosComponent } from './registro-elementos/registro-elementos.component';
import { RegistroCuentasCatalogoComponent } from './registro-cuentas-catalogo/registro-cuentas-catalogo.component';
import { CrudMovimientoComponent } from './crud-movimientos/crud-movimiento.component';

@NgModule({
  declarations: [
    CatalogoBienesComponent,
    ConsultaCatalogoComponent,
    ArbolComponent,
    RegistroCatalogoComponent,
    CrudGrupoComponent,
    CrudSubgrupoComponent,
    RegistroElementosComponent,
    CrudMovimientoComponent,
    RegistroCuentasCatalogoComponent,
  ],
  imports: [
    CommonModule,
    ToasterModule,
    CatalogoBienesRoutingModule,
    NbTreeGridModule,
    ThemeModule,
  ],
  exports: [
    ConsultaCatalogoComponent,
  ],
})
export class CatalogoBienesModule { }
