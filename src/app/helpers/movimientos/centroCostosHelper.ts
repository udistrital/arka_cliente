import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from '../../managers/popUpManager';
import { RequestManager } from '../../managers/requestManager';

@Injectable({
    providedIn: 'root',
})
export class CentroCostosHelper {

    constructor(
        private rqManager: RequestManager,
        private translate: TranslateService,
        private pUpManager: PopUpManager,
    ) { }

    public getAllCentroCostos(query: string = 'limit=-1&sortby=Nombre&order=asc') {
        this.rqManager.setPath('MOVIMIENTOS_ARKA_SERVICE');
        return this.rqManager.get('centro_costos?' + query).pipe(
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

    public getCentroCostoById(id: number) {
        if (!id) {
            return of(undefined);
        }

        return this.getAllCentroCostos('query=Id:' + id).pipe(
            map((res: any[]) => Array.isArray(res) && res.length ? res[0] : undefined),
        );
    }

    public searchCentroCostos(text: string, minLength: number = 0) {
        if (text && text.length >= minLength) {
            const query = 'limit=-1&sortby=Nombre&order=asc&query=Codigo__icontains:' + text + '|Nombre__icontains:' + text;
            return this.getAllCentroCostos(query);
        }

        return this.getAllCentroCostos();
    }

    public cambiosCentroCosto(valueChanges: Observable<any>, minLength: number = 0) {
        return valueChanges.pipe(
            startWith(''),
            debounceTime(250),
            distinctUntilChanged(),
            switchMap((value: any) => this.loadCentroCostos(value, minLength)),
        );
    }

    public muestraCentroCosto(centroCosto: any): string {
        if (!centroCosto) {
            return '';
        }

        if (typeof centroCosto === 'string') {
            return centroCosto;
        }

        if (typeof centroCosto === 'number') {
            return centroCosto.toString();
        }

        const normalizado = this.normalizarCentroCosto(centroCosto);
        const codigo = normalizado.Codigo || '';
        const nombre = normalizado.Nombre || '';

        if (codigo && nombre) {
            return `${codigo} - ${nombre}`;
        }

        return nombre || codigo || normalizado.Id || '';
    }

    public getCentroCostoId(centroCosto: any): number {
        if (!centroCosto) {
            return 0;
        }

        if (typeof centroCosto === 'number') {
            return centroCosto;
        }

        const normalizado = this.normalizarCentroCosto(centroCosto);
        return normalizado && normalizado.Id ? normalizado.Id : 0;
    }

    public findCentroCostoById(centrosCosto: any[], id: number) {
        if (!Array.isArray(centrosCosto) || !id) {
            return undefined;
        }

        return centrosCosto.find(centroCosto => this.getCentroCostoId(centroCosto) === id);
    }

    public normalizarCentroCosto(centroCosto: any): any {
        if (!centroCosto || typeof centroCosto !== 'object') {
            return centroCosto;
        }

        if (centroCosto.Ubicacion) {
            return this.normalizarCentroCosto(centroCosto.Ubicacion);
        }

        if (centroCosto.Codigo || centroCosto.Nombre || centroCosto.Dependencia || centroCosto.Sede) {
            return {
                ...centroCosto,
                Dependencia: centroCosto.Dependencia && typeof centroCosto.Dependencia === 'object' ?
                    centroCosto.Dependencia.Nombre || '' : centroCosto.Dependencia || '',
                Sede: centroCosto.Sede && typeof centroCosto.Sede === 'object' ?
                    centroCosto.Sede.Nombre || '' : centroCosto.Sede || '',
            };
        }

        if (centroCosto.EspacioFisicoId) {
            return {
                Id: centroCosto.Id,
                Codigo: centroCosto.EspacioFisicoId.CodigoAbreviacion || '',
                Nombre: centroCosto.EspacioFisicoId.Nombre || '',
                Dependencia: centroCosto.DependenciaId ? centroCosto.DependenciaId.Nombre : '',
                Sede: '',
            };
        }

        return centroCosto;
    }

    private loadCentroCostos(value: any, minLength: number) {
        const text = typeof value === 'string' ? value : this.muestraCentroCosto(value);

        if (text.length < minLength) {
            return of({ queryOptions: [] });
        }

        return this.searchCentroCostos(text, minLength).pipe(
            map((queryOptions: any[]) => ({
                queryOptions: queryOptions || [],
            })),
        );
    }

}
