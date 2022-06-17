import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Movimiento } from '../../@core/data/models/entrada/entrada';
import { UserService } from '../../@core/data/users.service';

@Injectable({
    providedIn: 'root',
})
export class TrasladosHelper {

    constructor(
        private rqManager: RequestManager,
        private translate: TranslateService,
        private pUpManager: PopUpManager,
        private userService: UserService) { }

    /**
     * Hace el post de un traslado a través el api arka_mid
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param movimiento detalle del traslado
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    // Se hace directamente al api crud mientras se genera la funcionalidad para asignar el consecutivo al traslado
    public postTraslado(movimiento: Movimiento) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.post('traslados/', movimiento).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registro.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Trae los traslados, según se solicite, en cualquier estado o en trámite
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param tramiteOnly Indica si se traen únicamente los traslados pendientes por ser revisados
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTraslados(confirmar: boolean, revisar: boolean) {
        const usuario = this.userService.getUserMail();
        const endpoint = 'traslados/?user=' + usuario +
            (confirmar ? '&confirmar=true' : '') +
            (revisar ? '&aprobar=true' : '');
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get(endpoint).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registro.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Trae los traslados, según se solicite, en cualquier estado o en trámite
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param tramiteOnly Indica si se traen únicamente los traslados pendientes por ser revisados
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getTraslado(movimientoId: number) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('traslados/' + movimientoId).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registro.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Trae los elementos disponibles para ser trasladados según un funcionario
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getInventarioTercero() {
        const usuario = this.userService.getPersonaId();
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('traslados/funcionario/' + usuario).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.consulta.errorElementos'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

    /**
     * Confirma el traslado a través el api arka_mid
     * If the response has errors in the OAS API it should show a popup message with an error.
     * If the response is successs, it returns the object's data.
     * @param movimiento detalle del traslado
     * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    // Se hace directamente al api crud mientras se genera la funcionalidad para asignar el consecutivo al traslado
    public aprobarTraslado(movimiento: Movimiento) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.put2('traslados', {}, movimiento.Id).pipe(
            map(
                (res) => {
                    if (res['Type'] === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.registro.errTxt'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
}
