import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subgrupo } from '../../../@core/data/models/catalogo/subgrupo';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Grupo } from '../../../@core/data/models/catalogo/grupo';
import { Catalogo } from '../../../@core/data/models/catalogo';


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
  }

  onChange(catalogo) {
    this.catalogoId = catalogo;
  }

  AgregarGrupo(id: number) {
    this.uid_1 = undefined;
    this.uid_2 = undefined;
    this.uid_3 = id;
    this.uid_4 = undefined;
  }

  AgregarSubgrupo(id: number) {
    this.uid_1 = undefined;
    this.uid_2 = undefined;
    this.uid_3 = undefined;
    this.uid_4 = id;
  }
  QuitarVista() {
    this.uid_1 = undefined;
    this.uid_2 = undefined;
    this.uid_3 = undefined;
    this.uid_4 = undefined;
  }
  receiveMessage(event) {
    this.subgrupoPadre = event;
    this.info_grupo = <Grupo>event;
    this.catalogoElementosService.getGrupoById(event.Id).subscribe(
      res => {
        if (Object.keys(res[0]).length !== 0) {
          this.uid_1 = event.Id;
          this.uid_2 = undefined;
          this.uid_3 = undefined;
          this.uid_4 = undefined;
        } else {
          this.uid_1 = undefined;
          this.uid_2 = event.Id;
          this.uid_3 = undefined;
          this.uid_4 = undefined;
        }
      });
  }
}
