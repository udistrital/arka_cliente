import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Grupo, Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
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

  modificando_tipo: string;
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
    this.modificando_tipo = '';
    this.permitir_crear_subgrupo = false;
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadCatalogos() {
    this.catalogoElementosService.getCatalogo().subscribe((res) => {
      if (res !== null) {
        // console.log(res);
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
    // console.log('event');
    // console.log(event);
    this.QuitarVista();
    this.subgrupoPadre = event;
    this.info_grupo = <Grupo>event;
    // Lo siguiente deberá modificarse de acuerdo a info_grupo
    this.modificando_tipo = 'segmento';
    // TODO: Cambiar la siguiente variable en función de event:
    this.permitir_crear_subgrupo = true;
    this.catalogoElementosService.getGrupoById(event.Id).subscribe(
      res => {
        if (Object.keys(res[0]).length !== 0) {
          // Si es grupo (no tiene subgrupo padre)
          // console.log({'receiveMessage - res': res});
          this.uid_1 = event.Id;
        } else {
          // Si NO es grupo (segmento/familia/...)
          // this.catalogoElementosService.getSubgrupoById(event.Id).subscribe( res_sub => {
          //   console.log({'receiveMessage - res_sub': res_sub});
          // });
          this.uid_2 = event.Id;
        }
        this.ver_formulario = true;
      });
  }
}
