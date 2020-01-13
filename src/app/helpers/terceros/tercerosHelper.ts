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
     * Elementos get
     * Conversion Archivo Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
   public getProveedores(nombre) {
    this.rqManager.setPath('TERCEROS');
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
    return this.rqManager.get('terceros/' + id ).pipe(
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

}
