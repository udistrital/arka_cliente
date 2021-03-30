import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Parametro } from './models/configuracion_crud';
import { ConfiguracionService } from './configuracion.service';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable({
  providedIn: 'root',
})
export class DisponibilidadMovimientosService {

  constructor(
    private confService: ConfiguracionService,
    private pUpManager: PopUpManager,
  ) {
  }

  movimientosPermitidos(): Observable<boolean> {
    return this.confService.getParametro('modificandoCuentas').pipe(map((res: Parametro) => {
      if (res.Valor === 'false') {
        return true;
      } else {
        this.pUpManager.showErrorAlert('Cuentas en Modificación. Intente más tarde');
        return false;
      }
    }));
  }
}
