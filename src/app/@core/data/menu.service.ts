import { Injectable } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ConfiguracionService } from './configuracion.service';
import { RequestManager } from '../../managers/requestManager';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Menu, TipoOpcion } from './models/configuracion_crud';

@Injectable()
export class MenuService {

  /*
  private path = 'CONF_MENU_SERVICE';
  // */

  constructor(
    /*
    private reqManager: RequestManager,
    // */
    private translate: TranslateService,
    private confService: ConfiguracionService,
  ) {
  }

  // Peticiones "listas"

  traerMenus(): Observable<Partial<Menu>[]> {
    return this.confService.getConfig().pipe(map(
      (res: Partial<Menu>[]) => {
        // console.log(this.filtrarMenus(res));
        return this.filtrarMenus(res);
      },
    ));
  }

  // Funciones Auxiliares

  extraerMenus(menus: Partial<Menu>[]) {
    return this.filtrarMenus(menus);
  }

  filtrarMenus(original: Partial<Menu>[]): Partial<Menu>[] {
    return original.filter(opcion => {
      const dejar = opcion.TipoOpcion === TipoOpcion.Menu;
      if (dejar && opcion.Opciones) {
        opcion.Opciones = this.filtrarMenus(opcion.Opciones);
      }
      return dejar;
    });
  }

  convertirMenuNebular(m: Partial<Menu>[], base: string = ''): any[] {
    const keyLevel = base ? base + '.' : '';
    return m.map(original => {
      const newm = {};
      const level = keyLevel + original.Nombre;
      if (original.Nombre !== '') {
        newm['title'] = this.translate.instant(level + '.name');
      }
      if (original.Icono && original.Icono !== '') {
        newm['icon'] = original.Icono;
      }
      if (original.Url !== '') {
        newm['link'] = original.Url;
      }
      if (original.Opciones && Array.isArray(original.Opciones)) {
        newm['children'] = this.convertirMenuNebular(original.Opciones, level + '.children');
      }
      return newm;
    });
  }

  /*
  // Funciones CRUD

  get(endpoint) {
    this.reqManager.setPath(this.path);
    return this.reqManager.get(endpoint);
  }

  post(endpoint, element) {
    this.reqManager.setPath(this.path);
    return this.reqManager.post(endpoint, element);
  }

  put(endpoint, element) {
    this.reqManager.setPath(this.path);
    return this.reqManager.put(endpoint + '/' + element.Id, element);
  }

  delete(endpoint, element) {
    this.reqManager.setPath(this.path);
    return this.reqManager.delete(endpoint, element.Id);
  }
  // */

}
