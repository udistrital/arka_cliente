import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { DisponibilidadMovimientosService } from '../../@core/data/disponibilidad-movimientos.service';

@Injectable({
    providedIn: 'root',
})
export class SalidaHelper {

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
        private dispMvtos: DisponibilidadMovimientosService,
        private translate: TranslateService,
    ) {
    }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getSalidas(tramiteOnly: boolean) {
        const query = tramiteOnly ? '?tramite_only=true' : '';
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('salida' + query).pipe(
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
    public getSalida(id) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('salida/' + id + '').pipe(
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

    public getElementosParaSalida(salida: number = 0, entrada: number = 0) {
        this.rqManager.setPath('ARKA_SERVICE');
        const payload = 'salida_id=' + salida + '&entrada_id=' + entrada;
        return this.rqManager.get('salida/elementos?' + payload).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert('Error al consultar los elementos para realizar la respectiva salida.');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public registrarSalida(salidasData, salidaId: number = 0) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post('salida?salidaId=' + salidaId, salidasData).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.error_salida_no_registrada'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    public editarSalida(salidasData, salidaId: number, rechazar: boolean = false) {
        this.rqManager.setPath('ARKA_SERVICE');
        const endpoint = salidaId + '?rechazar=' + rechazar;
        return this.rqManager.put2('salida', salidasData, endpoint).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.error_salida_no_registrada'));
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
    public getElementos2() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bodega_consumo/elementos_sin_asignar').pipe(
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
    public getElementos() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('elementos_movimiento?query=MovimientoId.FormatoTipoMovimientoId.Id:9&limit=-1').pipe(
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


    public getElemento(elemento) {

        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('elemento/' + elemento.Id).pipe(
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




    public putElemento(elemento) {

        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post('elemento',  elemento).pipe(
           map(
              (res) => {
                 if (res['Type'] === 'error') {
                    this.pUpManager.showErrorAlert('No se pudo asignar la placa');
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
    public getEntradasSinSalida() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('movimiento?sortby=FechaCreacion&order=desc&query=EstadoMovimientoId__Nombre:Entrada Aprobada&limit=-1').pipe(
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

    public getJefeOficina() {
        this.rqManager.setPath('TERCEROS_SERVICE');
        return this.rqManager.get('vinculacion?query=CargoId:312').pipe(
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
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getAjustes() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        const query = 'movimiento?query=FormatoTipoMovimientoId__Nombre:Ajuste Automático,Activo:true&limit=-1&sortby=Id&order=desc';
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
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getDetalleAjuste(id: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('ajustes/automatico/' + id).pipe(
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

}
