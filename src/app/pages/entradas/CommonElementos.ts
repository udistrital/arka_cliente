import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilidadesService } from '../../@core/utils';
import { ActaRecibidoHelper } from '../../helpers/acta_recibido/actaRecibidoHelper';
import { MovimientosHelper } from '../../helpers/movimientos/movimientosHelper';
import { PopUpManager } from '../../managers/popUpManager';

@Injectable()
export class CommonElementos {

    constructor(
        private actaRecibidoHelper: ActaRecibidoHelper,
        private fb: FormBuilder,
        private translate: TranslateService,
        private utils: UtilidadesService,
        private movimientos: MovimientosHelper,
        private pUpManager: PopUpManager,
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

    public getDetalleElemento(form: FormGroup, index: number, paginator: MatPaginator, tipoEntrada: string) {
        const Id = this.getFormArrayAtIndex(form, this.getActualIndex(index, paginator)).value.Placa.Id;
        this.patchFormArrayAtIndex(form, index, { Id: 0 });

        this.movimientos.getHistorialElemento(Id, true, true, tipoEntrada === 'ENT_PPA' || tipoEntrada === 'ENT_RP')
            .subscribe(res => {

                if (!this.checkSalidaHistorial(res)) {
                    this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.errorPlaca'));
                    return;
                }

                if ((tipoEntrada === 'ENT_PPA' || tipoEntrada === 'ENT_AM') && this.checkBajaHistorial(res)) {
                    this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errores.elementoConBaja'));
                    return;
                }

                if (tipoEntrada === 'ENT_PPA' && this.checkEntradaHistorial(res, tipoEntrada)) {
                    this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errores.elementoAprAprovechado'));
                    return;
                }


                if (tipoEntrada === 'ENT_RP') {
                    if (!this.checkBajaAprobadaHistorial(res)) {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errores.elementoSinBaja'));
                        return;
                    }

                    if (this.checkEntradaHistorial(res, tipoEntrada)) {
                        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errores.elementoRepRepuesto'));
                        return;
                    }
                }

                this.patchFormArrayAtIndex(form, index, this.fillDetalleElemento(res));
            });
    }

    public removeElemento(index: number, form: FormGroup, dataSource: MatTableDataSource<any>, paginator: MatPaginator) {
        index = this.getActualIndex(index, paginator);
        (form.get('elementos') as FormArray).removeAt(index);
        const data = dataSource.data;
        data.splice(index, 1);
        dataSource.data = data;
    }

    private getActualIndex(index: number, paginator: MatPaginator) {
        return index + paginator.pageSize * paginator.pageIndex;
    }

    private patchFormArrayAtIndex(form: FormGroup, index: number, value: any) {
        this.getFormArrayAtIndex(form, index).patchValue(value);
    }

    private getFormArrayAtIndex(form: FormGroup, index: number) {
        return (form.get('elementos') as FormArray).at(index);
    }

    private checkSalidaHistorial(historial: any) {
        return historial && historial.Elemento && historial.Salida && historial.Salida.EstadoMovimientoId.Nombre === 'Salida Aprobada';
    }

    private checkEntradaHistorial(historial: any, entrada: string) {
        return historial && historial.Entradas && historial.Entradas.length &&
            historial.Entradas.some(e => e.FormatoTipoMovimientoId.CodigoAbreviacion === entrada);
    }

    private checkBajaHistorial(historial: any) {
        return historial && historial.Baja && historial.Baja.Id;
    }

    private checkBajaAprobadaHistorial(historial: any) {
        return this.checkBajaHistorial(historial) && historial.Baja.EstadoMovimientoId.Nombre === 'Baja Aprobada';
    }

    private fillDetalleElemento(historial: any): any {
        return {
            Id: historial.Elemento.Id,
            entrada: this.getConsecutivoEntrada(historial),
            fechaEntrada: this.utils.formatDate(historial.Salida.MovimientoPadreId.FechaCreacion),
            salida: this.getConsecutivoSalida(historial),
            fechaSalida: this.utils.formatDate(historial.Salida.FechaCreacion),
        };
    }

    private getConsecutivoEntrada(historial: any): string {
        return this.utils.getKeyFromString(historial.Salida.MovimientoPadreId.Detalle, 'consecutivo');
    }

    private getConsecutivoSalida(historial: any): string {
        return this.utils.getKeyFromString(historial.Salida.Detalle, 'consecutivo');
    }

    get formElementos(): FormGroup {
        return this.fb.group({
            elementos: this.fb.array([], { validators: this.validateElementos() }),
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

}
