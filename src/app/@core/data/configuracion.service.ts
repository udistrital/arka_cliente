import { Injectable } from '@angular/core';
import { RequestManager } from '../../managers/requestManager';


@Injectable()
export class ConfiguracionService {

  private path: string = 'CONFIGURACION_SERVICE';

  constructor(
    private requestManager: RequestManager,
  ) {
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
