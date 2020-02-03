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
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSolicitudes() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('movimiento?query=FormatoTipoMovimientoId.CodigoAbreviacion__contains:SOL').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
    /**
    * Entrada Post
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response suceed, it returns the data of the updated object.
    * @param entradaData object to save in the DB
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public postSolicitud(salidasData) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.post(`movimiento`, salidasData).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo registrar la entrada solicitada.');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getAperturasKardex() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bodega_consumo/aperturas_kardex').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getFormatosKardex() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('formato_tipo_movimiento?query=CodigoAbreviacion__contains:KDX').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getEstadosMovimiento() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('estado_movimiento').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
    /**
    * Entrada Post
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response suceed, it returns the data of the updated object.
    * @param entradaData object to save in the DB
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public postMovimientoKardex(salidasData) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.post(`tr_kardex`, salidasData).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo registrar la entrada solicitada.');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
    * Entrada Post
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response suceed, it returns the data of the updated object.
    * @param entradaData object to save in the DB
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public postResponderSolicitud(salidasData) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.post(`tr_kardex/responder_solicitud`, salidasData).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo registrar la entrada solicitada.');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getElementosKardex(id) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('elementos_movimiento?query=ElementoCatalogoId:' + id +
            '&limit=-1&sortby=FechaCreacion&order=asc').pipe(
                map(
                    (res) => {
                        if (res === 'error') {
                            this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                            return undefined;
                        }
                        return res;
                    },
                ),
            );
    }
    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getExistenciasKardex() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bodega_consumo/existencias_kardex').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * SolicitudesBodega Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSolicitudesBodega() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('movimiento/?query=FormatoTipoMovimientoId__Id:8,Activo:true').pipe(
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

    /**
     * SolicitudesBodega Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSolicitudesBodegaPendiente() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('movimiento/?query=FormatoTipoMovimientoId__Id:8,EstadoMovimientoId.Id:5,Activo:true').pipe(
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
        return this.rqManager.get('/bodega_consumo/solicitud/' + id).pipe(
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
        return this.rqManager.get('elementos_movimiento/?query=Id:' + id).pipe(
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
    /**
    * Entrada Post
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response suceed, it returns the data of the updated object.
    * @param entradaData object to save in the DB
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
   public postRechazarSolicitud(salidasData) {
    this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
    return this.rqManager.post(`tr_kardex/rechazar_solicitud`, salidasData).pipe(
        map(
            (res) => {
                if (res['Type'] === 'error') {
                    this.pUpManager.showErrorAlert('No se pudo registrar la entrada solicitada.');
                    return undefined;
                }
                return res;
            },
        ),
    );
}

}
