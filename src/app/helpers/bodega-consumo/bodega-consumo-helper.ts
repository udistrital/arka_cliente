import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable({
    providedIn: 'root',
})
export class BodegaConsumoHelper {

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager) { }

    /**
     * SolicitudesBodega Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSolicitudesBodega() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('movimiento/?query=FormatoTipoMovimientoId__Id:8').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar las solicitudes');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public getSolicitudBodega(id: string) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('/bodega_consumo/solicitud/'+ id).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar la solicitud');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
// Elementos de bodega --actualmente no se ha definido y los traigo de movimientos.elementos
    public getElementos(id: string) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('elementos_movimiento/?query=Id:'+ id).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar la solicitud');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    

}
