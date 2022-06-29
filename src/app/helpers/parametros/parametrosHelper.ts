import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

const MVTO_DB = 344;
const MVTO_CR = 345;

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
        return MVTO_CR;
    }

    /**
     * Trae el id del parámetro para un movimiento Débito
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getParametroDebito() {
        return MVTO_DB;
    }
}
