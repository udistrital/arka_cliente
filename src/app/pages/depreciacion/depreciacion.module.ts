import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepreciacionRoutingModule } from './depreciacion-routing.module';
import { ConsultaDepreciacionComponent } from './consulta-depreciacion/consulta-depreciacion.component';
import { DepreciacionComponent } from './depreciacion.component';
import { Ng2SmartTableModule } from 'ngx-smart-table';
import { MatPaginatorModule, MatSortModule, MatTableModule } from '@angular/material';
import { ThemeModule } from '../../@theme/theme.module';
import { GenerarDepreciacionComponent } from './generar-depreciacion/generar-depreciacion.component';
import { EntradasModule } from '../entradas/entradas.module';

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
    EntradasModule,
  ],
})
export class DepreciacionModule { }
