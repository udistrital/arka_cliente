import { Component, OnInit } from '@angular/core';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-consulta-catalogo',
  templateUrl: './consulta-catalogo.component.html',
  styleUrls: ['./consulta-catalogo.component.scss'],
})
export class ConsultaCatalogoComponent implements OnInit {

  catalogos: Array<Catalogo>;
  catalogoId: number;
  cargando_catalogos: boolean = true;

  constructor(private catalogoHelper: CatalogoElementosHelper) {
    this.catalogos = new Array<Catalogo>();
  }

  ngOnInit() {
    this.loadCatalogos();
  }

  loadCatalogos() {
    this.catalogoId = 0;
    this.catalogoHelper.getCatalogos().subscribe((res) => {
      if (res !== null) {
        const data = <Array<Catalogo>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos)) {
            this.catalogos.push(data[datos]);
            this.cargando_catalogos = false;
          }
        }
      }
    });
  }

  onChange(catalogo) {
    this.catalogoId = catalogo;
  }

}
