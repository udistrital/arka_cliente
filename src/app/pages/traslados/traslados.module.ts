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


@NgModule({
  declarations: [
    TrasladosComponent,
    FormTrasladoComponent,
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
  ],
})
export class TrasladosModule { }
