import { Injectable } from '@angular/core';
import { SoporteActa, SoporteActaProveedor } from '../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoHelper } from '../../helpers/acta_recibido/actaRecibidoHelper';

@Injectable({
    providedIn: 'root',
})

export class Soporte {

    constructor(private actaRecibidoHelper: ActaRecibidoHelper) { }

    cargarSoporte(actaRecibidoId: number): Promise<any> {
        return new Promise<any>(resolve => {
            const soportes = new Array<SoporteActaProveedor>();
            const datos: any = {};
            this.actaRecibidoHelper.getTransaccionActa(actaRecibidoId, false).toPromise().then(res => {
                if (res !== null) {
                    res.SoportesActa.forEach(soporte => {
                        const soporteActa = new SoporteActaProveedor;
                        soporteActa.Id = soporte.Id;
                        soporteActa.Consecutivo = soporte.Consecutivo;
                        soporteActa.FechaSoporte = soporte.FechaSoporte;
                        soportes.push(soporteActa);
                    });
                }
                const date = soportes[0].FechaSoporte.toString().split('T');
                datos.fecha = date[0];
                datos.soportes = soportes;
                datos.proveedor = res.UltimoEstado.ProveedorId;
                resolve(datos);
            });
        });
      }
}
