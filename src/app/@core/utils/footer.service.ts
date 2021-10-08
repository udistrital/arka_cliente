import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FooterService {
    getProceso() {
        return ['Gestión de los Sistemas de Información y las Telecomunicaciones'];
    }

    getHorarios() {
        return ['Lunes a viernes', '8am a 5pm'];
    }

    getTelefono() {
        return ['323 93 00', 'Ext. 1112'];
    }

    getDireccion() {
        return ['Cra 8 # 40-78', 'Piso 1'];
    }

    getEmail() {
        return ['computo@udistrital.edu.co'];
    }

}
