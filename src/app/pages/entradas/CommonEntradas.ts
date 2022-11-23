import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TransaccionEntrada } from '../../@core/data/models/entrada/entrada';

@Injectable()
export class CommonEntradas {

    constructor(
        private fb: FormBuilder,
        private translate: TranslateService,
    ) { }

    public crearTransaccionEntrada(Observacion: string, Detalle: any, FormatoTipoMovimientoId: string, SoporteMovimientoId: number):
        TransaccionEntrada {
        return <TransaccionEntrada>{
            Observacion,
            Detalle,
            FormatoTipoMovimientoId,
            SoporteMovimientoId,
        };
    }

    get formObservaciones(): FormGroup {
        return this.fb.group({
            observacionCtrl: [''],
        });
    }

    get optionsSubmit(): any {
        return {
            title: this.translate.instant('GLOBAL.movimientos.entradas.registroConfrmTtl'),
            text: this.translate.instant('GLOBAL.movimientos.entradas.registroConfrmTxt'),
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.translate.instant('GLOBAL.si'),
            cancelButtonText: this.translate.instant('GLOBAL.no'),
        };
    }

}
