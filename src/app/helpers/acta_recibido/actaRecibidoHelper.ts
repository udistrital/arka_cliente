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
     * Actas de Recibido Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getActasRecibido() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('acta_recibido/get_actas_recibido_tipo/5').pipe(
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
     * Actas de Recibido Activas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getActasRecibido2() {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('historico_acta?query=Activo:true&limit=-1').pipe(
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
     * Actas de Recibido Activas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getActasRecibido3() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('acta_recibido/get_all_actas/').pipe(
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
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get(
            'acta_recibido/get_elementos_acta/' + actaId).pipe(
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
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('acta_recibido/get_soportes_acta/' + actaId).pipe(
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
        return this.rqManager.get('tipo_bien?limit=-1').pipe(
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
     * Estados Elemento Acta Get
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
     * Elementos Transaccion Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTransaccionActa(actaId) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('transaccion_acta_recibido/' + actaId + '').pipe(
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
     * Transaccion Acta Post
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

    /**
     * Transaccion Acta Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public putTransaccionActa(Transaccion, Id) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.put2('transaccion_acta_recibido', Transaccion, Id).pipe(
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

    /**
     * Conversion Archivo Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postArchivo(Transaccion) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post2('acta_recibido', Transaccion).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los elementos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
/**
     * Unidades Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getUnidades() {
        this.rqManager.setPath('UNIDADES_SERVICE');
        return this.rqManager.get('unidad?limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar las unidades');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
    /**
     * Conversion Archivo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getParametros() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('acta_recibido').pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los parametros generales');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Conversion Archivo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getParametrosSoporte() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('parametros_soporte').pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los parametros generales');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Conversion Archivo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getProveedores() {
        this.rqManager.setPath('UNIDADES_SERVICE');
        return this.rqManager.get('informacion_proveedor?fields=Id,NumDocumento,NomProveedor&limit=-1').pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los parametros generales');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Conversion Archivo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getProveedor(idProveedor) {
        this.rqManager.setPath('UNIDADES_SERVICE');
        return this.rqManager.get('informacion_proveedor/' + idProveedor + '?fields=Id,NumDocumento,NomProveedor').pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los parametros generales');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Conversion Archivo Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postRelacionSedeDependencia(Transaccion) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post2('parametros_soporte/post_asignacion_espacio_fisico_dependencia', Transaccion).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los elementos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Conversion Archivo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSedeDependencia(id) {
        this.rqManager.setPath('OIKOS_SERVICE');
        return this.rqManager.get('asignacion_espacio_fisico_dependencia?query=Id:' + id).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los parametros generales');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
    /**
     * Elementos get
     * Conversion Archivo Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
   public getElemento(id) {
    this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
    return this.rqManager.get('elemento/' + id + '').pipe(
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
     * Elementos get
     * Conversion Archivo Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
   public getElementosByPlaca(placa) {
    this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
    return this.rqManager.get('elemento/?query=Placa__contains:' + placa + ',Activo:true&fields=Placa&limit=-1').pipe(
        map(
            (res) => {
                if (res === 'error') {
                    this.pUpManager.showErrorAlert('No se pudo consultar los el elemento de esta placa');
                    return undefined;
                }
                return res;
            },
        ),
    );
}

    /**
     * Elementos get
     * Conversion Archivo Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
   public getElementos(placa) {
    this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
    return this.rqManager.get('elemento/?query=Placa__contains:' + placa + ',Activo:true&fields=Placa&limit=-1').pipe(
        map(
            (res) => {
                if (res === 'error') {
                    this.pUpManager.showErrorAlert('No se pudo consultar los el elemento de esta placa');
                    return undefined;
                }
                return res;
            },
        ),
    );
}


}
