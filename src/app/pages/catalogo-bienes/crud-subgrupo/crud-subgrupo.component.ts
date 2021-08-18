import { Grupo2, Clase, Subgrupo, SubgrupoID } from '../../../@core/data/models/catalogo/jerarquia';
import { Detalle } from '../../../@core/data/models/catalogo/detalle';
import { TipoNivelID, Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { NivelHelper as nh } from '../../../@core/utils/niveles.helper';
import { TipoBien, TipoBienID, Bien_t } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SubgrupoTransaccion, SubgrupoTransaccionDetalle } from '../../../@core/data/models/catalogo/transacciones';
import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { FORM_SUBGRUPO } from './form-subgrupo';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-crud-subgrupo',
  templateUrl: './crud-subgrupo.component.html',
  styleUrls: ['./crud-subgrupo.component.scss'],
})
export class CrudSubgrupoComponent implements OnInit, OnChanges {
  formSubgrupo: any;
  regSubgrupo: any;
  clean: boolean;
  cargando: boolean = true;

  @Input('subgrupo') subgrupo: Subgrupo;
  @Input('create') create: boolean;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  construirForm() {
    const nivel = this.create ? nh.Hijo(this.subgrupo.TipoNivelId.Id) : this.subgrupo.TipoNivelId.Id;
    const titulo = 'GLOBAL.subgrupo.' + nh.Texto(!this.create ? nivel : nivel - 1);

    this.formSubgrupo = nivel === Nivel_t.Clase ? FORM_SUBGRUPO_DETALLE : FORM_SUBGRUPO;
    nivel === Nivel_t.Clase ? this.formSubgrupo.campos[this.getIndexForm('TipoBienId')].opciones = this.tiposBien : null;

    this.formSubgrupo.titulo = this.translate.instant(!this.create ? titulo + '.nombre' : titulo + '.padre',
      this.create ? { CODIGO: this.subgrupo.Codigo, NOMBRE: this.subgrupo.Nombre } : null);

    this.formSubgrupo.campos[0].suffix.value = '0000'.substring(2 * nivel - 4, 4);
    this.formSubgrupo.campos[0].prefix.value = this.subgrupo.Codigo.substring(0, 2 * nivel - 4);
    this.formSubgrupo.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formSubgrupo.campos.length; i++) {
      this.formSubgrupo.campos[i].label = this.translate.instant('GLOBAL.' + this.formSubgrupo.campos[i].label_i18n);
      this.formSubgrupo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formSubgrupo.campos[i].label_i18n);
    }
  }

  loadOptionsCatalogo(): void {
    this.catalogoElementosService.getTipoBien().toPromise().then(res => {
      if (res !== null) {
        this.tiposBien = res;
        this.construirForm();
      }
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

  public cargarForm(): void {
    if (this.create) {

      this.infoSubgrupo = undefined;
      this.clean = !this.clean;
      this.cargando = false;

    } else if (this.subgrupo.TipoNivelId.Id < Nivel_t.Clase) {

      const subgrupo = new Subgrupo;
      subgrupo.Id = this.subgrupo.Id;
      subgrupo.Activo = this.subgrupo.Activo;
      subgrupo.Codigo = this.subgrupo.Codigo.substring(this.subgrupo.TipoNivelId.Id * 2 - 4, this.subgrupo.TipoNivelId.Id * 2 - 2);
      subgrupo.Nombre = this.subgrupo.Nombre;
      subgrupo.Descripcion = this.subgrupo.Descripcion;
      subgrupo.FechaCreacion = this.subgrupo.FechaCreacion;
      subgrupo.FechaModificacion = this.subgrupo.FechaModificacion;
      subgrupo.TipoNivelId = this.subgrupo.TipoNivelId;
      this.infoSubgrupo = subgrupo;
      this.cargando = false;

    } else if (this.subgrupo.TipoNivelId.Id === Nivel_t.Clase) {

      this.catalogoElementosService.getDetalleSubgrupo(this.subgrupo.Id).toPromise().then(res => {
        if (res !== null) {
          const detalleSubgrupo = res[0];
          const clase = new Grupo2;

          clase.Id = detalleSubgrupo.SubgrupoId.Id;
          clase.Activo = detalleSubgrupo.SubgrupoId.Activo;
          clase.Codigo = detalleSubgrupo.SubgrupoId.Codigo.substring(4, 6);
          clase.Nombre = detalleSubgrupo.SubgrupoId.Nombre;
          clase.Descripcion = detalleSubgrupo.SubgrupoId.Descripcion;
          clase.DetalleId = detalleSubgrupo.Id;
          clase.TipoBienId = detalleSubgrupo.TipoBienId;
          clase.Depreciacion = detalleSubgrupo.Depreciacion;
          clase.Valorizacion = detalleSubgrupo.Valorizacion;

          this.infoSubgrupo = clase;
          this.cargando = false;
        }
      });
    }
  }

  updateSubgrupo(formData: any): void {

    const nivel = this.subgrupo.TipoNivelId.Id;

    const subgrupo = new Subgrupo;
    const trSubrupo = new SubgrupoTransaccionDetalle;

    if (nivel === Nivel_t.Clase) {
      const tipoBien = formData.TipoBienId && formData.TipoBienId.Id ? formData.TipoBienId.Id : formData.TipoBienId;
      const detalle = new Detalle;
      detalle.Id = formData.DetalleId;
      detalle.Depreciacion = formData.Depreciacion;
      detalle.Valorizacion = formData.Valorizacion;
      detalle.TipoBienId = <TipoBienID>{ Id: tipoBien };
      detalle.FechaModificacion = new Date;
      trSubrupo.DetalleSubgrupo = detalle;
    }

    subgrupo.Id = formData.Id;
    subgrupo.Activo = formData.Activo;
    subgrupo.Nombre = formData.Nombre;
    subgrupo.Codigo = formData.Codigo;
    subgrupo.Descripcion = formData.Descripcion;
    subgrupo.FechaModificacion = new Date;
    trSubrupo.SubgrupoHijo = subgrupo;
    this.catalogoElementosService.putSubgrupo(trSubrupo, subgrupo.Id).toPromise()
      .then(res => {
        if (res !== null) {
          this.showAlert();
        }
      });
  }

  createSubgrupo(formData: any): void {

    const nivel = nh.Hijo(this.subgrupo.TipoNivelId.Id);
    const subgrupoHijo = new Subgrupo;
    const trSubrupo = new SubgrupoTransaccionDetalle;

    if (nivel === Nivel_t.Clase) {
      const detalle = new Detalle;
      const tipoBien = formData.TipoBienId && formData.TipoBienId.Id ? formData.TipoBienId.Id : formData.TipoBienId;
      detalle.Id = formData.DetalleId;
      detalle.Depreciacion = formData.Depreciacion;
      detalle.Valorizacion = formData.Valorizacion;
      detalle.TipoBienId = <TipoBienID>{ Id: tipoBien };
      trSubrupo.DetalleSubgrupo = detalle;
    }

    subgrupoHijo.Id = formData.Id;
    subgrupoHijo.Activo = formData.Activo;
    subgrupoHijo.Nombre = formData.Nombre;
    subgrupoHijo.Codigo = formData.Codigo;
    subgrupoHijo.Descripcion = formData.Descripcion;
    subgrupoHijo.TipoNivelId = <TipoNivelID>{ Id: nivel };
    trSubrupo.SubgrupoHijo = subgrupoHijo;

    trSubrupo.SubgrupoPadre = <SubgrupoID>{ 'Id': this.subgrupo.Id };

    this.catalogoElementosService.postSubgrupo(trSubrupo).toPromise()
      .then(res => {
        if (res !== null) {
          this.showAlert();
        }
      });
  }

  ngOnInit() {
    this.init = true;
  }

  ngOnChanges() {
    this.cargando = true;
    !this.init ? this.loadOptionsCatalogo() : this.construirForm();
    this.cargarForm();
  }

  validarForm(event) {
    if (event.valid) {

      const nivel = this.create ? nh.Hijo(this.subgrupo.TipoNivelId.Id) : this.subgrupo.TipoNivelId.Id;
      const text = this.create ? '.pregunta_crear' : '.pregunta_actualizar';
      (Swal as any).fire({
        title: this.translate.instant(this.create ? 'GLOBAL.Crear' : 'GLOBAL.Actualizar'),
        text: this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(nivel) + text),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085D6',
        cancelButtonColor: '#D33',
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
      }).then((willDelete) => {
        if (willDelete.value) {

          event.data.Subgrupo.Codigo =
            this.formSubgrupo.campos[0].prefix.value + event.data.Subgrupo.Codigo + this.formSubgrupo.campos[0].suffix.value;
          if (this.create) {
            this.createSubgrupo(event.data.Subgrupo);
          } else {
            this.updateSubgrupo(event.data.Subgrupo);
          }
        }
      });
    }
  }

  private showAlert() {
    const nivel = this.create ? nh.Hijo(this.subgrupo.TipoNivelId.Id) : this.subgrupo.TipoNivelId.Id;
    const text = this.create ? '.respuesta_crear_ok' : '.respuesta_actualizar_ok';
    (Swal as any).fire({
      title: this.translate.instant(this.create ? 'GLOBAL.Creado' : 'GLOBAL.Actualizado'),
      text: this.translate.instant('GLOBAL.subgrupo.' + nh.Texto(nivel) + text),
      type: 'success',
      showConfirmButton: false,
      timer: 2500,
    });
    this.eventChange.emit(true);
  }

}
