import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable({
    providedIn: 'root',
})
export class CatalogoBienesHelper {

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager) { }

    /**
     * Catalogo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getArbolCatalogo(catalogo) {
        this.rqManager.setPath('CATALOGO_BIENES_SERVICE');
        return this.rqManager.get('tr_catalogo/' + catalogo).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el catálogo de bienes');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Catalogo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getCatalogos() {
        this.rqManager.setPath('CATALOGO_BIENES_SERVICE');
        return this.rqManager.get('catalogo').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el catálogo de bienes');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Catalogo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getCuentasContables(subgrupo) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('catalogo_elementos/cuentas_contables/' + subgrupo).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el catálogo de bienes');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

}
