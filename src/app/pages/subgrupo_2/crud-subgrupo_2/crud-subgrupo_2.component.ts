import { Subgrupo1, Subgrupo2 } from '../../../@core/data/models/catalogo/jerarquia';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_SUBGRUPO_2 } from './form-subgrupo_2';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-crud-subgrupo-2',
  templateUrl: './crud-subgrupo_2.component.html',
  styleUrls: ['./crud-subgrupo_2.component.scss'],
})
export class CrudSubgrupo2Component implements OnInit {
  config: ToasterConfig;
  subgrupo_2_id: number;

  @Input('subgrupo_2_id')
  set name(subgrupo_2_id: number) {
    this.subgrupo_2_id = subgrupo_2_id;
    this.loadSubgrupo2();
  }

  @Output() eventChange = new EventEmitter();

  info_subgrupo_2: Subgrupo2;
  formSubgrupo2: any;
  regSubgrupo2: any;
  clean: boolean;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
    ) {
    this.formSubgrupo2 = FORM_SUBGRUPO_2;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsSubgrupo1();
   }

  construirForm() {
    this.formSubgrupo2.titulo = this.translate.instant('GLOBAL.subgrupo_2');
    this.formSubgrupo2.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formSubgrupo2.campos.length; i++) {
      this.formSubgrupo2.campos[i].label = this.translate.instant('GLOBAL.' + this.formSubgrupo2.campos[i].label_i18n);
      this.formSubgrupo2.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formSubgrupo2.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsSubgrupo1(): void {
    let subgrupo1: Array<any> = [];
      this.catalogoElementosService.getSubgrupo()
        .subscribe(res => {
          if (res !== null) {
            subgrupo1 = <Array<Subgrupo1>>res;
          }
          this.formSubgrupo2.campos[ this.getIndexForm('Subgrupo') ].opciones = subgrupo1;
        });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formSubgrupo2.campos.length; index++) {
      const element = this.formSubgrupo2.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }


  public loadSubgrupo2(): void {
    if (this.subgrupo_2_id !== undefined && this.subgrupo_2_id !== 0) {
      this.catalogoElementosService.getSubgrupoById(this.subgrupo_2_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_subgrupo_2 = <Subgrupo2>res[0];
          }
        });
    } else  {
      this.info_subgrupo_2 = undefined;
      this.clean = !this.clean;
    }
  }

  updateSubgrupo2(subgrupo2: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update Subgrupo2!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    (Swal as any)(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_subgrupo_2 = <Subgrupo2>subgrupo2;
        this.catalogoElementosService.putSubgrupo(this.info_subgrupo_2, this.info_subgrupo_2.Id)
          .subscribe(res => {
            this.loadSubgrupo2();
            this.eventChange.emit(true);
            this.showToast('info', 'updated', 'Subgrupo2 updated');
          });
      }
    });
  }

  createSubgrupo2(subgrupo2: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create Subgrupo2!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    (Swal as any)(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_subgrupo_2 = <Subgrupo2>subgrupo2;
        this.catalogoElementosService.postSubgrupo(this.info_subgrupo_2)
          .subscribe(res => {
            this.info_subgrupo_2 = <Subgrupo2><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', 'created', 'Subgrupo2 created');
          });
      }
    });
  }

  ngOnInit() {
    this.loadSubgrupo2();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_subgrupo_2 === undefined) {
        this.createSubgrupo2(event.data.Subgrupo2);
      } else {
        this.updateSubgrupo2(event.data.Subgrupo2);
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
