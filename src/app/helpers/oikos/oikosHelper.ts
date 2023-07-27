import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { PopUpManager } from '../../managers/popUpManager';
import { debounceTime, distinctUntilChanged, map, mergeAll, startWith, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { asyncScheduler, combineLatest, Observable, of, scheduled } from 'rxjs';
import { Store } from '@ngrx/store';
import { IAppState } from '../../@core/store/app.state';
import { EspacioFisico } from '../../@core/data/models/ubicacion/espacio_fisico';
import { AbstractControl } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class OikosHelper {

    sedes: any;

    constructor(
        private rqManager: RequestManager,
        private translate: TranslateService,
        private pUpManager: PopUpManager,
        private store: Store<IAppState>,
    ) { }

    /**
      * Trae la lista de dependencias disponible filtradas por el nombre
      * If the response has errors in the OAS API it should show a popup message with an error.
      * If the response is successs, it returns the object's data.
      * @param text nombre de la dependencia
      * @returns  <Observable> data of the object registered at the DB. undefined if the request has errors
     */
    private getDependencias(text: string) {
        const query = '?limit=-1&sortby=Nombre&order=asc&query=Nombre__icontains:' + text;
        return this.getAllDependencias(query);
    }

    public getAllDependencias(payload: string) {
        this.rqManager.setPath('OIKOS_SERVICE');
        return this.rqManager.get('dependencia' + payload).pipe(
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

    private getSedesFromStore() {
        if (this.sedes && this.sedes.length) {
            return;
        }

        this.store.select((state) => state).subscribe(list => {
            if (list.listSedes.length && list.listSedes[0]) {
                this.sedes = list.listSedes[0];
            }
        });
    }

    public cambiosDependencia(sedeCtrl: AbstractControl, depCtrl: AbstractControl) {
        this.getSedesFromStore();
        return scheduled([sedeCtrl.valueChanges, depCtrl.valueChanges], asyncScheduler)
            .pipe(
                mergeAll(),
                startWith(''),
                debounceTime(250),
                distinctUntilChanged(),
                switchMap(() => this.loadDependencias(sedeCtrl.value, depCtrl.value)));
    }

    private loadDependencias(sede: any, dependencia: string) {
        let codigoSede = '';
        if (this.sedes && this.sedes.length && sede) {
            const sede_ = this.sedes.find((x) => x.Id === sede);
            if (sede_) {
                codigoSede = sede_.CodigoAbreviacion.substring(0, 2) + sede_.CodigoAbreviacion.substring(2).replace(/\d.*/g, '');
            }
        }

        let queryOptions$: Observable<any>;
        if (codigoSede) {
            const payload = 'limit=-1&fields=DependenciaId&query=' +
                'EspacioFisicoId__CodigoAbreviacion__istartswith:' + codigoSede +
                (!dependencia.length ? '' : ',DependenciaId__Nombre__icontains:' + dependencia);
            queryOptions$ = this.getAllAsignacionEspacioFisicoDependencia(payload);
        } else if (dependencia.length > 3) {
            queryOptions$ = this.getDependencias(dependencia);
        } else {
            queryOptions$ = new Observable((obs) => { obs.next([]); });
        }

        return combineLatest([queryOptions$]).pipe(
            map(([queryOptions_$]) => ({
                queryOptions: codigoSede ? this.quitarDependenciasDuplicadas(queryOptions_$) : queryOptions_$,
            })),
        );
    }

    private quitarDependenciasDuplicadas(asignaciones: any[]) {
        const result: any[] = [];
        asignaciones.forEach((item) => {
            if (result.findIndex(s => s.Id === item.DependenciaId.Id) === -1) {
                result.push(item.DependenciaId);
            }
        });
        return result;
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

    public getAllAsignacionEspacioFisicoDependencia(payload) {
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
