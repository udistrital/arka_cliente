import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { TipoNivelID, Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { GrupoTransaccion } from '../../../@core/data/models/catalogo/transacciones';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FORM_GRUPO } from './form-grupo';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-crud-grupo',
  templateUrl: './crud-grupo.component.html',
  styleUrls: ['./crud-grupo.component.scss'],
})
export class CrudGrupoComponent implements OnInit, OnChanges {

  @Input('grupo') grupo: Subgrupo;
  @Input('catalogoId') catalogoId: number;

  @Output() eventChange = new EventEmitter();
  @Output() mostrar = new EventEmitter();

  infoGrupo: Subgrupo;
  formGrupo: any;
  regGrupo: any;
  clean: boolean;
  cargando: boolean = true;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
  ) {
  }

  ngOnInit() {
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadGrupo();
  }

  ngOnChanges() {
    this.loadGrupo();
  }

  construirForm() {
    this.formGrupo = FORM_GRUPO;
    this.formGrupo.titulo = this.translate.instant('GLOBAL.subgrupo.grupo.nombre');
    this.formGrupo.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formGrupo.campos.length; i++) {
      this.formGrupo.campos[i].label = this.translate.instant('GLOBAL.' + this.formGrupo.campos[i].label_i18n);
      this.formGrupo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formGrupo.campos[i].label_i18n);
    }
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
    if (this.grupo !== undefined) {
      this.infoGrupo = this.grupo;
    } else {
      this.infoGrupo = undefined;
      this.clean = !this.clean;
    }
    this.cargando = false;
  }

  updateGrupo(subgrupo: Subgrupo): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.Actualizar'),
      text: this.translate.instant('GLOBAL.subgrupo.grupo.pregunta_actualizar'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
    };
    (Swal as any).fire(opt).then((willDelete) => {
      if (willDelete.value) {

        this.catalogoElementosService.putGrupo(subgrupo, subgrupo.Id).toPromise()
          .then(res => {
            if (res !== null) {
              (Swal as any).fire({
                title: this.translate.instant('GLOBAL.Actualizado'),
                text: this.translate.instant('GLOBAL.subgrupo.grupo.respuesta_actualizar_ok'),
                type: 'success',
                showConfirmButton: false,
                timer: 2500,
              });
              this.eventChange.emit(true);
            }
          });
      }
    });
  }

  createGrupo(subgrupo: Subgrupo): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.Crear'),
      text: this.translate.instant('GLOBAL.subgrupo.grupo.pregunta_crear'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
    };
    (Swal as any).fire(opt).then((willDelete) => {
      if (willDelete.value) {

        const trGrupo = new GrupoTransaccion;
        const catalogo = new Catalogo;
        catalogo.Id = parseFloat(this.catalogoId.toString());
        trGrupo.Catalogo = catalogo;
        trGrupo.Subgrupo = subgrupo;
        trGrupo.Subgrupo.TipoNivelId = <TipoNivelID>{ 'Id': Nivel_t.Grupo };

        this.catalogoElementosService.postGrupo(trGrupo).toPromise()
          .then(res => {
            if (res !== null) {
              (Swal as any).fire({
                title: this.translate.instant('GLOBAL.Creado'),
                text: this.translate.instant('GLOBAL.subgrupo.grupo.respuesta_crear_ok'),
                type: 'success',
                showConfirmButton: false,
                timer: 2500,
              });
              this.eventChange.emit(true);
            }
          });

      }
    });
  }

  validarForm(event) {
    if (event.valid) {
        if (this.infoGrupo === undefined) {
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
