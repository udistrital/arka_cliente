import { AbstractControl } from "@angular/forms";

export class ActaValidators {
  static SelectValido(control: AbstractControl) {
    if (control.value.value) {
      return null;
    } else {
      return {select_invalido: true};
    }
  }
}
