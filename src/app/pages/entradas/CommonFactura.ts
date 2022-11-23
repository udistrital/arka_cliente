import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SoporteActa } from '../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoHelper } from '../../helpers/acta_recibido/actaRecibidoHelper';

@Injectable()
export class CommonFactura {

    constructor(
        private actaRecibidoHelper: ActaRecibidoHelper,
        private fb: FormBuilder,
    ) { }

    public loadSoportes(acta: Number): Promise<SoporteActa[]> {
        return new Promise<SoporteActa[]>(async (resolve) => {
            this.actaRecibidoHelper.getSoporte(acta).subscribe(res => {
                resolve(res);
            });
        });
    }

    public getFechaFactura(soportes: SoporteActa[], factura: number): string {
        return factura && soportes.length ? soportes.find(s => s.Id === +factura).FechaSoporte.toString() : '';
    }

    get formFactura(): FormGroup {
        return this.fb.group({
            facturaCtrl: ['', Validators.required],
        });
    }

}
