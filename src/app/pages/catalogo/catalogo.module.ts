import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { ThemeModule } from '../../@theme/theme.module';
import { CatalogoElementosHelper } from '../../helpers/catalogo-elementos/catalogoElementosHelper';
import { ArbolComponent } from './arbol/arbol.component';
import { CatalogoRoutingModule } from './catalogo-routing.module';
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
import { ListCatalogoComponent } from './list-catalogo/list-catalogo.component';

@NgModule({
  imports: [
    CatalogoRoutingModule,
    CommonModule,
    Ng2SmartTableModule,
    ThemeModule,
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
    ListCatalogoComponent,
    CrudCatalogoComponent,
    FormTipoBienComponent,
  ],
  providers: [
    CatalogoElementosHelper,
  ],
})
export class CatalogoModule { }
