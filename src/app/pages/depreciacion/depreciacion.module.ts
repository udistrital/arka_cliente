import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepreciacionRoutingModule } from './depreciacion-routing.module';
import { ConsultaDepreciacionComponent } from './consulta-depreciacion/consulta-depreciacion.component';
import { DepreciacionComponent } from './depreciacion.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ThemeModule } from '../../@theme/theme.module';
import { GenerarDepreciacionComponent } from './generar-depreciacion/generar-depreciacion.component';
import { AjustesModule } from '../ajustes/ajustes.module';

@NgModule({
  declarations: [
    ConsultaDepreciacionComponent,
    DepreciacionComponent,
    GenerarDepreciacionComponent,
  ],
  imports: [
    CommonModule,
    ThemeModule,
    DepreciacionRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    Ng2SmartTableModule,
    AjustesModule,
  ],
})
export class DepreciacionModule { }
