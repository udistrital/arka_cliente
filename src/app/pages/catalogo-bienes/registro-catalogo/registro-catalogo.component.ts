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

  @Output() eventChange = new EventEmitter();

  catalogos: Array<Catalogo>;
  catalogoId: number;
  subgrupoPadre: Subgrupo;
  subgrupo: Subgrupo;
  modificarGrupo: boolean;
  modificarSubgrupo: boolean;
  crearSubgrupo: boolean;
  ver_formulario: boolean;
  catalogoSeleccionado: number;

  nivel_actual: string;
  nivel_hijo: string;

  permitir_crear_subgrupo: boolean;
  cargando_catalogos: boolean = true;
  stringHeader: string;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.catalogos = new Array<Catalogo>();
    this.loadCatalogos();
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
    this.eventChange.emit(event);
    this.QuitarVista();
  }

  onChange(catalogo) {
    this.catalogoId = catalogo;
    this.QuitarVista();
  }

  AgregarGrupo() {
    this.stringHeader = '.agregar';
    this.catalogoSeleccionado = this.catalogoId;
    this.subgrupo = undefined;
    this.modificarGrupo = true;
    this.modificarSubgrupo = false;
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
