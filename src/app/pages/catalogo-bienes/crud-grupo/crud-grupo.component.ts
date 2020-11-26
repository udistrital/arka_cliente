import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { Grupo, GrupoTransaccion, Detalle, Grupo2 } from '../../../@core/data/models/catalogo/grupo';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { FORM_GRUPO } from './form-grupo';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Dependencia } from '../../../@core/data/models/acta_recibido/soporte_acta';


@Component({
  selector: 'ngx-crud-grupo',
  templateUrl: './crud-grupo.component.html',
  styleUrls: ['./crud-grupo.component.scss'],
})
export class CrudGrupoComponent implements OnInit {
  config: ToasterConfig;
  grupo_id: number;
  catalogoid: any;
  detalle_id: number;

  @Input('grupo_id')
  set name(grupo_id: number) {
    this.grupo_id = grupo_id;
    this.loadGrupo();
  }

  @Input('catalogo_id')
  set name2(grupo_id: number) {
    this.catalogoid = grupo_id;
  }

  @Output() eventChange = new EventEmitter();
  @Output() mostrar = new EventEmitter();

  info_grupo: Grupo2;
  formGrupo: any;
  regGrupo: any;
  clean: boolean;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
  ) {
    this.formGrupo = FORM_GRUPO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsCatalogo();
  }

  construirForm() {
    this.formGrupo.titulo = this.translate.instant('GLOBAL.subgrupo.grupo.nombre');
    this.formGrupo.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formGrupo.campos.length; i++) {
      this.formGrupo.campos[i].label = this.translate.instant('GLOBAL.' + this.formGrupo.campos[i].label_i18n);
      this.formGrupo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formGrupo.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptionsCatalogo(): void {
    let Tipo_Bien: Array<any> = [];
    this.catalogoElementosService.getTipoBien()
      .subscribe(res => {
        if (res !== null) {
          Tipo_Bien = <Array<TipoBien>>res;
        }
        this.formGrupo.campos[this.getIndexForm('TipoBienId')].opciones = Tipo_Bien;
      });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formGrupo.campos.length; index++) {
      const element = this.formGrupo.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }


  public loadGrupo(): void {
    if (this.grupo_id !== undefined && this.grupo_id !== 0) {
      this.catalogoElementosService.getGrupoTransaccionById(this.grupo_id)
        .subscribe(res => {
          if (Object.keys(res[0]).length !== 0) {
            const detalle = <Detalle>res[0].Detalle;
            const subgrupo = <Grupo>res[0].Subgrupo;
            // console.log(detalle);
            // console.log(subgrupo);
            const info__grupo = new Grupo2;
            this.detalle_id = detalle.Id;
            info__grupo.Descripcion = subgrupo.Descripcion;
            info__grupo.Nombre = subgrupo.Nombre;
            info__grupo.Codigo = subgrupo.Codigo;
            info__grupo.TipoBienId = detalle.TipoBienId;
            info__grupo.Depreciacion = detalle.Depreciacion;
            info__grupo.Valorizacion = detalle.Valorizacion;
            this.info_grupo = info__grupo;
            // console.log(res)
            this.mostrar.emit(true);
          } else {
            this.info_grupo = undefined;
            this.clean = !this.clean;
            this.mostrar.emit(false);
          }
        });
    } else {
      // this.info_grupo = undefined;
      this.clean = !this.clean;
    }
  }

  updateGrupo(grupo: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.Actualizar'),
      text: this.translate.instant('GLOBAL.subgrupo.grupo.pregunta_actualizar'),
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_grupo = <Grupo2>grupo;

          const grupoPut = new GrupoTransaccion;
          const catalogo = new Catalogo;
          const detalle = new Detalle;

          catalogo.Id = parseFloat(this.catalogoid as string);
          grupo.Activo = true;
          grupo.Id = this.grupo_id;
          detalle.Depreciacion = grupo.Depreciacion;
          detalle.Valorizacion = grupo.Valorizacion;
          detalle.TipoBienId = grupo.TipoBienId;
          detalle.SubgrupoId = grupo;
          detalle.Activo = true;
          detalle.Id = this.detalle_id;

          grupoPut.Catalogo = catalogo;
          grupoPut.Subgrupo = grupo;
          grupoPut.DetalleSubgrupo = detalle;
          // console.log(this.grupo_id);
          // console.log(grupoPut);
          this.catalogoElementosService.putGrupo(grupoPut, grupo.Id)
            .subscribe(res => {
              // console.log(res);
              this.info_grupo = <Grupo2><unknown>res;
              this.showToast('info',
                this.translate.instant('GLOBAL.Actualizado'),
                this.translate.instant('GLOBAL.subgrupo.grupo.respuesta_actualizar_ok'));
              // this.loadGrupo();
              this.eventChange.emit(true);

            });
        }
      });
  }

  createGrupo(grupo: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.Crear'),
      text: this.translate.instant('GLOBAL.subgrupo.grupo.pregunta_crear'),
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          const grupoPost = new GrupoTransaccion;
          const catalogo = new Catalogo;
          const detalle = new Detalle;

          catalogo.Id = parseFloat(this.catalogoid);
          grupo.Activo = true;
          grupo.TipoNivelId = { Id: 1 };

          if (grupo.Depreciacion === '') {
            grupo.Depreciacion = false;
          }
          if (grupo.Valorizacion === '') {
            grupo.Valorizacion = false;
          }

          detalle.Depreciacion = grupo.Depreciacion;
          detalle.Valorizacion = grupo.Valorizacion;
          detalle.TipoBienId = grupo.TipoBienId;

          grupoPost.Catalogo = catalogo;
          grupoPost.Subgrupo = grupo;
          grupoPost.DetalleSubgrupo = detalle;
          // console.log(grupoPost)
          this.catalogoElementosService.postGrupo(grupoPost)
            .subscribe(res => {
              // console.log(res);
              this.info_grupo = <Grupo2><unknown>res;
              this.eventChange.emit(true);
              this.showToast('info',
                this.translate.instant('GLOBAL.Creado'),
                this.translate.instant('GLOBAL.subgrupo.grupo.respuesta_crear_ok'));
            });
        }
      });
  }

  ngOnInit() {
    this.loadGrupo();
  }

  validarForm(event) {
    if (event.valid) {
      if (/^[a-gA-G]{1}/.test(event.data.Grupo.Codigo)) {
        if (this.info_grupo === undefined) {
          this.createGrupo(event.data.Grupo);
        } else {
          this.updateGrupo(event.data.Grupo);
        }
      }else {
        (Swal as any).fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Inserte un código válido!',
          footer: '<a href>El código debe ser una letra entre A-G</a>',
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
