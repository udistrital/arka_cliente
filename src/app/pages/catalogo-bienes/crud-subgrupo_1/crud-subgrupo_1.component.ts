import { Grupo } from '../../../@core/data/models/catalogo/grupo';
import { Subgrupo, SubgrupoTransaccion } from '../../../@core/data/models/catalogo/subgrupo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_SUBGRUPO_1 } from './form-subgrupo_1';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-crud-subgrupo-1',
  templateUrl: './crud-subgrupo_1.component.html',
  styleUrls: ['./crud-subgrupo_1.component.scss'],
})
export class CrudSubgrupo1Component implements OnInit {
  config: ToasterConfig;
  subgrupo_1_id: number;
  subgrupoPadre: any;

  @Input('subgrupo_1_id')
  set name(subgrupo_1_id: number) {
    this.subgrupo_1_id = subgrupo_1_id;
    this.loadSubgrupo1();
  }

  @Input('subgrupo_Padre')
  set name2(subgrupo: any) {
    this.subgrupoPadre = subgrupo;
  }

  @Output() eventChange = new EventEmitter();
  @Output() mostrar = new EventEmitter();

  info_subgrupo_1: Subgrupo;
  formSubgrupo1: any;
  regSubgrupo1: any;
  clean: boolean;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
  ) {
    this.formSubgrupo1 = FORM_SUBGRUPO_1;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  construirForm() {
    this.formSubgrupo1.titulo = this.translate.instant('GLOBAL.subgrupo_1');
    this.formSubgrupo1.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formSubgrupo1.campos.length; i++) {
      this.formSubgrupo1.campos[i].label = this.translate.instant('GLOBAL.' + this.formSubgrupo1.campos[i].label_i18n);
      this.formSubgrupo1.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formSubgrupo1.campos[i].label_i18n);
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
        this.formSubgrupo1.campos[this.getIndexForm('Grupo')].opciones = grupo;
      });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formSubgrupo1.campos.length; index++) {
      const element = this.formSubgrupo1.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }


  public loadSubgrupo1(): void {
    if (this.subgrupo_1_id !== undefined && this.subgrupo_1_id !== 0) {
      this.catalogoElementosService.getSubgrupoById(this.subgrupo_1_id)
        .subscribe(res => {
          if (Object.keys(res[0]).length !== 0) {
            this.info_subgrupo_1 = <Subgrupo>res[0].SubgrupoHijoId;
            this.mostrar.emit(true);
          } else {
            this.info_subgrupo_1 = undefined;
            this.clean = !this.clean;
            this.mostrar.emit(false);

          }
        });
    } else {
      this.info_subgrupo_1 = undefined;
      this.clean = !this.clean;
    }
  }

  updateSubgrupo1(subgrupo1: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update Subgrupo!',
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_subgrupo_1 = <Subgrupo>subgrupo1;
          this.catalogoElementosService.putSubgrupo(this.info_subgrupo_1, this.info_subgrupo_1.Id)
            .subscribe(res => {
              this.loadSubgrupo1();
              this.eventChange.emit(true);
              this.showToast('info', 'updated', 'Subgrupo1 updated');
            });
        }
      });
  }

  createSubgrupo1(subgrupo: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create Subgrupo!',
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          const subgrupoPost = new SubgrupoTransaccion;
          const subgrupoHijo = new Array<Subgrupo>();
          subgrupo.TipoBienId = this.subgrupoPadre.TipoBienId;
          subgrupoHijo.push(subgrupo);
          subgrupoPost.SubgrupoPadre = this.subgrupoPadre;
          subgrupoPost.SubgrupoHijo = subgrupoHijo;
          this.catalogoElementosService.postSubgrupo(subgrupoPost)
            .subscribe(res => {
              this.info_subgrupo_1 = <Subgrupo><unknown>res;
              this.eventChange.emit(true);
              this.showToast('info', 'created', 'Subgrupo1 created');
            });
        }
      });
  }

  ngOnInit() {
    this.loadSubgrupo1();
  }

  validarForm(event) {
    // console.log(event);
    if (event.valid) {
      if (this.info_subgrupo_1 === undefined) {
        this.createSubgrupo1(event.data.Subgrupo);
      } else {
        this.updateSubgrupo1(event.data.Subgrupo);
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
