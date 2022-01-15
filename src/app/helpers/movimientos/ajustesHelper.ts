import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class AjustesHelper {

    constructor(
        private rqManager: RequestManager,
        private translate: TranslateService,
        private pUpManager: PopUpManager) { }
    /**
    * Hace el post de un ajuste a través el api arka_mid
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response is successs, it returns the object's data.
    * @param movimiento detalle del ajuste
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */

    public postAjuste(movimiento: any) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post('ajustes/', movimiento).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.ajustes.create.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Trae los ajustes, según se solicite, en cualquier estado o por aprobar
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param tramiteOnly Indica si se traen únicamente los ajustes pendientes por ser revisados
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getAll(tramiteOnly: boolean, rol: string) {
        let endpoint = 'movimiento?limit=-1&sortby=FechaCreacion&order=desc&query=FormatoTipoMovimientoId__Nombre:Ajuste Contable';
        endpoint += tramiteOnly ? ',EstadoMovimientoId__Nombre__in:Ajuste En Trámite|Ajuste Aprobado por ' + rol : '';
        // console.log(endpoint);
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get(endpoint).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.ajustes.consulta.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Trae el detalle de un ajuste
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param movimientoId MovimientoId del ajuste
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getOne(movimientoId: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('ajustes/' + movimientoId).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.ajustes.consulta.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Registra la aprobación del ajuste
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public putAjuste(movimientoId: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.put2('ajustes', {}, movimientoId).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.ajustes.revision.errorAprobar'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

}
