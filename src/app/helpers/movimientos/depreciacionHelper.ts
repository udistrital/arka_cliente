import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Movimiento } from '../../@core/data/models/entrada/entrada';

@Injectable({
    providedIn: 'root',
})
export class DepreciacionHelper {

    constructor(
        private rqManager: RequestManager,
        private translate: TranslateService,
        private pUpManager: PopUpManager) { }
    /**
    * Hace el post de una depreciación a través el api arka_mid
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response is successs, it returns the object's data.
    * @param movimiento detalle del traslado
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */

    public postSolicitud(movimiento: any) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post('depreciacion/', movimiento).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registro.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Trae las depreciaciones, según se solicite, en cualquier estado o en trámite
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param tramiteOnly Indica si se traen únicamente los traslados pendientes por ser revisados
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getDepreciaciones(tramiteOnly: boolean) {
        let endpoint = 'movimiento?query=FormatoTipoMovimientoId__Nombre:Depreciación';
        endpoint += tramiteOnly ? ',EstadoMovimientoId__Nombre:Depr Generada' : '';
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get(endpoint).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registro.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Consulta una depreciación
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param tramiteOnly Indica si se traen únicamente los traslados pendientes por ser revisados
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getDepreciacion(movimientoId: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('depreciacion/' + movimientoId).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registro.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Registra la aprobación de la depreciación
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public putAprobacion(movimientoId: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.put2('depreciacion', {}, movimientoId).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.consulta.errorElementos'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
}
