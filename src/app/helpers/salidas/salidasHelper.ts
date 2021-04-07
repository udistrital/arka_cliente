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
    public getSalidas() {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('salida/').pipe(
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
    /**
    * Entrada Post
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response suceed, it returns the data of the updated object.
    * @param entradaData object to save in the DB
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public postSalidas(salidasData) {
        return this.dispMvtos.movimientosPermitidos().pipe(map(disp => {
            if (disp) {
                this.rqManager.setPath('ARKA_SERVICE');
                return this.rqManager.post(`salida`, salidasData).pipe(
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
        }));
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
        return this.rqManager.get('movimiento?query=EstadoMovimientoId.Id:2&limit=-1').pipe(
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

}
