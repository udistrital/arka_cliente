import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class SmartTableService {

    constructor(
        private translate: TranslateService,
    ) {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
        });
    }

    public formatDate(value: Date) {
        if (value) {
            const date = new Date(value);
            date.setUTCMinutes(date.getTimezoneOffset());
            return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
        } else {
            return '';
        }
    }

    public prepareFunctionObject(key: string, value?: any): string {
        if (!value || !value[key]) {
            return '';
        }

        return value[key];
    }

    public filterFunctionObject(key: string, cell?: any, search?: string): boolean {
        if (key && cell && search.length) {
            if (cell[key]) {
                if ((cell[key].toUpperCase()).indexOf(search.toUpperCase()) > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    public prepareFunctionObject_(key1: string, key2: string, value?: any): string {
        if (!value || !value[key1] || !value[key1][key2]) {
            return '';
        }

        return value[key1][key2];
    }

    public filterFunctionObject_(key1: string, key2: string, cell?: any, search?: string): boolean {
        if (key1 && key2 && cell && search.length) {
            if (cell[key1] && cell[key1][key2]) {
                if ((cell[key1][key2].toUpperCase()).indexOf(search.toUpperCase()) > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    public toUpperCase(value: string) {
        if (value) {
            return value.toUpperCase();
        } else {
            return '';
        }
    }

    public boolToText(value: boolean) {
        if (value) {
            return 'SÍ'; // this.translate.instant('GLOBAL.si')
        } else {
            return 'NO'; // this.translate.instant('GLOBAL.no');
        }
    }
}

