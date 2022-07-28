import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ActaValidators {

  static validarTercero(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    const checkStringLength = typeof (valor) === 'string' && valor.length < 4 && valor !== '';
    const checkInvalidString = typeof (valor) === 'string' && valor !== '';
    const checkInvalidTercero = typeof (valor) === 'object' && !valor.Tercero;
    return checkStringLength ? { errorLongitudMinima: true } :
      checkInvalidString || checkInvalidTercero ? { terceroNoValido: true } : null;
  }

  static SelectValido(control: AbstractControl): ValidationErrors | null {
    if (control.value.value) {
      return null;
    } else {
      return {select_invalido: true};
    }
  }
}
