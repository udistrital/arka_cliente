import { Grupo, Grupo2, Clase, Subgrupo, SubgrupoID } from '../../../@core/data/models/catalogo/jerarquia';
import { Detalle, SubgrupoDetalle } from '../../../@core/data/models/catalogo/detalle';
import { TipoNivelID, Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { NivelHelper as nh } from '../../../@core/utils/niveles.helper';
import { TipoBien, TipoBienID, Bien_t } from '../../../@core/data/models/acta_recibido/tipo_bien';
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
  subgrupo: Subgrupo;
  subgrupo_id: number;
  subgrupoPadre: any;
  detalle: Detalle;
  detalle_id: number;

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

  info_subgrupo: Grupo2;
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
    this.loadOptionsCatalogo();
  }

  construirForm() {
    // TODO: Actualizar dinamicamente este texto segun el nivel:
    this.formSubgrupo.titulo = this.translate.instant('GLOBAL.subgrupo.segmento.nombre');
    this.formSubgrupo.btn = this.translate.instant('GLOBAL.guardar');

    for (let i = 0; i < this.formSubgrupo.campos.length; i++) {
      // TODO: Ocultar dinamicamente alguno de estos campos segun el nivel:
      this.formSubgrupo.campos[i].label = this.translate.instant('GLOBAL.' + this.formSubgrupo.campos[i].label_i18n);
      this.formSubgrupo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formSubgrupo.campos[i].label_i18n);
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
        this.formSubgrupo.campos[this.getIndexForm('TipoBienId')].opciones = Tipo_Bien;
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
      // TODO - PROVISIONAL: Esta línea podría NO usarse ...
      this.catalogoElementosService.getDetalleSubgrupo(this.subgrupo_id)
      /* ... Debería usarse UNICAMENTE esta (Cambiar despues de actualizada la API):
      this.catalogoElementosService.getSubgrupoById(this.subgrupo_id)
      */
        .subscribe(res => {
          // console.log({'loadSubgrupo() - res': res});
          if (Object.keys(res[0]).length !== 0) {

            const subgrupo = new Subgrupo;
            Object.assign(subgrupo, res[0].SubgrupoId);
            const nivel: TipoNivelID = { Id: subgrupo.TipoNivelId.Id };
            subgrupo.TipoNivelId = nivel;
            // console.log({'subgrupo': subgrupo});

            const info__grupo = new Grupo2;
            info__grupo.Descripcion = subgrupo.Descripcion;
            info__grupo.Nombre = subgrupo.Nombre;
            info__grupo.Codigo = subgrupo.Codigo;
            info__grupo.Id = subgrupo.Id;

            // TODO: Meter las siguientes lineas dentro del 'if'
            // despues de actualizada la API
            const detalle = new Detalle;
            Object.assign(detalle, res[0]);
            // console.log({'detalle': detalle});
            this.detalle_id = detalle.Id;
            if (nivel.Id === Nivel_t.Clase) {
              info__grupo.TipoBienId = detalle.TipoBienId;
              info__grupo.Depreciacion = detalle.Depreciacion;
              info__grupo.Valorizacion = detalle.Valorizacion;
              this.detalle = detalle;
            }
            // TODO: Descomentar despues de actualizar la API
            /*
            else {
              this.detalle_id = undefined;
            }
            // */

            this.subgrupo = subgrupo;
            this.info_subgrupo = info__grupo;
            this.mostrar.emit(true);
          } else {
            // this.subgrupo = undefined;
            this.info_subgrupo = undefined;
            this.clean = !this.clean;
            this.mostrar.emit(false);
          }
        });
    } else {
      // this.subgrupo = undefined;
      this.info_subgrupo = undefined;
      this.clean = !this.clean;
    }
  }

  updateSubgrupo(form_data: any): void {

    // console.log({'updateSubgrupo(form_data)': form_data});

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
          // console.log({'this.info_subgrupo': this.info_subgrupo});
          // console.log({'this.subgrupo': this.subgrupo});

          const subGrupoPut = new SubgrupoTransaccion;
          const nivel = this.subgrupo.TipoNivelId.Id;

          this.subgrupo.Codigo = form_data.Codigo;
          this.subgrupo.Nombre = form_data.Nombre;
          this.subgrupo.Descripcion = form_data.Descripcion;

          if (nivel === Nivel_t.Clase) {
            const detalle = new Detalle;
            detalle.Id = this.detalle_id;
            detalle.Activo = true;
            detalle.Depreciacion = form_data.Depreciacion;
            detalle.Valorizacion = form_data.Valorizacion;
            detalle.TipoBienId = {Id: form_data.TipoBienId.Id};
            detalle.SubgrupoId = {Id: form_data.Id};
            subGrupoPut.SubgrupoHijo = [<SubgrupoDetalle>{...this.subgrupo, DetalleSubgrupo: detalle}];
            // console.log({'detalle': detalle, 'subGrupoPut': subGrupoPut});
          } else {
            // TODO: Posiblemente este 'else' se deba actualizar o borrar
            // despues de actualizada la API
            subGrupoPut.SubgrupoHijo = [{...this.subgrupo}];
          }

          // console.log(subGrupoPut);

          this.catalogoElementosService.putSubgrupo(subGrupoPut, this.info_subgrupo.Id)
            .subscribe(res => {
              this.loadSubgrupo();
              this.eventChange.emit(true);
              this.showToast(
                'info',
                this.translate.instant('GLOBAL.Actualizado'),
                // TODO: Actualizar dinamicamente este texto:
                this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(nivel) + '.respuesta_actualizar_ok'),
              );
            });
        }
      });
  }

  createSubgrupo(form_data: any): void {
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
          // console.log({'formulario subgrupo': form_data});
          // console.log({'this.subgrupoPadre': this.subgrupoPadre});

          const nivel = nh.Hijo(this.subgrupoPadre.TipoNivelId.Id);

          // Detalle
          const detalle = new Detalle;
          if (nivel === Nivel_t.Clase) {
            // Usar datos del detalle
            detalle.Depreciacion = (form_data.Depreciacion === '') ? false : form_data.Depreciacion;
            detalle.Valorizacion = (form_data.Valorizacion === '') ? false : form_data.Valorizacion;
            detalle.TipoBienId = <TipoBienID>{'Id': form_data.TipoBienId.Id};
          } else {
            // TODO: Posiblemente este 'else' se deba actualizar o borrar
            // despues de actualizada la API
            detalle.Depreciacion = false;
            detalle.Valorizacion = false;
            detalle.TipoBienId = <TipoBienID>{'Id': Bien_t.consumo};
          }

          // Subgrupo
          form_data.Activo = true;
          form_data.DetalleSubgrupo = detalle;
          form_data.TipoNivelId = <TipoNivelID>{'Id': nivel};
          // Limpieza antes de enviar el POST...
          delete form_data.Depreciacion;
          delete form_data.Valorizacion;
          delete form_data.TipoBienId;

          // POST
          const subgrupoPost = new SubgrupoTransaccion;
          subgrupoPost.SubgrupoPadre = <SubgrupoID>{'Id': this.subgrupoPadre.Id};
          subgrupoPost.SubgrupoHijo = [form_data];
          // console.log({'POST': subgrupoPost});

          this.catalogoElementosService.postSubgrupo(subgrupoPost)
            .subscribe(res => {
              // console.log({'createSubgrupo()>postSubgrupo>res': res});
              // this.subgrupo = <Subgrupo><unknown>res;
              const subg = <Clase><unknown>res;
              // this.info_subgrupo = <Subgrupo>subg;
              this.detalle = <Detalle>subg.Detalle;
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
      // console.log({'validarForm subgrupo':event.data.Subgrupo});
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
