import { Injectable } from '@angular/core';

@Injectable()
export class SmartTableService {

    public formatDate(value: Date) {
        if (value) {
            const date = new Date(value);
            date.setUTCMinutes(date.getTimezoneOffset());
            return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
        } else {
            return '';
        }
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

}

