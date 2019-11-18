import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Catalogo } from '../../../@core/data/models/catalogo';
import { FORM_INACTIVAR } from './form-inactivar';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Grupo } from '../../../@core/data/models/grupo';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import Swal from 'sweetalert2';
import { PopUpManager } from '../../../managers/popUpManager';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-inactivar-grupo',
  templateUrl: './inactivar-grupo.component.html',
  styleUrls: ['./inactivar-grupo.component.scss'],
})
export class InactivarGrupoComponent implements OnInit {

  formGrupo: any;
  info_grupo: Grupo;
  clean: boolean;
  ver_formulario: boolean;

  catalogos: Array<Catalogo>;
  catalogoId: number;

  @Output() eventChange = new EventEmitter();

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
    this.formGrupo.titulo = this.translate.instant('GLOBAL.grupo');
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
    
    this.info_grupo = event;
    this.catalogoBienesHelper.getGrupoById(event.Id).subscribe(
      res => {
        // console.log(res[0]);
        if (Object.keys(res[0]).length !== 0) {
          this.formGrupo.titulo = this.translate.instant('GLOBAL.grupo');
          this.ver_formulario = true;
        } else {
          this.formGrupo.titulo = this.translate.instant('GLOBAL.subgrupo');
          this.ver_formulario = true;
        }
      });
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_grupo !== undefined) {
        this.inactivarGrupo();
      }
    }
  }

  inactivarGrupo() {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.inactivar_grupo_pregunta'),
      text: this.translate.instant('GLOBAL.inactivar_grupo_info'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      confirmButtonText: this.translate.instant('GLOBAL.inactivar_btn'),
    }).then((result) => {
      if (result.value) {
        this.info_grupo.Activo = false;
        this.catalogoBienesHelper.putGrupo(this.info_grupo, this.info_grupo.Id).subscribe(res => {
          if (res !== null) {
            this.pUpManager.showSuccessAlert(this.translate.instant('GLOBAL.inactivar_exito'));
            this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/pages/catalogo_bienes/inactiva_grupos']);
            });
          } else {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.inactivar_fallido'));
          }
        });
      }
    });
  }

}
