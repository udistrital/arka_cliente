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

}

