import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { iif } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';
import { DisponibilidadMovimientosService } from '../../@core/data/disponibilidad-movimientos.service';
import { TranslateService } from '@ngx-translate/core';
import { TrSoporteMovimiento } from '../../@core/data/models/movimientos_arka/movimientos_arka';

@Injectable({
    providedIn: 'root',
})
export class BajasHelper {

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
        private dispMvtos: DisponibilidadMovimientosService,
        private translate: TranslateService,
    ) { }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public GetElemento(id) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bajas_elementos/elemento_arka/' + id).pipe(
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
    public postSolicitud(salidasData) {
        return this.dispMvtos.movimientosPermitidos().pipe(
            switchMap(disp => iif(() => disp, this.postSolicitudFinal(salidasData))),
        );
    }
    private postSolicitudFinal(salidasData) {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.post(`movimiento`, salidasData).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert('No se pudo registrar la entrada solicitada.');
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
    public getFormatosMovimiento() {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('formato_tipo_movimiento?query=CodigoAbreviacion__contains:SOL').pipe(
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
    public getSolicitudes(revComite: boolean, revAlmancen: boolean) {
        const query = '?revComite=' + revComite + '&revAlmacen=' + revAlmancen;
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bajas_elementos/solicitud' + query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.consultar.errTxt'));
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
    public getSolicitud(id) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bajas_elementos/solicitud/' + id).pipe(
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
     * GetElementos
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> Lista de elementos que incluyen el texto indicado en su placa
     */
    public getElementos(placa: string) {
        this.rqManager.setPath('ACTA_RECIBIDO_SERVICE');
        return this.rqManager.get('elemento?fields=Id,Placa&limit=-1&sortby=Placa&order=desc&query=Placa__icontains:' + placa).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.errorPlacas'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * GetDetalleElemento
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> Detalle requerido para hacer la baja del elemento
     */
    public getDetalleElemento(id: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bajas_elementos/elemento/' + id).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.errorHistorialElemento'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * PostBaja
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> Consecutivo de la baja generada
     */
    public postBaja(movimiento: TrSoporteMovimiento) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post('bajas_elementos/', movimiento).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.registro.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * PutBaja
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> Consecutivo de la baja y nuevo Soporte
     */
    public putBaja(movimiento: TrSoporteMovimiento, movimientoId: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.put2('bajas_elementos/', movimiento, movimientoId).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.editar.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * submitRevisionComite
     * Servicio para registrar la aprobación o rechazo masivo de solicitud de bajas por el comité de almacén
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> Consecutivo de la baja y nuevo SoporteZ
     */
    public postRevisionComite(revision) {
        let endpoint = '';
        if (revision.Aprobacion) {
            this.rqManager.setPath('ARKA_SERVICE');
            endpoint = 'bajas_elementos/aprobar';
        } else {
            this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
            endpoint = 'bajas';
        }

        return this.rqManager.put2(endpoint, revision, '').pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.editar.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

}
