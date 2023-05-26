import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable()
export class Validadores {

    static validateObjectCompleter(key: string, length: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const valor = control.value;
            if (!valor) {
                return null;
            }

            const checkMinLength = typeof (valor) === 'string' && valor.length && valor.length < length;
            if (checkMinLength) {
                return { errorLongitudMinima: true };
            }

            const checkNoSelected = typeof (valor) === 'string';
            const checkInvalidObject = typeof (valor) === 'object' && !valor[key];
            if (checkNoSelected || checkInvalidObject) {
                return { noSeleccionado: true };
            }

            return null;
        };
    }

    static getValue(form: FormGroup, control: string) {
        return form.get(control).value;
    }

}
