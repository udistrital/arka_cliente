import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Parametro } from './models/configuracion_crud';
import { ConfiguracionService } from './configuracion.service';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable({
  providedIn: 'root',
})
export class DisponibilidadMovimientosService {

  constructor(
    private confService: ConfiguracionService,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
  }

  movimientosPermitidos(): Observable<boolean> {
    return this.confService.getParametro('modificandoCuentas').pipe(map((res: Parametro) => {
      if (res.Valor === 'false') {
        return true;
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.alerta_modificacion'));
        return false;
      }
    }));
  }
}
