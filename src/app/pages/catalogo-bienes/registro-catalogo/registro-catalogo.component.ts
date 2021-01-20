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
  uid_1: number;
  ModificarGrupo: boolean;
  uid_2: number;
  uid_3: number;
  uid_4: number;
  ver_formulario: boolean;

  nivel_actual: string;
  nivel_hijo: string;

  permitir_crear_subgrupo: boolean;

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
      }
    });
  }

  recargarCatalogo(event) {
    // console.log(event);
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

  AgregarGrupo(id: number) {
    this.QuitarVista();
    this.uid_3 = id;
    this.ver_formulario = true;
  }

  AgregarSubgrupo(id: number) {
    this.QuitarVista();
    this.uid_4 = id;
    this.ver_formulario = true;
  }
  QuitarVista() {
    this.uid_1 = undefined;
    this.uid_2 = undefined;
    this.uid_3 = undefined;
    this.uid_4 = undefined;
    this.ver_formulario = false;
  }

  // Ver formularios de modificacion
  receiveMessage(event) {
    // console.log({'receiveMessage(event)': event});
    this.QuitarVista();
    this.subgrupoPadre = event;
    this.info_grupo = <Grupo>event;
    this.catalogoElementosService.getGrupoById(event.Id).subscribe(
      res => {
        if (Object.keys(res[0]).length !== 0) {
          // Si es grupo (no tiene subgrupo padre, tiene catalogo)
          // console.log({'receiveMessage - res': res});
          this.uid_1 = event.Id;
          this.nivel_hijo = nh.Texto(nh.Hijo(Nivel_t.Grupo));
        } else {
          // Si NO es grupo (es segmento/familia/clase, tiene subgrupo padre)
          this.permitir_crear_subgrupo = false; // Reinicia "permiso"
          this.nivel_actual = undefined; // Reinicia traducción
          this.nivel_hijo = undefined; // Reinicia traducción
          this.catalogoElementosService.getSubgrupoById(event.Id).subscribe( res_sub => {
            // console.log({'receiveMessage - res_sub': res_sub});
            if (Object.keys(res_sub[0]).length !== 0) {
              const nivel = <Nivel_t>(res_sub[0].Subgrupo.TipoNivelId.Id);
              this.permitir_crear_subgrupo = (nivel !== Nivel_t.Clase);
              this.nivel_actual = nh.Texto(nivel);
              this.nivel_hijo = nh.Texto(nh.Hijo(nivel));
            } else {
              // Posible error...
            }
          });
          this.uid_2 = event.Id;
        }
        this.ver_formulario = true;
        // console.log({'permitir_crear_subgrupo': this.permitir_crear_subgrupo});
        // console.log({'modificando_tipo': this.modificando_tipo});
      });
  }
}
