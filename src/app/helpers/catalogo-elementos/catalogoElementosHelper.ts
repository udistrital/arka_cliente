import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';

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
    public getCuentasContables(subgrupo, movimiento = 0) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('catalogo_elementos/cuentas_contables/' + subgrupo + '?movimientoId=' + movimiento).pipe(
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
        const payload = 'detalle_subgrupo?sortby=FechaCreacion&order=desc&limit=-1'
            + '&query=Activo:true,SubgrupoId__Id:' + subgrupo;
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get(payload).pipe(
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

    public getAllDetalleSubgrupo(payload: string) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('detalle_subgrupo?' + payload).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar la lista de clases');
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
    public getAllTiposBien(query: string) {
        this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
        return this.rqManager.get('tipo_bien?' +  query).pipe(
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
 public putTipoBien(tipoBien) {
    this.rqManager.setPath('CATALOGO_ELEMENTOS_SERVICE');
    return this.rqManager.put('tipo_bien', tipoBien).pipe(
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

    public cambiosClase(valueChanges: Observable<any>) {
        return valueChanges
            .pipe(
                debounceTime(250),
                distinctUntilChanged(),
                switchMap((val: any) => this.loadClases_(val)),
            );
    }

    private loadClases_(text: string) {
        const queryOptions$ = text.length > 3 ?
            this.getAllDetalleSubgrupo('limit=-1&fields=Id,SubgrupoId,TipoBienId&compuesto=' + text) :
            new Observable((obs) => { obs.next([]); });
        return combineLatest([queryOptions$]).pipe(
            map(([queryOptions_$]) => ({
                queryOptions: queryOptions_$,
            })),
        );
    }

    public muestraClase(clase): string {
        return clase && clase.SubgrupoId && clase.SubgrupoId.Id ? (clase.SubgrupoId.Codigo + ' - ' + clase.SubgrupoId.Nombre) : '';
    }

}
