import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FORM_TIPO_BIEN } from './form-tipo-bien';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TipoBien} from '../../../../@core/data/models/acta_recibido/tipo_bien';
import { CatalogoElementosHelper } from '../../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-registro-tipo-bien',
  templateUrl: './registro-tipo-bien.component.html',
  styleUrls: ['./registro-tipo-bien.component.scss'],
})
export class RegistroTipoBienComponent implements OnInit {
  cargando: boolean = false;
  formTipoBien: any;
  tiposBien: Array<TipoBien>;

  @Input () tipobien: TipoBien;
  @Output() tipobienChange = new EventEmitter<TipoBien>();
  @Output() Guardar = new EventEmitter<undefined>();

  constructor(
    private catalogoElementosService: CatalogoElementosHelper,
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
    this.formTipoBien.titulo = this.translate.instant('GLOBAL.tipo_bien');
    this.formTipoBien.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formTipoBien.campos.length; i++) {
      this.formTipoBien.campos[i].label = this.translate.instant('GLOBAL.' + this.formTipoBien.campos[i].label_i18n);
      this.formTipoBien.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formTipoBien.campos[i].label_i18n);
    }
    this.loadTiposBien();
  }
  loadTiposBien(): void {
    this.catalogoElementosService.getTipoBien().toPromise().then(res => {
      if (res !== null) {
        this.tiposBien = res;
        this.formTipoBien.campos[this.getIndexForm('Tipo_bien_padre')].opciones = this.tiposBien ? this.tiposBien : null;
      }
    });
  }
  validarForm(event) {
    if (event.valid) {
      // console.log(event.data.TipoBien)
      this.Guardar.emit();
      this.registrarTipoBien(event.data.TipoBien);
    }
  }
  registrarTipoBien(formData: any) {
    // console.log(formData);
    this.tipobienChange.emit(formData);
  }
  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTipoBien.campos.length; index++) {
      const element = this.formTipoBien.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }
}
