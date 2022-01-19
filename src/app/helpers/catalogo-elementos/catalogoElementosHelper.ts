import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TipoBien } from '../../@core/data/models/acta_recibido/tipo_bien';

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
    public getCatalogo(activo: boolean = true) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        let endpoint = 'catalogo?sortby=FechaModificacion&order=desc&limit=-1';
        if (activo) {
            endpoint += '&query=Activo:true';
        }
        return this.rqManager.get(endpoint).pipe(
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
        return this.rqManager.put2('subgrupo', Transaccion, Id).pipe(
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
        return this.rqManager.get('tr_subgrupo/' + subgrupoId).pipe(
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
        return this.rqManager.put2('tr_subgrupo', Transaccion, Id).pipe(
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

    public putElemento(Transaccion) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.put2('elemento', Transaccion, Transaccion.Id).pipe(
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
     * Retorna los Tipo de Bien Activos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTipoBien() {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('tipo_bien?query=Activo:true&limit=-1').pipe(
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
        this.rqManager.setPath('CUENTAS_CONTABLES_SERVICE');
        return this.rqManager.get('nodo_cuenta_contable/getCuentas/' + naturaleza).pipe(
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
        return this.rqManager.get('cuentas_subgrupo?sortby=Id&order=desc&query=SubgrupoId__Id:'
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

    public getMovimientosSubgrupo(subgrupoId) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('cuentas_subgrupo?query=Activo:true,SubgrupoId__Id:'
            + subgrupoId).pipe(
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
    public getArbolCatalogo(catalogo, elementos, subgruposInactivos) {
        const query1 = elementos ? 'elementos=true' : '';
        const query2 = subgruposInactivos ? 'subgruposInactivos=true' : '';
        const query = elementos && subgruposInactivos ? '?' + query1 + '&' + query2 : '?' + query1 + query2;
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('tr_catalogo/' + catalogo + query).pipe(
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
        this.rqManager.setPath('MOVIMIENTOS_KRONOS_SERVICE');
        const query = '?query=Activo:true&limit=-1';
        return this.rqManager.get('tipo_movimiento' + query).pipe(
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
      //  console.log('El subgrupo', subgrupo);
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

    /**
     * Catalogo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSubgrupoTipoBien(subgrupo) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('tr_catalogo/tipo_de_bien/' + subgrupo + '').pipe(
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
     * Subgrupo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getClases() {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        // return this.rqManager.get('subgrupo?query=TipoNivelId.Id:4&fields=Id,Nombre,Codigo,Activo&limit=-1').pipe(
        return this.rqManager.get('detalle_subgrupo?fields=SubgrupoId,TipoBienId&limit=-1').pipe(
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
     * Subgrupo Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getClasesTipoBien(TipoBienId) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        // return this.rqManager.get('subgrupo?query=TipoNivelId.Id:4&fields=Id,Nombre,Codigo,Activo&limit=-1').pipe(
        return this.rqManager.get('detalle_subgrupo?query=TipoBienId.Id:' + TipoBienId + '&fields=SubgrupoId,TipoBienId&limit=-1').pipe(
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
 * Retorna Todos los Tipos de Bien Get
 * If the response has errors in the OAS API it should show a popup message with an error.
 * If the response is successs, it returns the object's data.
 * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
 */
    public getAllTiposBien() {
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
 * Post  Tipos de bien
 * If the response has errors in the OAS API it should show a popup message with an error.
 * If the response is successs, it returns the object's data.
 * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
 */
     public postTipoBien(TrTipoBien) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.post('tipo_bien', TrTipoBien).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('Error');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

/**
 * Put tipo de bien
 * If the response has errors in the OAS API it should show a popup message with an error.
 * If the response is successs, it returns the object's data.
 * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
 */
 public putTipoBien(TipodeBien) {
    this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
    return this.rqManager.put('tipo_bien', TipodeBien).pipe(
        map(
            (res) => {
                if (res) {
                    return res;
                }
                this.pUpManager.showErrorAlert('No se pudo consultar los tipos de bien');
                return undefined;
            },
        ),
    );
}

}
