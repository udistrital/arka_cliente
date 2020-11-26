import { Grupo } from '../../../@core/data/models/catalogo/grupo';
import { Subgrupo, SubgrupoTransaccion } from '../../../@core/data/models/catalogo/subgrupo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { FORM_SUBGRUPO } from './form-subgrupo';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-crud-subgrupo',
  templateUrl: './crud-subgrupo.component.html',
  styleUrls: ['./crud-subgrupo.component.scss'],
})
export class CrudSubgrupoComponent implements OnInit {
  config: ToasterConfig;
  subgrupo_id: number;
  subgrupoPadre: any;

  @Input('subgrupo_id')
  set name(subgrupo_id: number) {
    this.subgrupo_id = subgrupo_id;
    this.loadSubgrupo();
  }

  @Input('subgrupo_Padre')
  set name2(subgrupo: any) {
    this.subgrupoPadre = subgrupo;
  }

  @Output() eventChange = new EventEmitter();
  @Output() mostrar = new EventEmitter();

  info_subgrupo: any;
  formSubgrupo: any;
  regSubgrupo: any;
  clean: boolean;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
  ) {
    this.formSubgrupo = FORM_SUBGRUPO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    this.construirForm();
    });
  }

  construirForm() {
    // TODO: Actualizar dinamicamente este texto:
    this.formSubgrupo.titulo = this.translate.instant('GLOBAL.subgrupo.segmento.nombre');
    this.formSubgrupo.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formSubgrupo.campos.length; i++) {
      this.formSubgrupo.campos[i].label = this.translate.instant('GLOBAL.' + this.formSubgrupo.campos[i].label_i18n);
      this.formSubgrupo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formSubgrupo.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsGrupo(): void {
    let grupo: Array<any> = [];
    this.catalogoElementosService.getGrupo()
      .subscribe(res => {
        if (res !== null) {
          grupo = <Array<Grupo>>res;
        }
        this.formSubgrupo.campos[this.getIndexForm('Grupo')].opciones = grupo;
      });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formSubgrupo.campos.length; index++) {
      const element = this.formSubgrupo.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }


  public loadSubgrupo(): void {
    if (this.subgrupo_id !== undefined && this.subgrupo_id !== 0) {
      this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
      this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';

      this.catalogoElementosService.getSubgrupoById(this.subgrupo_id)
        .subscribe(res => {
          if (Object.keys(res[0]).length !== 0) {
            this.info_subgrupo = <Subgrupo>res[0].SubgrupoHijoId;
            this.loadPrefixSuffixList();
            this.mostrar.emit(true);
          } else {
            this.info_subgrupo = undefined;
            this.clean = !this.clean;
            this.mostrar.emit(false);
          }
        });
    } else {
      this.info_subgrupo = undefined;
      this.clean = !this.clean;
    }
  }

  updateSubgrupo(subgrupo: any): void {
    // subgrupo.TipoNivelId = { Id: (this.subgrupoPadre.TipoNivelId.Id + 1) };

    const opt: any = {
      title: this.translate.instant('GLOBAL.Actualizar'),
      // TODO: Actualizar dinamicamente este texto:
      text: this.translate.instant('GLOBAL.subgrupo.segmento.pregunta_actualizar'),
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_subgrupo = <Subgrupo>subgrupo;
          this.catalogoElementosService.putSubgrupo(this.info_subgrupo, this.info_subgrupo.Id)
            .subscribe(res => {
              this.loadSubgrupo();
              this.eventChange.emit(true);
              this.showToast(
                'info',
                this.translate.instant('GLOBAL.Actualizado'),
                // TODO: Actualizar dinamicamente este texto:
                this.translate.instant('GLOBAL.subgrupo.segmento.respuesta_actualizar_ok'),
              );
            });
        }
      });
  }

  createSubgrupo(subgrupo: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.Crear'),
      // TODO: Actualizar dinamicamente este texto:
      text: this.translate.instant('GLOBAL.subgrupo.segmento.pregunta_crear'),
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          const subgrupoPost = new SubgrupoTransaccion;
          const subgrupoHijo = new Array<Subgrupo>();
          subgrupo.TipoBienId = this.subgrupoPadre.TipoBienId;
          subgrupo.Activo = true;
          // console.log(this.subgrupoPadre);
          subgrupo.TipoNivelId = { Id: (this.subgrupoPadre.TipoNivelId.Id + 1) };
          // subgrupo.Codigo = `${subgrupo.Codigo}`;
          subgrupoHijo.push(subgrupo);
          subgrupoPost.SubgrupoPadre = this.subgrupoPadre;
          subgrupoPost.SubgrupoHijo = subgrupoHijo;
          this.catalogoElementosService.postSubgrupo(subgrupoPost)
            .subscribe(res => {
              this.info_subgrupo = <Subgrupo><unknown>res;
              this.eventChange.emit(true);
              this.showToast('info', this.translate.instant('GLOBAL.Creado'),
                // TODO: Actualizar dinamicamente este texto:
                this.translate.instant('GLOBAL.subgrupo.segmento.respuesta_crear_ok'));
            });
        }
      });
  }

  ngOnInit() {
    this.loadSubgrupo();
    this.loadPrefixSuffixCreate();
}

  loadPrefixSuffixCreate () {
    if (this.subgrupoPadre !== undefined) {
      if (this.subgrupoPadre.TipoNivelId.Id === 1) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '0000';
      } else  if (this.subgrupoPadre.TipoNivelId.Id === 2) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupoPadre.Codigo.substring(0, 2);
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '00';
      } else if (this.subgrupoPadre.TipoNivelId.Id === 3) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupoPadre.Codigo.substring(0, 4);
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';
      } else {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';
      }
      this.construirForm();
    }
  }

  loadPrefixSuffixList () {
    if (this.info_subgrupo !== undefined) {
      if (this.info_subgrupo.TipoNivelId.Id === 2) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
        this.info_subgrupo.Codigo = this.info_subgrupo.Codigo.substring(0, 2);
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '0000';
      } else  if (this.info_subgrupo.TipoNivelId.Id === 3) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.info_subgrupo.Codigo.substring(0, 2);
        this.info_subgrupo.Codigo = this.info_subgrupo.Codigo.substring(2, 4);
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '00';
      } else if (this.info_subgrupo.TipoNivelId.Id === 4) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.info_subgrupo.Codigo.substring(0, 4);
        this.info_subgrupo.Codigo = this.info_subgrupo.Codigo.substring(4, 6);
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';
      } else {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';
      }
    }
  }


  validarForm(event) {
    if (event.valid) {
      if (/^[0-9]{2}/.test(event.data.Subgrupo.Codigo)) {
        if (this.info_subgrupo === undefined) {
          if (this.subgrupoPadre.TipoNivelId.Id === 1) {
            event.data.Subgrupo.Codigo = event.data.Subgrupo.Codigo + '0000';
          } else if (this.subgrupoPadre.TipoNivelId.Id === 2) {
            event.data.Subgrupo.Codigo = this.subgrupoPadre.Codigo.substring(0, 2) + event.data.Subgrupo.Codigo + '00';
            this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupoPadre.Codigo.substring(0, 2);
            } else if (this.subgrupoPadre.TipoNivelId.Id === 3) {
              event.data.Subgrupo.Codigo = this.subgrupoPadre.Codigo.substring(0, 4) + event.data.Subgrupo.Codigo;
              this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupoPadre.Codigo.substring(0, 4);
          }
          this.construirForm();
          this.createSubgrupo(event.data.Subgrupo);
        } else {
          this.updateSubgrupo(event.data.Subgrupo);
        }
      } else {
        (Swal as any).fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Inserte un código válido!',
          footer: '<a href>El código debe ser de dos dígitos</a>',
        });
      }
    }
  }

private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
    // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }

}

const FORM_SUBGRUPO = {
  titulo: 'Subgrupo1',
  tipo_formulario: 'mini',
  btn: 'Guardar',
  alertas: true,
  modelo: 'Subgrupo',
  campos: [
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-4 col-md-4 col-sm-4 col-xs-4',
      nombre: 'Codigo',
      label_i18n: 'codigo',
      placeholder: 'Ej.: 11',
      placeholder_i18n: 'codigo',
      requerido: true,
      tipo: 'text',
      maxlength: '2',
      valor: '2',
      prefix: {
        value: '',
      },
      suffix: {
        value: '',
      },
      pattern: {
        value: '^[0-9]{2}',
        message: '** Formato no válido. Ingrese dos dígitos',
    },
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-8 col-md-8 col-sm-8 col-xs-8',
      nombre: 'Nombre',
      label_i18n: 'nombre',
      placeholder_i18n: 'nombre',
      requerido: true,
      tipo: 'text',
    },
    {
      etiqueta: 'input',
      claseGrid: 'col-lg-12 col-md-12 col-sm-12 col-xs-12',
      nombre: 'Descripcion',
      label_i18n: 'descripcion',
      placeholder_i18n: 'descripcion',
      requerido: true,
      tipo: 'text',
    },
  ],
};
