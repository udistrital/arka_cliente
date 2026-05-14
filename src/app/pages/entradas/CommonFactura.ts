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
        if (!factura || !soportes.length) {
            return '';
        }

        const soporte = soportes.find(s => s.Id === +factura);
        return soporte ? this.formatDateWithoutTimezone(soporte.FechaSoporte) : '';
    }

    get formFactura(): FormGroup {
        return this.fb.group({
            facturaCtrl: ['', Validators.required],
        });
    }

    private formatDateWithoutTimezone(value: string | Date): string {
        if (!value) {
            return '';
        }

        if (value instanceof Date) {
            return this.buildDateString(
                value.getUTCFullYear(),
                value.getUTCMonth() + 1,
                value.getUTCDate(),
            );
        }

        const dateValue = value.toString().split('T')[0];
        const [year, month, day] = dateValue.split('-').map(Number);

        if (!year || !month || !day) {
            return value.toString().replace(/Z$/, '');
        }

        return this.buildDateString(year, month, day);
    }

    private buildDateString(year: number, month: number, day: number): string {
        const monthString = month < 10 ? '0' + month : month.toString();
        const dayString = day < 10 ? '0' + day : day.toString();

        return `${year}-${monthString}-${dayString}T00:00:00`;
    }

}
