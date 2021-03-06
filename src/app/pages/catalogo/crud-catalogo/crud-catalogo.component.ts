import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_CATALOGO } from './form-catalogo';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import {Router} from '@angular/router';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-crud-catalogo',
  templateUrl: './crud-catalogo.component.html',
  styleUrls: ['./crud-catalogo.component.scss'],
})
export class CrudCatalogoComponent implements OnInit {
  config: ToasterConfig;
  catalogo_id: number;
  myParam: string;

  @Input('catalogo_id')
  set name(catalogo_id: number) {
    this.catalogo_id = catalogo_id;
    this.loadCatalogo();
  }

  @Output() eventChange = new EventEmitter();

  info_catalogo: Catalogo;
  formCatalogo: any;
  regCatalogo: any;
  clean: boolean;
  cargando: boolean = true;
  titulo: string = '';

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
    public router: Router,
    ) {
    this.formCatalogo = FORM_CATALOGO;
    if (this.router.getCurrentNavigation().extras.state !== undefined) {
      this.catalogo_id = this.router.getCurrentNavigation().extras.state.example;
    }
  }

  ngOnInit() {
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadCatalogo();
  }

  construirForm() {
    this.formCatalogo.titulo = this.translate.instant('GLOBAL.catalogo.uno');
    this.formCatalogo.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formCatalogo.campos.length; i++) {
      this.formCatalogo.campos[i].label = this.translate.instant('GLOBAL.' + this.formCatalogo.campos[i].label_i18n);
      this.formCatalogo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formCatalogo.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }


  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formCatalogo.campos.length; index++) {
      const element = this.formCatalogo.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }


  public loadCatalogo(): void {
    if (this.catalogo_id !== undefined && this.catalogo_id !== 0) {
      this.catalogoElementosService.getCatalogoById(this.catalogo_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_catalogo = <Catalogo>res;
          }
          this.titulo = this.translate.instant('GLOBAL.catalogo.editar_nombre', {NOMBRE: this.info_catalogo.Nombre});
          this.cargando = false;
        });
    } else  {
      this.info_catalogo = undefined;
      this.clean = !this.clean;
      this.titulo = this.translate.instant('GLOBAL.catalogo.crear');
      this.cargando = false;
    }
  }

  updateCatalogo(catalogo: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.Actualizar'),
      text: this.translate.instant('GLOBAL.Actualizar_Catalogo_placeholder'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_catalogo = <Catalogo>catalogo;
        this.catalogoElementosService.putCatalogo(this.info_catalogo, this.info_catalogo.Id)
          .subscribe(res => {
            this.loadCatalogo();
            this.eventChange.emit(true);
            this.showToast('info', this.translate.instant('GLOBAL.Actualizado'), this.translate.instant('GLOBAL.Actualizado_Catalogo_placeholder'));
          });
      }
    });
  }

  createCatalogo(catalogo: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.Crear'),
      text: this.translate.instant('GLOBAL.Crear_Catalogo_placeholder'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
    .then((willDelete) => {
      if (willDelete.value) {
        this.info_catalogo = <Catalogo>catalogo;
        // console.log(this.info_catalogo);
        this.catalogoElementosService.postCatalogo(this.info_catalogo)
          .subscribe(res => {
            this.info_catalogo = <Catalogo><unknown>res;
            this.eventChange.emit(true);
            this.showToast('info', this.translate.instant('GLOBAL.Creado'), this.translate.instant('GLOBAL.Creado_Catalogo_placeholder'));
          });
      }
    });
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_catalogo === undefined) {
        this.createCatalogo(event.data.Catalogo);
      } else {
        this.updateCatalogo(event.data.Catalogo);
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
    this.volver();
  }

  volver() {
    this.router.navigate(['/pages/catalogo/list-catalogo']);
  }

}
