import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilidadesService {

    userArray: any[];
    jsonArray: any[];

    constructor() {
    }

    getSumArray(array): any {
        let sum = 0;
        array.forEach(element => {
            sum += element;
        });
        return sum;
    }

    translateTree(tree: any) {
        const trans = tree.map((n: any) => {
            let node = {};
            node = {
                id: n.Id,
                name: n.Nombre,
            };
            if (n.hasOwnProperty('Opciones')) {
                if (n.Opciones !== null) {
                    const children = this.translateTree(n.Opciones);
                    node = { ...node, ...{ children: children } };
                }
                return node;
            } else {
                return node;
            }
        });
        return trans;
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

    public getKeyFromString(value: string, key: string) {
        return value && JSON.parse(value) ? JSON.parse(value)[key] : '';
    }

}
