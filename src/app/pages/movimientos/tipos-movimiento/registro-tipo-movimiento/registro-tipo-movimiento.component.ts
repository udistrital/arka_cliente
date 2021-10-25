import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FORM_TIPO_BIEN } from './form-tipo-bien';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TipoBien} from '../../../../@core/data/models/acta_recibido/tipo_bien';

@Component({
  selector: 'ngx-registro-tipo-movimiento',
  templateUrl: './registro-tipo-movimiento.component.html',
  styleUrls: ['./registro-tipo-movimiento.component.scss']
})
export class RegistroTipoMovimientoComponent implements OnInit  {
  cargando: boolean = false;
  formTipoBien: any;

  @Input () tipobien: TipoBien;
  @Output() tipobienChange = new EventEmitter<TipoBien>();
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
    this.formTipoBien = FORM_TIPO_BIEN;
  }
  validarForm(event) {
    if (event.valid) {
      this.Guardar.emit();
      this.registrarTipoBien(event.data.TipoBien);
    }
  }
  registrarTipoBien(formData: any) {
    // console.log(formData);
    this.tipobienChange.emit(formData);
  }
}
