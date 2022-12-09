import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_CATALOGO } from './form-catalogo';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-crud-catalogo',
  templateUrl: './crud-catalogo.component.html',
  styleUrls: ['./crud-catalogo.component.scss'],
})
export class CrudCatalogoComponent implements OnInit {

  @Input() catalogo_id: number;
  @Output() eventChange = new EventEmitter();

  info_catalogo: Catalogo;
  formCatalogo: any;
  clean: boolean;
  cargando: boolean = true;
  titulo: string = '';

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    public router: Router,
    private pUpManager: PopUpManager,
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

  public loadCatalogo(): void {
    if (this.catalogo_id !== undefined && this.catalogo_id !== 0) {
      this.catalogoElementosService.getCatalogoById(this.catalogo_id)
        .subscribe(res => {
          this.cargando = false;
          if (res.Id) {
            this.info_catalogo = <Catalogo>res;
            this.titulo = this.translate.instant('GLOBAL.catalogo.editar_nombre', { NOMBRE: this.info_catalogo.Nombre });
          } else {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.catalogo.noExiste'));
            this.volver();
          }
        });
    } else {
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
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };

    this.pUpManager.showAlertWithOptions(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_catalogo = <Catalogo>catalogo;
          this.catalogoElementosService.putCatalogo(this.info_catalogo, this.info_catalogo.Id)
            .subscribe((res: any) => {
              this.cargando = false;
              if (res.Id) {
                this.loadCatalogo();
                this.eventChange.emit(true);
                this.showToast('success',
                  this.translate.instant('GLOBAL.Actualizado'),
                  this.translate.instant('GLOBAL.Actualizado_Catalogo_placeholder'));
              } else {
                this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.catalogo.noExiste'));
              }
            });
        }
      });
  }

  createCatalogo(catalogo: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.Crear'),
      text: this.translate.instant('GLOBAL.Crear_Catalogo_placeholder'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };

    this.pUpManager.showAlertWithOptions(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_catalogo = <Catalogo>catalogo;
          this.catalogoElementosService.postCatalogo(this.info_catalogo)
            .subscribe((res: any) => {
              if (res.Id) {
                this.info_catalogo = <Catalogo>res;
                this.eventChange.emit(true);
                this.showToast('success',
                  this.translate.instant('GLOBAL.Creado'),
                  this.translate.instant('GLOBAL.Creado_Catalogo_placeholder'));
              } else {
                this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.catalogo.errCrear'));
              }
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

  private showToast(type: string, title: string, text: string) {
    const opt = {
      title,
      text,
      type,
    };
    this.pUpManager.showAlertWithOptions(opt);
    this.volver();
  }

  volver() {
    this.router.navigate(['/pages/catalogo/list-catalogo']);
  }

}
