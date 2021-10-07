import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FORM_TIPO_BIEN } from './form-tipo-bien';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TipoBien} from '../../../../@core/data/models/acta_recibido/tipo_bien';

@Component({
  selector: 'ngx-registro-tipo-bien',
  templateUrl: './registro-tipo-bien.component.html',
  styleUrls: ['./registro-tipo-bien.component.scss'],
})
export class RegistroTipoBienComponent implements OnInit {
  cargando: boolean = false;
  formTipoBien: any;

  @Input('registrar') registrar: boolean;

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.construirForm();
    // console.log(this.formTipoBien)
  }
  construirForm() {
    const titulo = 'FORMULARIO TB';
    this.formTipoBien = FORM_TIPO_BIEN;
  }

}
