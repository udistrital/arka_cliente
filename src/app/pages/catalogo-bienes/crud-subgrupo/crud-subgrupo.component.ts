import { Grupo, Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { SubgrupoTransaccion } from '../../../@core/data/models/catalogo/transacciones';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_SUBGRUPO } from './form-subgrupo';
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

  info_subgrupo: Subgrupo;
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
      this.catalogoElementosService.getSubgrupoById(this.subgrupo_id)
        .subscribe(res => {
          if (Object.keys(res[0]).length !== 0) {
            this.info_subgrupo = <Subgrupo>res[0].SubgrupoHijoId;
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
          subgrupoHijo.push(subgrupo);
          subgrupoPost.SubgrupoPadre = this.subgrupoPadre;
          subgrupoPost.SubgrupoHijo = subgrupoHijo;
          this.catalogoElementosService.postSubgrupo(subgrupoPost)
            .subscribe(res => {
              this.info_subgrupo = <Subgrupo><unknown>res;
              this.eventChange.emit(true);
              this.showToast('info', this.translate.instant('GLOBAL.Creado'),
                // TODO: Actualizar dinamicamente este texto:
                this.translate.instant('GLOBAL.subgrupo.segmento.respuesta_crear_ok') );
            });
        }
      });
  }

  ngOnInit() {
    this.loadSubgrupo();
  }

  validarForm(event) {
    // console.log(event);
    if (event.valid) {
      if (this.info_subgrupo === undefined) {
        this.createSubgrupo(event.data.Subgrupo);
      } else {
        this.updateSubgrupo(event.data.Subgrupo);
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
