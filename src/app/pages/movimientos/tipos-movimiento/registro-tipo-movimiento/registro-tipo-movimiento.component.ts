import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FORM_TIPO_MOVIMIENTO } from './form-tipo-movimiento';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TipoMovimientoArka } from '../../../../@core/data/models/movimientos';

@Component({
  selector: 'ngx-registro-tipo-movimiento',
  templateUrl: './registro-tipo-movimiento.component.html',
  styleUrls: ['./registro-tipo-movimiento.component.scss'],
})
export class RegistroTipoMovimientoComponent implements OnInit  {
  cargando: boolean = false;
  formTipoMovimiento: any;

  @Input () tipomovimiento: TipoMovimientoArka;
  @Output() tipomovimientoChange = new EventEmitter<TipoMovimientoArka>();
  @Output() Guardar = new EventEmitter<undefined>();

  constructor(
    private translate: TranslateService,
    ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.construirForm();
  }
  construirForm() {
    const titulo = 'FORMULARIO TB';
    this.formTipoMovimiento = FORM_TIPO_MOVIMIENTO;
  }
  validarForm(event) {
    if (event.valid) {
      this.Guardar.emit();
      // console.log(event.data.TipoMovimiento);
      this.registrarTipoMovimiento(event.data.TipoMovimiento);
    }
  }
  registrarTipoMovimiento(formData: any) {
    // console.log(formData);
    this.tipomovimientoChange.emit(formData);
  }
}
