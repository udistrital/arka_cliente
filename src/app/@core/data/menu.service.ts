import { Injectable } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HttpErrorManager } from '../../managers/errorManager';
import { RequestManager } from '../../managers/requestManager';
import { catchError, map } from 'rxjs/operators';
import { Menu } from './models/configuracion_crud';

@Injectable()
export class MenuService {

  private path = 'CONF_MENU_SERVICE';

  constructor(
    private reqManager: RequestManager,
    private errManager: HttpErrorManager,
    private translate: TranslateService,
  ) {
  }

  // Peticiones "listas"

  traerMenus() {
    // TODO: Usar los roles de UserService
    const roles = 'ADMIN_ARKA';
    return this.get(roles + '/arka_ii_main').pipe(map(
      (res: Partial<Menu>[]) => {
        return res;
      },
    ));
  }

  // Funciones Auxiliares

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

  // Funciones CRUD

  get(endpoint) {
    this.reqManager.setPath(this.path);
    return this.reqManager.get(endpoint).pipe(
      catchError(this.errManager.handleError),
    );
  }

  post(endpoint, element) {
    this.reqManager.setPath(this.path);
    return this.reqManager.post(endpoint, element).pipe(
      catchError(this.errManager.handleError),
    );
  }

  put(endpoint, element) {
    this.reqManager.setPath(this.path);
    return this.reqManager.put(endpoint + '/' + element.Id, element).pipe(
      catchError(this.errManager.handleError),
    );
  }

  delete(endpoint, element) {
    this.reqManager.setPath(this.path);
    return this.reqManager.delete(endpoint, element.Id).pipe(
      catchError(this.errManager.handleError),
    );
  }

}
