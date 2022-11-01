import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { TrSoporteMovimiento } from '../../@core/data/models/movimientos_arka/movimientos_arka';
import { UserService } from '../../@core/data/users.service';

@Injectable({
    providedIn: 'root',
})
export class BajasHelper {

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
        private translate: TranslateService,
        private userService: UserService,
    ) { }

    /**
     * Entradas Get
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getAll(revComite: boolean, revAlmancen: boolean) {
        const usuario = this.userService.getUserMail();
        const query = '?user=' + usuario +
            '&revComite=' + revComite +
            '&revAlmacen=' + revAlmancen;
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bajas_elementos/' + query).pipe(
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
    public getOne(id) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('bajas_elementos/' + id).pipe(
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
