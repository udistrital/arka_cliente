import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class TercerosHelper {

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager) { }

    /**
      * Trae la lista de terceros activos
      * If the response has errors in the OAS API it should show a popup message with an error.
      * If the response is successs, it returns the object's data.
      * @param query to Terceros CRUD API
      * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTerceros(query: string = '') {
        this.rqManager.setPath('TERCEROS_SERVICE');
        let endpoint = 'tercero?limit=-1';
        endpoint += '&fields=Id,NombreCompleto';
        endpoint += '&query=Activo:true';
        if (query) {
            endpoint += ',' + query;
        }
        return this.rqManager.get(endpoint).pipe(
            map(
                (res) => {
                    if (res === 'error' || !Array.isArray(res) || !res.some(t => Object.keys(t).length > 0)) {
                        this.pUpManager.showErrorAlert('No hay terceros disponibles');
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
    public getProveedores(nombre) {
        this.rqManager.setPath('TERCEROS_SERVICE');
        return this.rqManager.get('tercero/?query=NombreCompleto__icontains:' + nombre + ',Activo:true&fields=NombreCompleto,Id&limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se encontro ningun nombre de proovedor');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public getTerceroById(id) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('terceros/' + id).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se encontro ningun nombre de proovedor');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * getTercerosByCriterio
     *
     * Trae todos o un tercero, de acuerdo al criterio especificado
     * @param criterio El tipo de tercero que se necesita, ejemplo: "funcionarioPlanta" o "jefes"
     * @param idTercero De especificarse, adicionalmente filtra por ese ID
     */
    public getTercerosByCriterio(criterio: string, idTercero: number = 0) {
        this.rqManager.setPath('ARKA_SERVICE');
        let path = 'terceros/tipo/' + criterio;
        if (idTercero > 0) {
            path += '/' + idTercero;
        }
        return this.rqManager.get(path).pipe(
            map(
                (res) => {
                    if (res === 'error' || !Array.isArray(res)) {
                        this.pUpManager.showErrorAlert('No se encontro ningun tercero que pueda ejercer como supervisor');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

}
