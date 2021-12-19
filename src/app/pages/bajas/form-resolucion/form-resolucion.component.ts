import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngx-form-resolucion',
  templateUrl: './form-resolucion.component.html',
  styleUrls: ['./form-resolucion.component.scss'],
})
export class FormResolucionComponent implements OnInit {

  formResolucion: FormGroup;
  @Output() resolucionData = new EventEmitter<any>();
  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.buildForm();
  }

  get resolucion(): FormGroup {
    const form = this.fb.group({
      fecha: ['', Validators.required],
      numero: ['', Validators.required],
    });
    return form;
  }

  private buildForm(): void {
    this.formResolucion = this.fb.group({
      fecha: ['', Validators.required],
      numero: ['', Validators.required],
    });
  }

  public submitForm(volver: boolean = false) {
    if (volver) {
      this.resolucionData.emit(true);
    } else {
      this.resolucionData.emit(this.formResolucion.value);
    }
  }
}
