import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TransaccionActaRecibido } from '../../@core/data/models/acta_recibido/transaccion_acta_recibido';

@Injectable({
    providedIn: 'root',
})
export class ActaRecibidoHelper {

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager) { }

    /**
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getActasRecibido() {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('historico_acta?query=EstadoActaId.Nombre:Aceptada,ActaRecibidoId.Activo:True').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar las actas de recibido');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Elementos Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getElementosActa(actaId) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('elemento?query=SoporteActaId.ActaRecibidoId.Id:' + actaId + ',SoporteActaId.ActaRecibidoId.Activo:True').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los elementos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Soportes Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSoporte(actaId) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('soporte_acta?query=ActaRecibidoId:' + actaId + ',ActaRecibidoId.Activo:True').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los elementos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Tipo de Bien Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTipoBien() {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('tipo_bien').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los tipos de bien');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Estados Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getEstadosActa() {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('estado_acta').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los estados de acta');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Estados Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getEstadosElemento() {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('estado_elemento').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los estados de acta');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
    /**
     * Estados Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTransaccionActa(ActaId) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('transaccion_acta_recibido/' + ActaId ).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el acta solicitada');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Estados Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postTransaccionActa(Transaccion) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.post('transaccion_acta_recibido', Transaccion).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el acta solicitada');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }


}
