import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransaccionEntrada } from '../../@core/data/models/entrada/entrada';
import { ActaRecibidoHelper } from '../../helpers/acta_recibido/actaRecibidoHelper';

@Injectable()
export class CommonEntradas {

    constructor(
        private actaRecibidoHelper: ActaRecibidoHelper,
        private fb: FormBuilder,
        private translate: TranslateService,
    ) { }

    public validateElementos(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const noFilas = !control.value.length;
            const noSeleccionado = !noFilas && !control.value.every(el => el.Placa && el.Placa.Id && el.Id);
            const duplicados = !noSeleccionado && control.value.map(el => el.Id)
                .some((element, index) => {
                    return control.value.map(el => el.Id).indexOf(element) !== index;
                });

            return (noFilas || noSeleccionado) ? { errorNoElementos: true } : duplicados ? { errorDuplicados: true } : null;
        };
    }

    public loadElementos(text: any) {
        const queryOptions$ = !text.Placa && text.length > 3 ?
            this.actaRecibidoHelper.getAllElemento('sortby=Placa&order=desc&limit=-1&fields=Id,Placa&query=Placa__icontains:' + text) :
            new Observable((obs) => { obs.next([]); });
        return combineLatest([queryOptions$]).pipe(
            map(([queryOptions_$]) => ({
                queryOptions: queryOptions_$,
            })),
        );
    }

    public muestraPlaca(field): string {
        return field && field.Placa ? field.Placa : '';
    }

    public crearTransaccionEntrada(Observacion: string, Detalle: any, FormatoTipoMovimientoId: string, SoporteMovimientoId: number):
        TransaccionEntrada {
        return <TransaccionEntrada>{
            Observacion,
            Detalle,
            FormatoTipoMovimientoId,
            SoporteMovimientoId,
        };
    }

    get formElementos(): FormGroup {
        return this.fb.group({
            elementos: this.fb.array([], { validators: this.validateElementos() }),
        });
    }

    get formObservaciones(): FormGroup {
        return this.fb.group({
            observacionCtrl: [''],
        });
    }

    get elemento(): FormGroup {
        const disabled = true;
        const form = this.fb.group({
            Id: [0],
            Placa: [
                {
                    value: '',
                    disabled: false,
                },
            ],
            entrada: [
                {
                    value: '',
                    disabled,
                },
            ],
            fechaEntrada: [
                {
                    value: '',
                    disabled,
                },
            ],
            salida: [
                {
                    value: '',
                    disabled,
                },
            ],
            fechaSalida: [
                {
                    value: '',
                    disabled,
                },
            ],
        });
        return form;
    }

    get columnsElementos(): string[] {
        return ['acciones', 'placa', 'entrada', 'fechaEntrada', 'salida', 'fechaSalida'];
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
