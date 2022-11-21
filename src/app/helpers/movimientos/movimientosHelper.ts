import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class MovimientosHelper {

    constructor(
        private rqManager: RequestManager,
        private translate: TranslateService,
        private pUpManager: PopUpManager) { }

    /**
      * Trae el estado movimiento según el nombre
      * If the response has errors in the OAS API it should show a popup message with an error.
      * If the response is successs, it returns the object's data.
      * @param nombre nombre del estado
      * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
      */
    public getEstadoByNombre(text: string) {
        const query = 'estado_movimiento?query=Nombre:' + text;
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get(query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_dependencias'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Trae el formato movimiento según el nombre
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param nombre nombre del formato
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getFormatoByNombre(text: string) {
        const query = 'formato_tipo_movimiento?query=Nombre:' + text;
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get(query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_dependencias'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

   /**
     * Trae el formato movimiento según el nombre
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param query nombre del formato
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getAllFormatoMovimiento(query: string) {
        query = 'formato_tipo_movimiento?' + query;
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get(query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_dependencias'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public getElementosMovimientoById(id: number) {
        const query = 'elementos_movimiento?query=MovimientoId.Id:' + id;
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get(query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_dependencias'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    // Consulta de historial del elemento sin incluir el detalle de cada movimiento
    public getHistorialElemento(id: number, acta: boolean, final: boolean, entradas: boolean) {
        const payload = id + '?acta=' + acta + '&final=' + final + '&entradas=' + entradas;
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('elementos_movimiento/historial/' + payload).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.errorHistorialElemento'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

}
