import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CatalogoElementosHelper {

    constructor(private rqManager: RequestManager,
        private pUpManager: PopUpManager) { }

    /**
     * Actas de Recibido Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getCatalogo() {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('catalogo?limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los catalogos');
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
    public getCatalogoById(catalogoId) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('catalogo/' + catalogoId).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el catalogo');
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
    public postCatalogo(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.post('catalogo', Transaccion).pipe(
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
    public putCatalogo(Transaccion, Id) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.put2('catalogo', Transaccion, Id).pipe(
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
    public deleteCatalogo(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.delete('catalogo', Transaccion).pipe(
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
     * Actas de Recibido Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getGrupo() {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('subgrupo_catalogo?query=Activo:True').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los grupos');
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
    public getGrupoById(grupoId) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('subgrupo_catalogo?query=SubgrupoId.Id:' + grupoId + ',Activo:True').pipe(
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
    public getGrupoTransaccionById(grupoId) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('tr_grupo/' + grupoId + '').pipe(
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
     * Transaccion Acta Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postGrupo(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.post('tr_grupo', Transaccion).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el grupo asociado');
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
    public putGrupo(Transaccion, Id) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.put2('tr_grupo', Transaccion, Id).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo actualizar el grupo asociado');
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
    public deleteGrupo(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.delete('tr_grupo', Transaccion).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo borrar el grupo');
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
    public getSubgrupo() {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('subgrupo_subgrupo?query=Activo:True').pipe(
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
    public getSubgrupoById(subgrupoId) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('subgrupo_subgrupo?query=Activo:True,SubgrupoHijoId.Id:' + subgrupoId).pipe(
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
     * Transaccion Acta Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postSubgrupo(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.post('tr_subgrupo', Transaccion).pipe(
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
    public putSubgrupo(Transaccion, Id) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.put2('subgrupo', Transaccion, Id).pipe(
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
    public deleteSubgrupo(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.delete('tr_subgrupo', Transaccion).pipe(
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

     * Transaccion Elemento Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */

    public postElemento(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.post('elemento', Transaccion).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo regitrar el elemento');
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
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
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
     * Tipo de Bien Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getPlanCuentas(naturaleza) {
        this.rqManager.setPath('FINANCIERA_SERVICE');
        return this.rqManager.get('cuenta_contable?query=Naturaleza:' + naturaleza +
            ',NivelClasificacion.Id:5&fields=Id,Nombre,Naturaleza,Descripcion,Codigo&limit=-1').pipe(
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
     * Tipo de Bien Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getPlanCuentas2() {
        this.rqManager.setPath('FINANCIERA_SERVICE');
        return this.rqManager.get('cuenta_contable?fields=Id,Nombre,Naturaleza,Descripcion,Codigo&limit=-1').pipe(
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
     * Tipo de Bien Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getMovimiento(id_Subgrupo, idmovimiento) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('cuentas_subgrupo?query=SubgrupoId.Id:'
            + id_Subgrupo + ',Activo:true,SubtipoMovimientoId:' + idmovimiento + '').pipe(
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
     * Tipo de Bien Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postMovimiento(Movimiento) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.post('cuentas_subgrupo', Movimiento).pipe(
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
     * Tipo de Bien Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public putMovimiento(Movimiento, id_movimiento) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.put2('cuentas_subgrupo', Movimiento, id_movimiento).pipe(
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
     * Tipo de Bien Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public deleteMovimiento(Movimiento) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.delete('cuentas_subgrupo', Movimiento).pipe(
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
     * Catalogo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getArbolCatalogo(catalogo) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
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
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
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

    /**
     * Catalogo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTiposMovimientoKronos() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('catalogo_elementos/movimientos_kronos').pipe(
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
    public getDetalleSubgrupo(subgrupo) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('detalle_subgrupo?query=SubgrupoId.Id:' + subgrupo + ',Activo:true&limit=-1').pipe(
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
    public getElementosSubgrupo(subgrupo) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('elemento?query=SubgrupoId.Id:' + subgrupo + ',Activo:true&limit=-1').pipe(
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
     * Transaccion Acta Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postTransaccionCuentasSubgrupo(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.post('tr_cuentas_subgrupo', Transaccion).pipe(
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
     * Tipo de Bien Acta Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public putTransaccionCuentasSubgrupo(Transaccion, Id) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.put2('tr_cuentas_subgrupo', Transaccion, Id).pipe(
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
