import { Grupo2, Clase, Subgrupo, SubgrupoID } from '../../../@core/data/models/catalogo/jerarquia';
import { Detalle } from '../../../@core/data/models/catalogo/detalle';
import { TipoNivelID, Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { NivelHelper as nh } from '../../../@core/utils/niveles.helper';
import { TipoBien, TipoBienID, Bien_t } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SubgrupoTransaccion, SubgrupoTransaccionDetalle } from '../../../@core/data/models/catalogo/transacciones';
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

  // ver comentarios en muestraDetalles()
  // campos_detalle_requeridos: Array<boolean>;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
  ) {
    // ver comentarios en muestraDetalles()
    // this.campos_detalle_requeridos = FORM_SUBGRUPO.campos.map(campo => {
    //   return campo.claseGrid.includes('det-subg-catalogo') && campo.requerido;
    // });
    // console.log({'campos requeridos':this.campos_detalle_requeridos});

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
      this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
      this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';

      this.catalogoElementosService.getSubgrupoById(this.subgrupo_id)
        .subscribe(res => {
          // console.log({'loadSubgrupo() - res': res});
          if (Object.keys(res[0]).length !== 0) {
            // this.info_subgrupo = <Subgrupo>res[0].SubgrupoHijoId;
            const subgrupo = new Subgrupo;
            Object.assign(subgrupo, res[0].Subgrupo);
            const nivel: TipoNivelID = { Id: subgrupo.TipoNivelId.Id };
            subgrupo.TipoNivelId = nivel;
            // console.log({'subgrupo': subgrupo});

            const info__grupo = new Grupo2;
            info__grupo.Descripcion = subgrupo.Descripcion;
            info__grupo.Nombre = subgrupo.Nombre;
            info__grupo.Id = subgrupo.Id;

            if (this.subgrupo !== undefined) {
              if (subgrupo.TipoNivelId.Id === Nivel_t.Segmento) {
                this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
                info__grupo.Codigo = this.subgrupo.Codigo.substring(0, 2);
                this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '0000';
              } else  if (subgrupo.TipoNivelId.Id === Nivel_t.Familia) {
                this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupo.Codigo.substring(0, 2);
                info__grupo.Codigo = this.subgrupo.Codigo.substring(2, 4);
                this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '00';
              } else if (subgrupo.TipoNivelId.Id === Nivel_t.Clase) {
                this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupo.Codigo.substring(0, 4);
                info__grupo.Codigo = this.subgrupo.Codigo.substring(4, 6);
                this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';
              } else {
                this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
                this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';
              }
            }

            // console.log(info__grupo.Codigo);

            if (nivel.Id === Nivel_t.Clase) {
              const detalle = new Detalle;
              Object.assign(detalle, res[0].Detalle);
              // console.log({'detalle': detalle});
              this.detalle_id = detalle.Id;
              info__grupo.TipoBienId = detalle.TipoBienId;
              info__grupo.Depreciacion = detalle.Depreciacion;
              info__grupo.Valorizacion = detalle.Valorizacion;
              this.detalle = detalle;
            } else {
              // Valores "dummy" para campos requeridos
              info__grupo.TipoBienId = <TipoBienID>{Id: Bien_t.devolutivo};
            }
            this.muestraDetalles(nivel.Id === Nivel_t.Clase);

            this.subgrupo = subgrupo;
            this.info_subgrupo = info__grupo;
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

  updateSubgrupo(form_data: any): void {

    // console.log({'updateSubgrupo(form_data)': form_data});
    const nivel = this.subgrupo.TipoNivelId.Id;

    const opt: any = {
      title: this.translate.instant('GLOBAL.Actualizar'),
      text: this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(nivel) + '.pregunta_actualizar'),
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          // console.log({'this.info_subgrupo': this.info_subgrupo});
          // console.log({'this.subgrupo': this.subgrupo});

          let subGrupoPut;
          // this.subgrupo.Codigo = form_data.Codigo;
          this.subgrupo.Nombre = form_data.Nombre;

          if (nivel === Nivel_t.Segmento) {
            this.subgrupo.Codigo = form_data.Codigo + '0000';
          } else if (nivel === Nivel_t.Familia) {
              this.subgrupo.Codigo = this.subgrupo.Codigo.substring(0, 2) + form_data.Codigo + '00';
            } else if (nivel === Nivel_t.Clase) {
                this.subgrupo.Codigo = this.subgrupo.Codigo.substring(0, 4) + form_data.Codigo;
          }

          // console.log(this.subgrupo.Codigo);
          this.subgrupo.Descripcion = form_data.Descripcion;

          if (nivel === Nivel_t.Clase) {
            subGrupoPut = new SubgrupoTransaccionDetalle;
            const detalle = new Detalle;
            detalle.Id = this.detalle_id;
            detalle.Activo = true;
            detalle.Depreciacion = <boolean>form_data.Depreciacion;
            detalle.Valorizacion = <boolean>form_data.Valorizacion;
            detalle.TipoBienId = {Id: form_data.TipoBienId.Id};
            detalle.SubgrupoId = {Id: form_data.Id};
            subGrupoPut.SubgrupoHijo = this.subgrupo;
            subGrupoPut.DetalleSubgrupo = detalle;
          } else {
            subGrupoPut = new SubgrupoTransaccion;
            subGrupoPut.SubgrupoHijo = {...this.subgrupo};
          }

          // console.log(subGrupoPut);
          this.catalogoElementosService.putSubgrupo(subGrupoPut, this.info_subgrupo.Id)
            .subscribe(res => {
              this.loadSubgrupo();
              this.eventChange.emit(true);
              this.showToast(
                'info',
                this.translate.instant('GLOBAL.Actualizado'),
                this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(nivel) + '.respuesta_actualizar_ok'),
              );
            });
        }
      });
  }

  createSubgrupo(form_data: any): void {

    const nivel = nh.Hijo(this.subgrupoPadre.TipoNivelId.Id);

    const opt: any = {
      title: this.translate.instant('GLOBAL.Crear'),
      text: this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(nivel) + '.pregunta_crear'),
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          // console.log({'formulario subgrupo': form_data});
          // console.log({'this.subgrupoPadre': this.subgrupoPadre});
          // Subgrupo
          form_data.Activo = true;
          form_data.TipoNivelId = <TipoNivelID>{'Id': nivel};
          // subgrupo.TipoNivelId = { Id: nh.Hijo(this.subgrupoPadre.TipoNivelId.Id) };

          // Detalle
          let detalle;
          if (nivel === Nivel_t.Clase) {
            // Usar datos del detalle
            detalle = new Detalle;
            detalle.Activo = true;
            detalle.Depreciacion = (form_data.Depreciacion === '') ? false : form_data.Depreciacion;
            detalle.Valorizacion = (form_data.Valorizacion === '') ? false : form_data.Valorizacion;
            detalle.TipoBienId = <TipoBienID>{'Id': form_data.TipoBienId.Id};
          }

          // Limpieza antes de enviar el POST...
          delete form_data.Depreciacion;
          delete form_data.Valorizacion;
          delete form_data.TipoBienId;

          // POST
          let subgrupoPost;
          if (detalle !== undefined) {
            subgrupoPost = new SubgrupoTransaccionDetalle;
            subgrupoPost.DetalleSubgrupo = detalle;
          } else {
            subgrupoPost = new SubgrupoTransaccion;
          }
          subgrupoPost.SubgrupoPadre = <SubgrupoID>{'Id': this.subgrupoPadre.Id};
          subgrupoPost.SubgrupoHijo = form_data;
          // console.log({'POST': subgrupoPost});

          this.catalogoElementosService.postSubgrupo(subgrupoPost)
            .subscribe(res => {
              const subg = <Clase><unknown>res;
              this.detalle = <Detalle>subg.Detalle;
              this.eventChange.emit(true);
              this.showToast('info', this.translate.instant('GLOBAL.Creado'),
                this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(nivel) + '.respuesta_crear_ok') );
            });
        }
      });
  }

  muestraDetalles (mostrar: boolean): void {

    // PARTE 1: Hacer que los campos que eran requeridos, ahora no lo sean
    // // Forma 1: Funciona PERO, cuando se guarda el formulario, no llegan los datos...
    // this.campos_detalle_requeridos.map((campoNum,idx) => [idx, campoNum]).filter(campoReq => campoReq[1]).forEach(campo => {
    //   // console.log({'campo':campo,'mostrar':mostrar});
    //   this.formSubgrupo.campos[<number>campo[0]].requerido = mostrar;
    // });
    // Forma 2 (EN USO):  Cargar valores dummy en campos requeridos que se van a ocultar (e ignorar)
    // (Ver loadSubgrupo())

    // PARTE 2: Actualizar el estilo
    // Funciona, pero si quedaron campos simplemente quedaron ocultos
    document.querySelectorAll<HTMLElement>('.det-subg-catalogo').forEach(campo => {
      // campo.style.display = 'none' ;
      campo.style.display = mostrar ? 'block' : 'none' ;
    });
  }

  ngOnInit() {
    this.loadSubgrupo();
    this.loadPrefixSuffixCreate();
}

  loadPrefixSuffixCreate () {
    if (this.subgrupoPadre !== undefined) {
      if (this.subgrupoPadre.TipoNivelId.Id === Nivel_t.Grupo) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '0000';
      } else  if (this.subgrupoPadre.TipoNivelId.Id === Nivel_t.Segmento) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupoPadre.Codigo.substring(0, 2);
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '00';
      } else if (this.subgrupoPadre.TipoNivelId.Id === Nivel_t.Familia) {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupoPadre.Codigo.substring(0, 4);
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';
      } else {
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = '';
        this.formSubgrupo.campos[this.getIndexForm('Codigo')].suffix.value = '';
      }
      this.construirForm();
    }
  }

validarForm(event) {
    if (event.valid) {
        if (this.info_subgrupo === undefined) {
          if (this.subgrupoPadre.TipoNivelId.Id === Nivel_t.Grupo) {
            event.data.Subgrupo.Codigo = event.data.Subgrupo.Codigo + '0000';
          } else if (this.subgrupoPadre.TipoNivelId.Id === Nivel_t.Segmento) {
            event.data.Subgrupo.Codigo = this.subgrupoPadre.Codigo.substring(0, 2) + event.data.Subgrupo.Codigo + '00';
            this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupoPadre.Codigo.substring(0, 2);
            } else if (this.subgrupoPadre.TipoNivelId.Id === Nivel_t.Familia) {
              event.data.Subgrupo.Codigo = this.subgrupoPadre.Codigo.substring(0, 4) + event.data.Subgrupo.Codigo;
              this.formSubgrupo.campos[this.getIndexForm('Codigo')].prefix.value = this.subgrupoPadre.Codigo.substring(0, 4);
          }
          this.construirForm();
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
