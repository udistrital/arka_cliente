import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class TercerosHelper {

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager,
        private translate: TranslateService) { }

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
     * @param criterio El tipo de tercero que se necesita, ejemplo: "funcionarioPlanta" u "ordenadores del gasto"
     * @param idTercero De especificarse, adicionalmente filtra por ese ID
     */
    public getTercerosByCriterio(criterio: string, idTercero: number = 0) {
        this.rqManager.setPath('TERCEROS_MID_SERVICE');
        let path = 'tipo/' + criterio;
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

    /**
     * getCargo
     *
     * Trae todos el cargo de un determinado funcionario
     * @param idTercero Id del funcionario
     */
     public getCargo(idTercero: number) {
        this.rqManager.setPath('TERCEROS_MID_SERVICE');
        const path = `propiedad/cargo/${idTercero}`;
        return this.rqManager.get(path).pipe(
            map(
                (res) => {
                    if (res === 'error' || !Array.isArray(res)) {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_cargos'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * getCorreo
     *
     * Trae el correo de un tercero determinado
     * @param idTercero Id del tercero
     */
    public getCorreo(idTercero: number) {
        this.rqManager.setPath('TERCEROS_SERVICE');
        let path = 'info_complementaria_tercero?limit=1&fields=Dato&sortby=Id&order=desc';
        path += '&query=Activo%3Atrue,InfoComplementariaId__Nombre__icontains%3Acorreo,TerceroId__Id%3A' + idTercero;
        return this.rqManager.get(path).pipe(
            map(
                (res) => {
                    if (res === 'error' || !Array.isArray(res)) {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_correo'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

}
