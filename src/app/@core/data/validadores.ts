import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable()
export class Validadores {

    static validateObjectCompleter(key: string, length: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const valor = control.value;
            const checkStringLength = typeof (valor) === 'string' && valor.length && valor.length < length;
            const checkInvalidString = typeof (valor) === 'string' && valor.length > length - 1;
            const checkInvalidObject = typeof (valor) === 'object' && valor && !valor[key];
            return (checkStringLength) ? { errorLongitudMinima: true } :
                (checkInvalidString || checkInvalidObject) ? { dependenciaNoValido: true } : null;
        };
    }

    static getValue(form: FormGroup, control: string) {
        return form.get(control).value;
    }

}
