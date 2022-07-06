import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';
import { UserService } from './users.service';
import { Menu, Parametro, TipoOpcion } from './models/configuracion_crud';
import { Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ConfiguracionService {

  private path: string = 'CONFIGURACION_SERVICE';
  private app: string = 'arka_ii_main';

  private configuraciones: Partial<Menu>[];
  private $conf: Subject<Partial<Menu>[]>;

  constructor(
    private requestManager: RequestManager,
    private userService: UserService,
  ) {
    this.configuraciones = [];
    this.$conf = new Subject<Partial<Menu>[]>();
    /*
    // SOLO PARA PRUEBAS
    const parametro = 'modificandoCuentas';
    this.getParametro(parametro).pipe(map(res => res[0])).subscribe((res: Parametro) => {
      console.log({parametro, 'GET':res});
      const newVal = (res.Valor === "true") ? "false" : "true";
      res.Valor = newVal;
      this.setParametro(res).subscribe(res2 => {
        console.log({parametro, 'PUT': res2});
      });
    });
    console.log(this.getAccion('ocultarCatalogo'));
    // */
  }

  getConfig() {
    return this.$conf.asObservable();
  }

  getParametro(parametro: string) {
    const endpoint = 'parametro?query=Aplicacion__Nombre:' + this.app + ',Nombre:' + parametro;
    return this.get(endpoint).pipe(map(res => {
      if (Array.isArray(res) && res.length === 1) {
        return res[0];
      }
    }));
  }

  getAllParametro(query: string) {
    const endpoint = 'parametro?query=Aplicacion__Nombre:' + this.app + ',' + query;
    return this.get(endpoint).pipe(map(res => {
      if (res) {
        return res;
      }
    }));
  }

  setParametro(parametro: Parametro) {
    return this.put('parametro', parametro);
  }

  setAcciones(configuraciones: any) {
    this.configuraciones = configuraciones;
  }

  getAccion(accion: string): Partial<Menu> {
    return this.findAccion(this.configuraciones, accion);
  }

  getRoute(accion: string): Partial<Menu> {
    return this.findRoute(this.configuraciones, accion);
  }

  checkSegment(segments: string[]) {
    return this.checkSegments(this.configuraciones, segments.join('/').replace(/\d+$/, ':id'));
  }

  findRoute(menu: Partial<Menu>[], option: string) {
    return menu.find(opt => (opt.Url === option) ||
      (opt.Opciones && opt.Opciones.length && this.findRoute(opt.Opciones, option)));
  }

  findAccion(menu: Partial<Menu>[], option: string) {
    return menu.find(opt => (opt.TipoOpcion === TipoOpcion.Accion && opt.Nombre === option) ||
      (opt.Opciones && opt.Opciones.length && this.findAccion(opt.Opciones, option)));
  }

  checkSegments(menu: Partial<Menu>[], segment: string) {
    return menu.some(opt => (opt.Url.includes(segment)) ||
      (opt.Opciones && opt.Opciones.length && this.checkSegments(opt.Opciones, segment)));
  }

  // Funciones CRUD

  get(endpoint) {
    this.requestManager.setPath(this.path);
    return this.requestManager.get(endpoint);
  }

  post(endpoint, element) {
    this.requestManager.setPath(this.path);
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint, element) {
    this.requestManager.setPath(this.path);
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint, element) {
    this.requestManager.setPath(this.path);
    return this.requestManager.delete(endpoint, element.Id);
  }
}
