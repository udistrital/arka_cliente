import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { EspacioFisico } from '../../@core/data/models/ubicacion/espacio_fisico';

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
            switchMap((val: any) => this.loadDependencias(val)),
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
        const payload = 'limit=-1&sortby=Nombre&order=asc&query=TipoEspacioFisicoId__Nombre:SEDE';
        return this.getAllEspacioFisico(payload);
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

    public cambiosEspacios(valueChanges: Observable<any>) {
        return valueChanges.pipe(
            startWith(''),
            debounceTime(250),
            distinctUntilChanged(),
            switchMap((val: any) => this.loadEspacios(val)),
        );
    }

    private loadEspacios(text: string) {
        const queryOptions$ = text.length > 3 ?
            this.getAllEspacioFisico('limit=-1&sortby=Nombre&order=asc&query=Nombre__icontains:' + text) :
            new Observable((obs) => { obs.next([]); });
        return combineLatest([queryOptions$]).pipe(
            map(([queryOptions_$]) => ({
                queryOptions: queryOptions_$,
            })),
        );
    }

    public getAllAsignacionEspacioFisicoDependencia(payload, mapDependencias: boolean = false) {
        this.rqManager.setPath('OIKOS_SERVICE');
        return this.rqManager.get('asignacion_espacio_fisico_dependencia?' + payload).pipe(
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

    public getSedeDependencia(id) {
        return this.getAllAsignacionEspacioFisicoDependencia('query=Id:' + id);
    }


    public getAsignacionesBySedeAndDependencia(codigoSede: string, dependenciaId: number) {
        if (codigoSede && dependenciaId) {
            const payload = 'limit=-1&fields=Id,EspacioFisicoId&query=DependenciaId__Id:' + dependenciaId +
                ',EspacioFisicoId__CodigoAbreviacion__istartswith:' + codigoSede;
            return this.getAllAsignacionEspacioFisicoDependencia(payload);
        } else {
            return of(new EspacioFisico()).pipe(map(o => []));
        }
    }

    public getSedeEspacioFisico(codigoEspacio: string, sedes: any[]) {
        if (!codigoEspacio.length || !sedes.length) {
            return;
        }

        const codigoSede = codigoEspacio.substring(0, 2) + codigoEspacio.substring(2).replace(/\d.*/g, '');
        const sede = sedes.find(x => x && x.CodigoAbreviacion === codigoSede);
        return sede;
    }

}
