import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';

import { CatalogoBienesRoutingModule, routedComponents } from './catalogo-bienes-routing.module';
import { CatalogoBienesComponent } from './catalogo-bienes.component';
import { ConsultaCatalogoComponent } from './consulta-catalogo/consulta-catalogo.component';
import { NbTreeGridModule } from '@nebular/theme';
import { ArbolComponent, FsIconAComponent } from './arbol/arbol.component';
import { TreeModule } from 'angular-tree-component';
import { RegistroCatalogoComponent } from './registro-catalogo/registro-catalogo.component';
import { ToasterModule } from 'angular2-toaster';
import { CrudGrupoComponent } from './crud-grupo/crud-grupo.component';
import { CrudSubgrupo1Component } from './crud-subgrupo_1/crud-subgrupo_1.component';
import { RegistroElementosComponent } from './registro-elementos/registro-elementos.component';
import { InactivarGrupoComponent } from './inactivar-grupo/inactivar-grupo.component';
import { RegistroCuentasCatalogoComponent } from './registro-cuentas-catalogo/registro-cuentas-catalogo.component';
import { CrudMovimientoComponent } from './crud-movimientos/crud-movimiento.component';


@NgModule({
  declarations: [
    CatalogoBienesComponent,
    ConsultaCatalogoComponent,
    ArbolComponent,
    FsIconAComponent,
    RegistroCatalogoComponent,
    CrudGrupoComponent,
    CrudSubgrupo1Component,
    RegistroElementosComponent,
    InactivarGrupoComponent,
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
