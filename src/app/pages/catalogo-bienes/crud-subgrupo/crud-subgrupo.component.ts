import { Grupo, Grupo2, Clase, Subgrupo, SubgrupoID } from '../../../@core/data/models/catalogo/jerarquia';
import { Detalle } from '../../../@core/data/models/catalogo/detalle';
import { TipoNivelID, Nivel } from '../../../@core/data/models/catalogo/tipo_nivel';
import { NivelHelper as nh } from '../../../@core/utils/niveles.helper';
import { TipoBien, TipoBienID } from '../../../@core/data/models/acta_recibido/tipo_bien';
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
      // TODO: Actualizar dinamicamente estos textos segun el nivel:
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
          // console.log({'loadSubgrupo() - res':  res});
          if (Object.keys(res[0]).length !== 0) {
            // const detalle = <Detalle>res[0].Detalle;
            const detalle = <Detalle>res[0];
            const subgrupo = <Grupo>res[0].SubgrupoId;

            const info__grupo = new Grupo2;
            this.detalle_id = detalle.Id;
            info__grupo.Descripcion = subgrupo.Descripcion;
            info__grupo.Nombre = subgrupo.Nombre;
            info__grupo.Codigo = subgrupo.Codigo;
            info__grupo.TipoBienId = detalle.TipoBienId;
            info__grupo.Depreciacion = detalle.Depreciacion;
            info__grupo.Valorizacion = detalle.Valorizacion;

            // this.info_subgrupo = <Subgrupo>res[0].Subgrupo;
            this.info_subgrupo = info__grupo;
            // console.log({'cr_subg.subgrupoPadre': this.subgrupoPadre});
            this.mostrar.emit(true);
          } else {
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

  updateSubgrupo(subgrupo: any): void {

    // console.log({'updateSubgrupo(subgrupo)': subgrupo});

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
          // this.info = <Subgrupo>subgrupo;
          this.info_subgrupo = <Grupo2>subgrupo;

          const subGrupoPut = new SubgrupoTransaccion;
          // TODO: Esto debería depender del nivel
          const detalle = new Detalle;

          subgrupo.Activo = true;
          subgrupo.Id = this.subgrupo_id;

          detalle.Depreciacion = subgrupo.Depreciacion;
          detalle.Valorizacion = subgrupo.Valorizacion;
          detalle.TipoBienId = subgrupo.TipoBienId;
          detalle.SubgrupoId = <SubgrupoID>subgrupo;
          detalle.Activo = true;
          detalle.Id = this.detalle_id;
          subgrupo.DetalleSubgrupo = detalle;

          // TODO: Esto debe depender del nivel
          const subgrupoNuevo = <Clase>subgrupo; // con detalle
          // const subgrupoNuevo =  <Subgrupo>subgrupo; // sin detalle

          subGrupoPut.SubgrupoPadre = <SubgrupoID> this.subgrupoPadre;
          subGrupoPut.SubgrupoHijo = [subgrupoNuevo];

          this.catalogoElementosService.putSubgrupo(subGrupoPut, this.info_subgrupo.Id)
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
          // console.log({'formulario subgrupo': subgrupo});
          // console.log({'subgrupoPadre': this.subgrupoPadre});

          const subgrupoPost = new SubgrupoTransaccion;
          const subgrupoHijos = new Array<Subgrupo>();

          subgrupo.Activo = true;

          // TODO: La creacion del detalle (esta parte)
          // debe depender del nivel actual.
          const detalle = new Detalle;
          detalle.Depreciacion = (subgrupo.Depreciacion === '') ? false : subgrupo.Depreciacion;
          detalle.Valorizacion = (subgrupo.Valorizacion === '') ? false : subgrupo.Valorizacion;
          detalle.TipoBienId = <TipoBienID>{'Id': subgrupo.TipoBienId.Id};
          subgrupo.DetalleSubgrupo = detalle;

          // Limpieza antes de enviar el POST...
          delete subgrupo.Depreciacion;
          delete subgrupo.Valorizacion;
          delete subgrupo.TipoBienId;

          const nivelHijo = <TipoNivelID>{'Id': nh.Hijo(<Nivel>this.subgrupoPadre.TipoNivelId.Id)};
          subgrupoHijos.push(subgrupo);
          subgrupoPost.SubgrupoPadre = <SubgrupoID>{'Id': this.subgrupoPadre.Id};
          subgrupoPost.SubgrupoHijo = [subgrupo];
          subgrupoPost.SubgrupoHijo[0].TipoNivelId = nivelHijo;

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
