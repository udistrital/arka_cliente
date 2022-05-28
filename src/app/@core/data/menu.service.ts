import { Injectable } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ConfiguracionService } from './configuracion.service';
import { RequestManager } from '../../managers/requestManager';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Menu, TipoOpcion } from './models/configuracion_crud';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'application/json',
  }),
};
const path = environment.CONF_MENU_SERVICE;

@Injectable()
export class MenuService {

  /*
  private path = 'CONF_MENU_SERVICE';
  // */

  constructor(
    /*
    private reqManager: RequestManager,
    // */
    private http: HttpClient,
    private translate: TranslateService,
    private confService: ConfiguracionService,
  ) {
  }

  // Peticiones "listas"

  traerMenus(): Observable<Partial<Menu>[]> {
    return this.confService.getConfig().pipe(map(
      (res: Partial<Menu>[]) => {
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
    return m
      .filter(op => op.TipoOpcion === TipoOpcion.Menu)
      .map(original => {
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

  get(roles) {
    return this.http.get(path + this.getStringRolesUrl(roles) + '/arka_ii_main', httpOptions).pipe(
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError({
      status: error.status,
      message: 'Something bad happened; please try again later.',
    });
  }

  private getStringRolesUrl(roles: string[], separador: string = ','): string {
    return roles
      .join(separador)
      .replace(/\//g, '');
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
