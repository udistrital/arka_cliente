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

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager) { }


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
            return this.rqManager.get('info_complementaria_tercero/?query=TerceroId__Id:' + id + ',Activo:true,info_complementaria_id:53').pipe(
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
            return this.rqManager.get('datos_identificacion/?query=numero:' + documento + ',Activo:true').pipe(
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

    public getAllActasRecibido_(estado: string, tipo: string, unidadEjecutora: string, limit: number, offset: number) {
        const payload = (estado ? 'EstadoActaId=' + estado : '') + (tipo ? '&TipoActaId=' + tipo : '') +
            (unidadEjecutora ? '&UnidadEjecutoraId=' + unidadEjecutora : '');
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('acta_recibido/get_all_actas?' + payload + '&limit=' + limit + '&offset=' + offset).pipe(
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

    public getActasRecibidoUsuario(usuario: string, limit: number, offset: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('acta_recibido/get_all_actas?u=' + usuario + '&limit=' + limit + '&offset=' + offset).pipe(
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

    public getEndpointAllActas(user: string) {
        return this.rqManager.getPath('ARKA_SERVICE') + 'acta_recibido/get_all_actas?u=' + user;
    }

    public getAllActasRecibidoByEstado(estados: [string], limit: number, offset: number) {
        const querySt = estados.join();
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('acta_recibido/get_all_actas?EstadoActaId=' + querySt + '&limit=' + limit + '&offset=' + offset).pipe(
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
            'acta_recibido/elementos/' + actaId).pipe(
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
        return this.rqManager.get('soporte_acta?query=Activo:True,ActaRecibidoId__Id:' + actaId).pipe(
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

    public getActaById(Id: number) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('historico_acta?query=Activo:true,ActaRecibidoId__Id:' + Id).pipe(
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
    public getTransaccionActa(actaId, elementos) {
        const query = !elementos ? '?elementos=false' : '';
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('transaccion_acta_recibido/' + actaId + query).pipe(
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
        const payload = 'limit=-1&fields=Id,Nombre&sortby=Nombre&order=asc&query=Activo:true,TipoParametroId__CodigoAbreviacion__in:L|M|T|C|S';
        this.rqManager.setPath('PARAMETROS_SERVICE');
        return this.rqManager.get('parametro?' + payload).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los parametros');
                        return undefined;
                    }
                    if (!res.Data || (res.Data && res.Data.length === 1 && !Object.keys(res.Data[0]).length)) {
                        res.Data = [];
                    }
                    return res.Data;
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
    public getUnidadEjecutoraByID(id: string) {
        this.rqManager.setPath('PARAMETROS_SERVICE');
        return this.rqManager.get('parametro/' + id).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron cargar los parametros');
                        return undefined;
                    }
                if (!res.Data || (res.Data && res.Data.length === 1 && !Object.keys(res.Data[0]).length)) {
                    res.Data = [];
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
    public getAllElemento(payload: string) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('elemento?' + payload).pipe(
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
     * getAllActaRecibido
     * Consulta endpoint acta_recibido de api acta_recibido_crud
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public getAllActaRecibido(payload) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('acta_recibido?' + payload).pipe(
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

}
