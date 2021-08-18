import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Grupo, Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { NivelHelper as nh } from '../../../@core/utils/niveles.helper';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';


@Component({
  selector: 'ngx-registro-catalogo',
  templateUrl: './registro-catalogo.component.html',
  styleUrls: ['./registro-catalogo.component.scss'],
})
export class RegistroCatalogoComponent implements OnInit {

  grupo_id: number;

  @Output() eventChange = new EventEmitter();

  info_grupo: Grupo;
  formGrupo: any;
  regGrupo1: any;
  clean: boolean;
  catalogos: Array<Catalogo>;
  catalogoId: number;
  subgrupoPadre: Subgrupo;
  subgrupoHijo: Subgrupo;
  modificarGrupo: boolean;
  uid_2: number;
  uid_4: number;
  ver_formulario: boolean;
  grupoSeleccionado: Subgrupo;
  catalogoSeleccionado: number;

  nivel_actual: string;
  nivel_hijo: string;

  permitir_crear_subgrupo: boolean;
  cargando_catalogos: boolean = true;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.catalogos = new Array<Catalogo>();
    this.catalogoId = 0;
    this.loadCatalogos();
  }

  ngOnInit() {
    this.nivel_actual = undefined;
    this.nivel_hijo = undefined;
    this.permitir_crear_subgrupo = false;
  }

  useLanguage(language: string) {
    this.translate.use(language);
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

  recargarCatalogo(event) {
    //  console.log('recarga');
    this.eventChange.emit(true);
    setTimeout(() => {
      this.QuitarVista();
    }, 2000);

    // this.ver_formulario = false;
  }

  onChange(catalogo) {
    this.catalogoId = catalogo;
    this.QuitarVista();
  }

  AgregarGrupo() {
    this.catalogoSeleccionado = this.catalogoId;
    this.grupoSeleccionado = undefined;
    this.modificarGrupo = true;
    this.ver_formulario = true;
  }

  AgregarSubgrupo() {
    this.stringHeader = '.agregar';
    this.nivel_actual = this.nivel_hijo;
    this.crearSubgrupo = true;
    this.modificarSubgrupo = true;
    this.modificarGrupo = false;
    this.subgrupo = this.subgrupoPadre;
    this.permitir_crear_subgrupo = false;
  }

  QuitarVista() {
    this.modificarGrupo = false;
    this.modificarSubgrupo = false;
    this.crearSubgrupo = false;
    this.subgrupo = undefined;
    this.subgrupoPadre = undefined;
    this.catalogoSeleccionado = undefined;
    this.ver_formulario = false;
  }

  // Ver formularios de modificacion
  receiveMessage(event) {
    const nivel = <Nivel_t>(event.TipoNivelId.Id);
    this.QuitarVista();
    this.stringHeader = '.modificar';
    this.subgrupo = event;
    this.subgrupoPadre = event;
    this.nivel_hijo = nh.Texto(nh.Hijo(nivel));
    if (nivel === Nivel_t.Grupo) {
      // Si es grupo (no tiene subgrupo padre, tiene catalogo)
      this.modificarGrupo = true;
      this.ver_formulario = true;
    } else {
      // Si NO es grupo (es segmento/familia/clase, tiene subgrupo padre)
      this.permitir_crear_subgrupo = (nivel !== Nivel_t.Clase);
      this.nivel_actual = nh.Texto(nivel);
      this.modificarSubgrupo = true;
      this.ver_formulario = true;
    }
  }
}
