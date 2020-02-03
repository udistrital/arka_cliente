import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-ajustar-cantidad',
  templateUrl: './ajustar-cantidad.component.html',
  styleUrls: ['./ajustar-cantidad.component.scss']
})
export class AjustarCantidadComponent implements OnInit {

  @Input() row: any;
  @ViewChild('fform') firstFormDirective;
  form_cantidad: FormGroup;

  constructor(
    protected ref: NbDialogRef<AjustarCantidadComponent>,
    private fb: FormBuilder,
    ) {
  }

  cancel() {
    this.ref.close();
  }

  prueba() {
    console.log(this.form_cantidad.get('Cantidad').validator);
  }
  submit() {

    this.row.CantidadAprobada = this.form_cantidad.get('Cantidad').value
    this.ref.close(this.row);
  }

  ngOnInit() {

   this.form_cantidad = this.fb.group({
    Cantidad: ['', [Validators.required, Validators.max(this.row.Cantidad), Validators.max(this.row.SaldoCantidad)]],
  });
  }

}
