import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OikosHelper {

    constructor(
        private rqManager: RequestManager,
        private translate: TranslateService,
        private pUpManager: PopUpManager) { }

    /**
      * Trae la lista de dependencias disponible filtradas por el nombre
      * If the response has errors in the OAS API it should show a popup message with an error.
      * If the response is successs, it returns the object's data.
      * @param text nombre de la dependencia
      * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    public getDependencias(text: string) {
        const query = 'dependencia?limit=-1&sortby=Nombre&order=asc&query=Nombre__icontains:' + text;
        this.rqManager.setPath('OIKOS_SERVICE');
        return this.rqManager.get(query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_dependencias'));
                        return undefined;
                    }
                    if (!res.length || (res.length === 1 && !Object.keys(res[0]).length)) {
                        res = [];
                    }
                    return res;
                },
            ),
        );
    }

    public cambiosDependencia_(valueChanges: Observable<any>) {
        return valueChanges.pipe(
            startWith(''),
            debounceTime(250),
            distinctUntilChanged(),
            switchMap((val) => this.loadDependencias(val)),
        );
    }

    private loadDependencias(text: string) {
        const queryOptions$ = text.length > 3 ?
            this.getDependencias(text) :
            new Observable((obs) => { obs.next([]); });
        return combineLatest([queryOptions$]).pipe(
            map(([queryOptions_$]) => ({
                queryOptions: queryOptions_$,
            })),
        );
    }

    public muestraDependencia(dep: any): string {
        return dep ? dep.Nombre : '';
    }

    /**
    * Trae la lista de sedes registradas en el api oikos_crud
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response is successs, it returns the object's data.
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public getSedes() {
        const query = 'espacio_fisico?limit=-1&sortby=Nombre&order=asc&query=TipoEspacioFisicoId__Nombre:SEDE';
        this.rqManager.setPath('OIKOS_SERVICE');
        return this.rqManager.get(query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_dependencias'));
                        return undefined;
                    }
                    if (!res.length || (res.length === 1 && !Object.keys(res[0]).length)) {
                        res = [];
                    }
                    return res;
                },
            ),
        );
    }

    /**
    * Consulta endpoint espacio_fisico el api oikos_crud
    * If the response has errors in the OAS API it should show a popup message with an error.
    * If the response is successs, it returns the object's data.
    * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
    */
    public getAllEspacioFisico(query: string) {
        this.rqManager.setPath('OIKOS_SERVICE');
        return this.rqManager.get('espacio_fisico?' + query).pipe(
            map(
                (res) => {
                    if (res === 'error') {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error_dependencias'));
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }

}
