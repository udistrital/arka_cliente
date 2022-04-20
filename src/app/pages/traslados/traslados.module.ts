import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrasladosRoutingModule } from './traslados-routing.module';
import { TrasladosComponent } from './traslados.component';
import { ThemeModule } from '../../@theme/theme.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatSortModule } from '@angular/material';
import { FormTrasladoComponent } from './form-traslado/form-traslado.component';
import { ConsultaTrasladosComponent } from './consulta-traslados/consulta-traslados.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { CrudTrasladoComponent } from './crud-traslado/crud-traslado.component';
import { AjustesModule } from '../ajustes/ajustes.module';


@NgModule({
  declarations: [
    TrasladosComponent,
    FormTrasladoComponent,
    ConsultaTrasladosComponent,
    CrudTrasladoComponent,
  ],
  imports: [
    CommonModule,
    ThemeModule,
    TrasladosRoutingModule,
    MatTabsModule,
    MatStepperModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    Ng2SmartTableModule,
    AjustesModule,
  ],
})
export class TrasladosModule { }
