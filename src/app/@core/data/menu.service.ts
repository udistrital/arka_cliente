import { Injectable } from '@angular/core';
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
  ) {
  }

  // Peticiones "listas"

  traerMenus() {
    // TODO: Usar los roles de UserService
    const roles = 'ADMIN_ARKA';
    return this.get(roles + '/arka_ii_main').pipe(map(
      (res: Partial<Menu>[]) => {
        const nm = this.convertirMenuNebular(res);
        // console.log({res, nm});
        return nm;
      },
    ));
  }

  // Funciones Auxiliares

  convertirMenuNebular(m: Partial<Menu>[]): any[] {
    return m.map(original => {
      const newm = {};
      if (original.Nombre !== '') {
        newm['title'] = original.Nombre;
      }
      if (original.Icono && original.Icono !== '') {
        newm['icon'] = original.Icono;
      }
      if (original.Url !== '') {
        newm['link'] = original.Url;
      }
      if (original.Opciones && Array.isArray(original.Opciones)) {
        newm['children'] = this.convertirMenuNebular(original.Opciones);
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
