import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable({
    providedIn: 'root',
})
export class EntradaHelper {

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager) { }

    /**
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getContratos(tipo, vigencia) {
        this.rqManager.setPath('ADMINISTRATIVA_SERVICE');
        return this.rqManager.get('contratos_suscritos/' + tipo + '/' + vigencia).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getContrato(contrato, vigencia) {
        this.rqManager.setPath('ADMINISTRATIVA_SERVICE');
        return this.rqManager.get('informacion_contrato/' + contrato + '/' + vigencia).pipe(
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
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSolicitantes(vigencia) {
        this.rqManager.setPath('ADMINISTRATIVA_SERVICE');
        return this.rqManager.get('lista_ordenadores/' + vigencia + '/' + vigencia).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los ordenadores');
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
    public postEntrada(entradaData) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post(`entrada/`, entradaData).pipe(
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
    // SE DEBE IR
    public postSoporteEntrada(entradaData) {
        this.rqManager.setPath('ENTRADAS_SERVICE');
        return this.rqManager.post(`soporte_entrada/`, entradaData).pipe(
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
    public getEntradas() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('entrada').pipe(
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
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getEntrada(consecutivo) {
        this.rqManager.setPath('ARKA_SERVICE');
        // return this.rqManager.get('entrada_elemento?query=Consecutivo:' + consecutivo).pipe(
        return this.rqManager.get('entrada/' + consecutivo).pipe(
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
    public getSoportes(entradaId) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('soporte_movimiento?query=MovimientoId.Id:' + entradaId + '&limit=-1').pipe(
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
    public getTipoEntradaByAcronimo(acronimo) {
        this.rqManager.setPath('MOVIMIENTOS_KRONOS_SERVICE');
        return this.rqManager.get('tipo_movimiento?query=Acronimo:' + acronimo + '&limit=-1').pipe(
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
    public getTipoEntradaByAcronimoAndNombre(acronimo, nombre) {
        this.rqManager.setPath('MOVIMIENTOS_KRONOS_SERVICE');
        return this.rqManager.get('tipo_movimiento?query=Acronimo:' + acronimo + ',Nombre:' + nombre).pipe(
            map(
                (res) => {
                    if (res === 'error' || !Array.isArray(res) || res.length === 0) {
                        this.pUpManager.showErrorAlert('Tipo de entrada no registrado en Kronos');
                        return undefined;
                    }
                    return res[0];
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
    public getFormatoEntradaByName(nombre) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('formato_tipo_movimiento?query=Nombre:' + nombre + '&limit=-1').pipe(
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
    public getEncargadoElementoByPlaca(placa) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('entrada/encargado/' + placa ).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el encargado del elemento');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * EntradaByActa Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getEntradaByActa(acta_recibido_id) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('movimiento/entrada/' + acta_recibido_id).pipe(
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

    public getFormatosTipoMovimiento(){
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('formato_tipo_movimiento?limit=-1').pipe(
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

}
