import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { EspacioFisico } from '../../@core/data/models/ubicacion/espacio_fisico';

@Injectable({
    providedIn: 'root',
})
export class ActaRecibidoHelper {

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
    ) {}

        public sendCorreo(elemento) {
            this.rqManager.setPath('GOOGLE_SERVICE');
            return this.rqManager.post('notificacion', elemento).pipe(
                map(
                    (res) => {
                        if (res['Type'] === 'error') {
                            this.pUpManager.showErrorAlert('No se pudo enviar correo');
                            return undefined;
                        }
                        return res;
                    },
                ),
            );
        }

        public getEmailTercero(id: any) {
            this.rqManager.setPath('TERCEROS_SERVICE');
            return this.rqManager.get('info_complementaria_tercero', {query: `TerceroId__Id:${id},Activo:true,info_complementaria_id:53`}).pipe(
                map(
                    (res) => {
                        if (res === 'error') {
                            this.pUpManager.showErrorAlert('No se pudo consultar el email del tercero');
                            return undefined;
                        }
                        return res;
                    },
                ),
            );
        }

        public getIdDelTercero(documento: any) {
            this.rqManager.setPath('TERCEROS_SERVICE');
            return this.rqManager.get('datos_identificacion', {query: `numero:${documento},Activo:true`}).pipe(
                map(
                    (res) => {
                        if (res === 'error') {
                            this.pUpManager.showErrorAlert('No se pudo consultar el email del tercero');
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
    public getActasRecibido(usuario: string = '', estados: string[] = []) {
        const DIVISOR_ESTADOS = ',';
        let params = {};
        if (usuario.length) {
            params = {...params, u: usuario};
        }
        if (estados.length) {
            params = {...params, states: estados.join(DIVISOR_ESTADOS)};
        }
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get(`acta_recibido/get_all_actas`, params).pipe(
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

    public getActasRecibidoUsuario(usuario: string) {
        return this.getActasRecibido(usuario);
    }

    public getAllActasRecibidoByEstado(estados: [string]) {
        return this.getActasRecibido('', estados);
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
     * Elementos Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getElementosActaMov(actaId) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get(
            'ajustes/automatico/elementos/' + actaId).pipe(
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
     * Elementos Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postAjusteAutomatico(elementos: any) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post('ajustes/automatico/', elementos).pipe(
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
     * Soportes Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSoporte(actaId) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('soporte_acta', {query: `Activo:True,ActaRecibidoId__Id:${actaId}`}).pipe(
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
        return this.rqManager.get('tipo_bien', {limit: -1}).pipe(
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
     * Elementos Transaccion Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTransaccionActa(actaId, elementos) {
        const query = !elementos ? {elementos: false} : {};
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('transaccion_acta_recibido/' + actaId, query).pipe(
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
        if (id > 0) {
            return this.rqManager.get('asignacion_espacio_fisico_dependencia', {query: `Id:${id}`}).pipe(
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

        } else {
            return of(new EspacioFisico()).pipe(map(o => JSON.stringify(o)));
        }
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
    return this.rqManager.get('elemento', {query: `Placa__contains:${placa},Activo:true`, fields: 'Id,Placa', limit: -1}).pipe(
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
