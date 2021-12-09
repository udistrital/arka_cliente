import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { iif } from 'rxjs';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { DisponibilidadMovimientosService } from '../../@core/data/disponibilidad-movimientos.service';
import { TrMovimiento } from '../../@core/data/models/entrada/entrada';

@Injectable({
    providedIn: 'root',
})
export class EntradaHelper {

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
        private dispMvtos: DisponibilidadMovimientosService,
        private translate: TranslateService,
    ) {
    }

    /**
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getContratos(tipo, vigencia) {
        this.rqManager.setPath('ADMINISTRATIVA_SERVICE');
        return this.rqManager.get('contratos_suscritos/' + tipo + '/' + vigencia).pipe(
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
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getContrato(contrato, vigencia) {
        this.rqManager.setPath('ADMINISTRATIVA_SERVICE');
        return this.rqManager.get('informacion_contrato/' + contrato + '/' + vigencia).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSolicitantes(vigencia) {
        this.rqManager.setPath('ADMINISTRATIVA_SERVICE');
        return this.rqManager.get('lista_ordenadores/' + vigencia + '/' + vigencia).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los ordenadores');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Entrada Post
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response suceed, it returns the data of the updated object.
     * @param entradaData object to save in the DB
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public postEntrada(entradaData: Partial<TrMovimiento>, entradaId: number = 0) {
//          console.log("mira el numero", entradaId);
        return this.dispMvtos.movimientosPermitidos().pipe(
            switchMap(disp => iif(() => disp, this.postEntradaFinal(entradaData, entradaId))),
        );
    }

    private postEntradaFinal(entradaData: Partial<TrMovimiento>, entradaId: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post('entrada?entradaId=' + entradaId, entradaData).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.error_entrada_no_registrada'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getEntradas(tramiteOnly: boolean) {
        const query = 'movimiento?limit=-1&query=EstadoMovimientoId__Nombre' + (!tramiteOnly ?
            '__startswith:Entrada' : ':Entrada En Trámite');
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get(query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errorListaEntradas'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Contratos Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getMovimiento(consecutivo) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('movimiento?query=Id:' + consecutivo).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSoportes(entradaId) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('soporte_movimiento?query=MovimientoId.Id:' + entradaId + '&limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTipoEntradaByAcronimo(acronimo) {
        this.rqManager.setPath('MOVIMIENTOS_KRONOS_SERVICE');
        return this.rqManager.get('tipo_movimiento?query=Acronimo:' + acronimo + '&limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTipoEntradaByAcronimoAndNombre(acronimo, nombre) {
        this.rqManager.setPath('MOVIMIENTOS_KRONOS_SERVICE');
        return this.rqManager.get('tipo_movimiento?query=Acronimo:' + acronimo + ',Nombre:' + nombre).pipe(
            map(
                (res) => {
                    if (res === 'error' || !Array.isArray(res) || res.length === 0) {
                        this.pUpManager.showErrorAlert('Tipo de entrada no registrado en Kronos');
                        return undefined;
                    }
                    return res[0];
                },
            ),
        );
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getFormatoEntradaByName(nombre) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('formato_tipo_movimiento?query=Nombre:' + nombre + '&limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }


    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getEncargadoElementoByPlaca(placa) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('entrada/encargado/' + placa).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el encargado del elemento');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * EntradaByActa Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getEntradaByActa(acta_recibido_id) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('entrada/movimientos/' + acta_recibido_id).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron consultar los movimientos asociados');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * anularMovimientosByEntrada Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public anularMovimientosByEntrada(entrada_id) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('entrada/anular/' + entrada_id).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudieron anular los movimientos asociados');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public getMovimientosArka() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('formato_tipo_movimiento?limit=-1&sortby=Id&order=asc').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar los tipos de movimiento');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public putMovimientoArka(TipoMovimiento) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.put('formato_tipo_movimiento', TipoMovimiento).pipe(
            map(
                (res) => {
                    if (res) {
                        return res;
                    } else {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;

                    }
                },
            ),
        );
    }

    public postMovimientoArka(TrTipoMovimiento) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.post('formato_tipo_movimiento', TrTipoMovimiento).pipe(
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

    public getFormatoEntrada() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('formato_tipo_movimiento?query=NumeroOrden__lte:2&sortby=Id&order=asc&limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public putFormatoEntrada(FormatoTipoMovimiento) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.put('formato_tipo_movimiento', FormatoTipoMovimiento).pipe(
            map(
                (res) => {
                    if (res) {
                        return res;
                    } else {
                        this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                        return undefined;

                    }
                },
            ),
        );
    }

    public getTiposEntradaByOrden(NumeroOrden) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('formato_tipo_movimiento?query=Activo:true,NumeroOrden:' +
            NumeroOrden + '&fields=CodigoAbreviacion&sortby=Id&order=asc&limit=-1').pipe(
                map(
                    (res) => {
                        if (res === 'error') {
                            this.pUpManager.showErrorAlert('No se pudo consultar el contrato contratos');
                            return undefined;
                        }
                        return res;
                    },
                ),
            );
    }

    public getDivisas() {
        this.rqManager.setPath('PARAMETROS_SERVICE');
        return this.rqManager.get('parametro?query=TipoParametroId__Nombre:Divisas').pipe(
                map(
                    (res) => {
                        if (res === 'error') {
                            this.pUpManager.showErrorAlert('No se pudo consultar el parametro divisas');
                            return undefined;
                        }
                        return res;
                    },
                ),
            );
    }

    public getEstadosMovimiento() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('estado_movimiento?limit=-1').pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errorEstadosMov'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public putMovimiento(movimiento: any) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.put('movimiento', movimiento).pipe(
            map(
                (res) => {
                    if (res) {
                        return res;
                    } else {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errorRechazoEntrada'));
                        return undefined;
                    }
                },
            ),
        );
    }

}
