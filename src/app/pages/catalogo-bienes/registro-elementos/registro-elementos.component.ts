import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { ToasterService } from 'angular2-toaster';
import { PopUpManager } from '../../../managers/popUpManager';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { FORM_ELEMENTO } from './form-elemento';
import { Elemento } from '../../../@core/data/models/catalogo/elemento';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-registro-elementos',
  templateUrl: './registro-elementos.component.html',
  styleUrls: ['./registro-elementos.component.scss'],
})
export class RegistroElementosComponent implements OnInit {

  @Output() updateTree = new EventEmitter();
  formElemento: any;
  info_elemento: Elemento;
  clean: boolean;
  catalogos: Array<Catalogo>;
  catalogoId: number;
  subgrupo: Subgrupo;
  ver_formulario: boolean;
  cargando_catalogos: boolean = true;

  constructor(private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
    private pUpManager: PopUpManager) {
    this.formElemento = FORM_ELEMENTO;
    this.construirForm();
    this.catalogos = new Array<Catalogo>();
    this.catalogoId = 0;
    this.loadCatalogos();
  }

  ngOnInit() {
  }

  construirForm() {
    this.formElemento.titulo = this.translate.instant('GLOBAL.registrar_elementos');
    this.formElemento.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formElemento.campos.length; i++) {
      this.formElemento.campos[i].label = this.translate.instant('GLOBAL.' + this.formElemento.campos[i].label_i18n);
      this.formElemento.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formElemento.campos[i].label_i18n);
    }
  }

  loadCatalogos() {
    this.catalogoElementosService.getCatalogo().subscribe((res) => {
      if (res !== null) {
        const data = <Array<Catalogo>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos)) {
            this.catalogos.push(data[datos]);
          }
        }
        this.cargando_catalogos = false;
      }
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  onChange(catalogo) {
    this.ver_formulario = false;
    this.catalogoId = catalogo;
  }

  treeEvent(event) {
    if (event.hasOwnProperty('TipoNivelId')
      && event.TipoNivelId.hasOwnProperty('Id')
      && event.TipoNivelId.Id === Nivel_t.Clase) {
      this.cleanForm();
      this.formElemento.campos[0].prefix.value = event.Codigo;
      this.info_elemento = undefined;
      this.subgrupo = event;
      this.ver_formulario = true;
    } else if (event.hasOwnProperty('SubgrupoId') && event.hasOwnProperty('Id')) {
      this.info_elemento = new Elemento;
      this.formElemento.campos[0].prefix.value = event.SubgrupoId.Codigo;
      this.info_elemento.Id = event.Id;
      this.info_elemento.Nombre = event.Nombre;
      this.info_elemento.Codigo = event.Codigo.substring(6, 8);
      this.info_elemento.Descripcion = event.Descripcion;
      this.info_elemento.SubgrupoId = event.SubgrupoId;
      this.info_elemento.Activo = event.Activo;
      this.info_elemento.FechaCreacion = event.FechaCreacion;
      this.info_elemento.FechaModificacion = event.FechaModificacion;
      this.subgrupo = event.SubgrupoId;
      this.ver_formulario = true;
    } else {
      this.cleanForm();
      this.info_elemento = undefined;
      this.ver_formulario = false;
      this.subgrupo = undefined;
    }
  }

  submitElemento(event) {
    const post = this.info_elemento === undefined ? true : false;
    (Swal as any).fire({
      title: this.translate.instant(post ? 'GLOBAL.catalogo.forms.titPostElemento' :
        'GLOBAL.catalogo.forms.titPutElemento'),
      text: this.translate.instant(post ? 'GLOBAL.catalogo.forms.textPostElemento' :
        'GLOBAL.catalogo.forms.textPutElemento', { NOM: event.data.Grupo.Nombre }),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        event.data.Grupo.Codigo = this.subgrupo.Codigo + event.data.Grupo.Codigo;
        if (post) {
          const elemento = new Elemento;
          elemento.Nombre = event.data.Grupo.Nombre;
          elemento.Descripcion = event.data.Grupo.Descripcion;
          elemento.Codigo = event.data.Grupo.Codigo;
          elemento.Activo = event.data.Grupo.Activo;
          elemento.SubgrupoId = this.subgrupo;
          this.catalogoElementosService.postElemento(elemento).toPromise().then(res => {
            if (res !== null) {
              (Swal as any).fire({
                type: 'success',
                title: this.translate.instant('GLOBAL.catalogo.forms.titPostElemento'),
                text: this.translate.instant('GLOBAL.catalogo.forms.textPostElementoOk', { NOM: event.data.Grupo.Nombre }),
                showConfirmButton: false,
                timer: 2500,
              });
              this.cleanForm();
              this.subgrupo = undefined;
              this.ver_formulario = false;
              this.updateTree.emit(true);
            } else {
              this.errorSubmit(post);
            }
          });
        } else {
          this.catalogoElementosService.putElemento(event.data.Grupo).toPromise().then(res => {
            if (res !== null) {
              (Swal as any).fire({
                type: 'success',
                title: this.translate.instant('GLOBAL.catalogo.forms.titPutElemento'),
                text: this.translate.instant('GLOBAL.catalogo.forms.textPutElementoOk', { NOM: event.data.Grupo.Nombre }),
                showConfirmButton: false,
                timer: 2500,
              });
              this.cleanForm();
              this.subgrupo = undefined;
              this.ver_formulario = false;
              this.updateTree.emit(true);
            } else {
              this.errorSubmit(post);
            }
          });
        }
      }
    });
  }

  private errorSubmit(post: boolean) {
    (Swal as any).fire({
      type: 'error',
      title: this.translate.instant(post ? 'GLOBAL.catalogo.forms.titPostElemento' : 'GLOBAL.catalogo.forms.titPutElemento'),
      text: this.translate.instant(post ? 'GLOBAL.catalogo.forms.textPostElementoErr' : 'GLOBAL.catalogo.forms.textPostElementoErr'),
      showConfirmButton: false,
      timer: 2500,
    });
  }

  cleanForm() {
    this.clean = !this.clean;
    this.info_elemento = undefined;
  }

}
