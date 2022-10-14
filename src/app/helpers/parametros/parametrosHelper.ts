import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class ParametrosHelper {

    constructor(
        private rqManager: RequestManager,
        private translate: TranslateService,
        private pUpManager: PopUpManager) { }

    /**
     * Trae el id del parámetro para un movimiento Crédito
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getParametroCredito() {
        return 345;
    }

    /**
     * Trae el id del parámetro para un movimiento Débito
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getParametroDebito() {
        return 344;
    }

    public getAllParametroPeriodo(payload: string) {
        this.rqManager.setPath('PARAMETROS_SERVICE');
        return this.rqManager.get('parametro_periodo?' + payload).pipe(
                map(
                    (res) => {
                        if (res === 'error') {
                            this.pUpManager.showErrorAlert('No se pudo consultar los parámetros');
                            return undefined;
                        }
                        return res;
                    },
                ),
            );
    }

}
