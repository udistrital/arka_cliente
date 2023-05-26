import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class ActaRecibidoCrud {

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
        private translate: TranslateService,
    ) { }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getAllElemento(payload: string) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('elemento?' + payload).pipe(
            map(
                (res) => {
                    if (res.Message) {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.consultar.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

}
