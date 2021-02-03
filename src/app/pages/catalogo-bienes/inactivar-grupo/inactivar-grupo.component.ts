import { Component, OnInit } from '@angular/core';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { FORM_INACTIVAR } from './form-inactivar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Grupo } from '../../../@core/data/models/catalogo/jerarquia';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import Swal from 'sweetalert2';
import { PopUpManager } from '../../../managers/popUpManager';
import { Router } from '@angular/router';
import { NivelHelper as nh } from '../../../@core/utils/niveles.helper';

@Component({
  selector: 'ngx-inactivar-grupo',
  templateUrl: './inactivar-grupo.component.html',
  styleUrls: ['./inactivar-grupo.component.scss'],
})
export class InactivarGrupoComponent implements OnInit {

  formGrupo: any;
  info_grupo: Grupo;
  clean: boolean;
  cargando_catalogos: boolean = true;

  catalogos: Array<Catalogo>;
  catalogoId: number;

  constructor(private catalogoBienesHelper: CatalogoElementosHelper,
    private translate: TranslateService, private pUpManager: PopUpManager, private router: Router) { }

  ngOnInit() {
    this.cleanForm();
    this.formGrupo = FORM_INACTIVAR;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.catalogos = new Array<Catalogo>();
    this.catalogoId = 0;
    this.loadCatalogos();
  }

  construirForm() {
    this.formGrupo.titulo = this.translate.instant('GLOBAL.subgrupo.grupo.nombre');
    this.formGrupo.btn = this.translate.instant('GLOBAL.inactivar');
    for (let i = 0; i < this.formGrupo.campos.length; i++) {
      this.formGrupo.campos[i].label = this.translate.instant('GLOBAL.' + this.formGrupo.campos[i].label_i18n);
      this.formGrupo.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formGrupo.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadCatalogos() {
    this.catalogoBienesHelper.getCatalogos().subscribe((res) => {
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

  onChange(catalogo) {
    this.catalogoId = catalogo;
  }

  cleanForm() {
    this.clean = !this.clean;
    this.info_grupo = undefined;
  }

  receiveMessage(event) {

    // console.log({event});
    this.info_grupo = event;
    this.inactivarGrupo();
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_grupo !== undefined) {
        this.inactivarGrupo();
      }
    }
  }

  inactivarGrupo() {
    const t = {CODE: this.info_grupo.Codigo};
    const niv_i18n = nh.Texto(this.info_grupo.TipoNivelId.Id);
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.subgrupo.' + niv_i18n + '.pregunta_inactivar', t),
      text: this.translate.instant('GLOBAL.inactivar_info'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      confirmButtonText: this.translate.instant('GLOBAL.inactivar'),
    }).then((result) => {
      if (result.value) {
        this.info_grupo.Activo = false;
        this.catalogoBienesHelper.putSubgrupo(this.info_grupo, this.info_grupo.Id).subscribe(res => {
          if (res !== null) {
            this.pUpManager.showSuccessAlert(this.translate.instant('GLOBAL.subgrupo.' + niv_i18n + '.respuesta_inactivar_ok', t));
            this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/pages/catalogo_bienes/inactiva_grupos']);
            });
          } else {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.subgrupo.' + niv_i18n + '.respuesta_inactivar_err', t));
          }
        });
      }
    });
  }

}
