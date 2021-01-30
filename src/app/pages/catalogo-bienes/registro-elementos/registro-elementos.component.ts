import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { ToasterService } from 'angular2-toaster';
import { PopUpManager } from '../../../managers/popUpManager';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { FORM_ELEMENTO } from './form-elemento';
import { Elemento } from '../../../@core/data/models/catalogo/elemento';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';

@Component({
  selector: 'ngx-registro-elementos',
  templateUrl: './registro-elementos.component.html',
  styleUrls: ['./registro-elementos.component.scss'],
})
export class RegistroElementosComponent implements OnInit {

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
    this.catalogoId = catalogo;
  }

  receiveMessage(event) {
    this.catalogoElementosService.getSubgrupoById(event.Id).subscribe(
      res => {
        // console.log(res[0]);
        if (Object.keys(res[0]).length !== 0) {
          this.subgrupo = event;
          this.ver_formulario = true;
        } else {
          this.ver_formulario = false;
        }
      });
  }

  validarForm(event) {
    if (event.valid) {
      if (this.info_elemento === undefined && this.subgrupo !== undefined) {
        const elemento = new Elemento;
        elemento.Nombre = event.data.Grupo.Nombre;
        elemento.Descripcion = event.data.Grupo.Descripcion;
        elemento.FechaInicio = new Date(event.data.Grupo.FechaInicio);
        elemento.FechaFin = new Date(event.data.Grupo.FechaFin);
        elemento.Activo = true;
        elemento.SubgrupoId = this.subgrupo;
        this.catalogoElementosService.postElemento(elemento).subscribe(res => {
          if (res !== null) {
            this.pUpManager.showSuccesToast('Registro Exitoso');
            this.pUpManager.showSuccessAlert('Elemento registrado satisfactoriamente!');
            this.cleanForm();
          } else {
            this.pUpManager.showErrorAlert('No es posible hacer el registro.');
          }
        });
      } else {
        this.pUpManager.showErrorAlert('Debe seleccionar un subgrupo del catálogo de elementos');
        // this.updateSubgrupo1(event.data.Subgrupo1);
      }
    }
  }

  cleanForm() {
    this.clean = !this.clean;
    this.info_elemento = undefined;
  }

}
