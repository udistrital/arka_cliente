import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Injectable()
export class SmartTableService {

    constructor(
        private translate: TranslateService,
    ) { }

    zero = new Date(-1);

    public formatDate(value: Date) {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        date.setUTCMinutes(date.getTimezoneOffset());
        return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
    }

    public prepareFunctionString(value: any): string {
        return value ? value : '';
    }

    public getSettingsDate() {
        return {
            valuePrepareFunction: (value: any) => {
                return this.prepareFunctionDate(value);
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionDate(cell, search);
            },
        };
    }

    public getSettingsDate_() {
        return {
            valuePrepareFunction: (value: any) => {
                return this.prepareFunctionDate_(value);
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionDate_(cell, search);
            },
        };
    }

    private prepareFunctionDate(value?: any): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        date.setUTCMinutes(date.getTimezoneOffset());
        const date_ = new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');

        if (date_.toString() === 'Invalid Date') {
            return '';
        }

        return date_;
    }

    private filterFunctionDate(cell?: any, search?: string): boolean {

        if (!cell || !search) {
            return false;
        }

        if (this.prepareFunctionDate(cell).indexOf(search) > -1) {
            return true;
        }
    }

    private prepareFunctionDate_(value?: any): string {
        if (!value) {
            return '';
        }

        const date = new Date(value) > this.zero ? this.formatDate(value) :
            this.translate.instant('GLOBAL.bajas.consulta.espera');
        return date;
    }

    private filterFunctionDate_(cell?: any, search?: string): boolean {

        if (!cell || !search) {
            return false;
        }

        if (this.prepareFunctionDate_(cell).indexOf(search) > -1) {
            return true;
        }
    }

    public prepareFunctionCurrency(value: any): string {
        const value_ = value ? Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value) : '';
        return '<p class="currency">' + value_ + '</p>';
    }

    public getSettingsObject(key: string) {
        return {
            valuePrepareFunction: (value: any) => {
                return this.prepareFunctionObject(key, value);
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionObject(key, cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionObject(direction, a, b, key);
            },
        };
    }

    private prepareFunctionObject(key: string, value?: any): string {
        if (!value || !value[key]) {
            return '';
        }

        return value[key];
    }

    private filterFunctionObject(key: string, cell?: any, search?: string): boolean {
        if (key && cell && search.length) {
            if (cell[key]) {
                if ((cell[key].toUpperCase()).indexOf(search.toUpperCase()) > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    private compareFunctionObject(direction: any, a: any, b: any, key: string) {
        const first = a[key] ? a[key].toLowerCase() : '';
        const second = b[key] ? b[key].toLowerCase() : '';
        return this.getOrder(first, second, direction);
    }

    public getSettingsObject_(key1: string, key2: string) {
        return {
            valuePrepareFunction: (value: any) => {
                return this.prepareFunctionObject_(key1, key2, value);
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionObject_(key1, key2, cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionObject_(direction, a, b, key1, key2);
            },
        };
    }

    private prepareFunctionObject_(key1: string, key2: string, value?: any): string {
        if (!value || !value[key1] || !value[key1][key2]) {
            return '';
        }

        return value[key1][key2];
    }

    private filterFunctionObject_(key1: string, key2: string, cell?: any, search?: string): boolean {
        if (key1 && key2 && cell && search.length) {
            if (cell[key1] && cell[key1][key2]) {
                if ((cell[key1][key2].toUpperCase()).indexOf(search.toUpperCase()) > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    private compareFunctionObject_(direction: any, a: any, b: any, key1: string, key2: string) {
        const first = a && a[key1] && a[key1][key2] ? a[key1][key2].toLowerCase() : '';
        const second = b && b[key1] && b[key1][key2] ? b[key1][key2].toLowerCase() : '';
        return this.getOrder(first, second, direction);
    }

    public getSettingsParse(key: string) {
        return {
            valuePrepareFunction: (value: any) => {
                return this.prepareFunctionParse(value, key);
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionParse(key, cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionParse(direction, a, b, key);
            },
        };
    }

    public getSettingsBool() {
        return {
            valuePrepareFunction: (value: any) => {
                return this.prepareFunctionBool(value);
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionBool(cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionBool(direction, a, b);
            },
        };
    }

    private prepareFunctionParse(value: string, key: string): string {
        return value && JSON.parse(value) ? JSON.parse(value)[key] : '';
    }

    private filterFunctionParse(key: string, cell?: any, search?: string): boolean {
        if (cell && JSON.parse(cell)[key] && search.length) {
            return (JSON.parse(cell)[key].toUpperCase()).indexOf(search.toUpperCase()) > -1;
        }
        return false;
    }

    private compareFunctionParse(direction: any, a: any, b: any, key: string) {
        const first = a && JSON.parse(a)[key] ? JSON.parse(a)[key].toLowerCase() : '';
        const second = b && JSON.parse(b)[key] ? JSON.parse(b)[key].toLowerCase() : '';
        return this.getOrder(first, second, direction);
    }

    private getOrder(first: any, second: string, direction: any): number {
        if (first < second) {
            return -1 * direction;
        }
        if (first > second) {
            return direction;
        }
        return 0;
    }

    public toUpperCase(value: string) {
        if (value) {
            return value.toUpperCase();
        } else {
            return '';
        }
    }

    private prepareFunctionBool(value: boolean) {
        if (value) {
            return this.translate.instant('GLOBAL.si');
        } else {
            return this.translate.instant('GLOBAL.no');
        }
    }

    private filterFunctionBool(cell?: any, search?: string): boolean {
        if (!search.length) {
            return false;
        }

        if (this.prepareFunctionBool(cell).toUpperCase().indexOf(search.toUpperCase()) > -1) {
            return true;
        }
    }

    private compareFunctionBool(direction: any, a: any, b: any) {
        const first = this.prepareFunctionBool(a);
        const second = this.prepareFunctionBool(b);
        return this.getOrder(first, second, direction);
    }

    public getSettingsCodigoNombre() {
        return {
            valuePrepareFunction: (value: any) => {
                return this.prepareFunctionCodigoNombre(value);
            },
            filterFunction: (cell?: any, search?: string): boolean => {
                return this.filterFunctionCodigoNombre(cell, search);
            },
            compareFunction: (direction: any, a: any, b: any): number => {
                return this.compareFunctionCodigoNombre(direction, a, b);
            },
        };
    }

    private prepareFunctionCodigoNombre(value?: any): string {
        if (!value) {
            return '';
        }

        return value.Codigo ? value.Codigo + ' - ' + value.Nombre : value.Nombre;
    }

    private filterFunctionCodigoNombre(cell?: any, search?: string): boolean {

        if (!search.length) {
            return false;
        }

        const value = this.prepareFunctionCodigoNombre(cell);
        if (!value) {
            return false;
        }

        if ((value.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
            return true;
        }

        return false;
    }

    private compareFunctionCodigoNombre(direction: any, a: any, b: any) {
        const first = this.prepareFunctionCodigoNombre(a);
        const second = this.prepareFunctionCodigoNombre(b);
        return this.getOrder(first, second, direction);
    }

}
