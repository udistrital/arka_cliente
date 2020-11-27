import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { Detalle } from '../../../@core/data/models/catalogo/detalle';
import { TipoNivelID } from '../../../@core/data/models/catalogo/tipo_nivel';
import { Grupo, Grupo2, SubgrupoComun } from '../../../@core/data/models/catalogo/jerarquia';
import { GrupoTransaccion } from '../../../@core/data/models/catalogo/transacciones';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

  info_grupo: Grupo;
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
          // console.log({'loadGrupo() - res': res});
          if (Object.keys(res[0]).length !== 0) {
            this.info_grupo = <Grupo>res[0].Subgrupo;
            this.mostrar.emit(true);
          } else {
            this.info_grupo = undefined;
            this.clean = !this.clean;
            this.mostrar.emit(false);
          }
        });
    } else {
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

          const grupoActual = <SubgrupoComun>grupo;
          // console.log({'updateGrupo(grupoActual)': grupoActual});

          grupoActual.Activo = true;
          grupoActual.Id = this.grupo_id;
          grupoActual.TipoNivelId = <TipoNivelID>{'Id': 1}; // 1 --> Grupo

          this.catalogoElementosService.putSubgrupo(grupoActual, grupo.Id)
            .subscribe(res => {
              // console.log(res);
              this.info_grupo = <Grupo2><unknown>res; // esto es realmente necesario?
              this.showToast('info',
                this.translate.instant('GLOBAL.Actualizado'),
                this.translate.instant('GLOBAL.subgrupo.grupo.respuesta_actualizar_ok') );
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

          catalogo.Id = parseFloat(this.catalogoid);
          grupo.Activo = true;

          // TODO: Eliminar este bloque PROVISIONAL una vez se actualice la API
          // (Revisar también en GrupoTransaccion)
          grupoPost.DetalleSubgrupo = <Detalle>{
            'Depreciacion': false,
            'Valorizacion': false,
            'Deterioro': false,
            'Activo': false,
            'TipoBienId': {'Id': 1},
          };

          grupoPost.Catalogo = catalogo;
          grupoPost.Subgrupo = grupo;
          grupoPost.Subgrupo.TipoNivelId = <TipoNivelID>{'Id': 1}; // 1 --> Grupo
          // console.log(grupoPost)
          this.catalogoElementosService.postGrupo(grupoPost)
            .subscribe(res => {
              // console.log(res);
              this.info_grupo = <Grupo2><unknown>res;
              this.eventChange.emit(true);
              this.showToast('info',
                this.translate.instant('GLOBAL.Creado'),
                this.translate.instant('GLOBAL.subgrupo.grupo.respuesta_crear_ok') );
            });
        }
      });
  }

  ngOnInit() {
    this.loadGrupo();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_grupo === undefined) {
        this.createGrupo(event.data.Grupo);
      } else {
        this.updateGrupo(event.data.Grupo);
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
