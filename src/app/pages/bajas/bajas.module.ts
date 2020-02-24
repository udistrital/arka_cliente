import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BajasRoutingModule } from './bajas-routing.module';
import { SolicitudBajasComponent } from './solicitud-bajas/solicitud-bajas.component';
import { ConsultaBajasComponent } from './consulta-bajas/consulta-bajas.component';
import { AprobacionBajasComponent } from './aprobacion-bajas/aprobacion-bajas.component';
import { ConsultaSolicitudBajasComponent } from './consulta-solicitud-bajas/consulta-solicitud-bajas.component';
import { BajasComponent } from './bajas.component';

@NgModule({
  declarations: [BajasComponent, SolicitudBajasComponent, ConsultaBajasComponent, AprobacionBajasComponent, ConsultaSolicitudBajasComponent],
  imports: [
    CommonModule,
    BajasRoutingModule
  ]
})
export class BajasModule { }
