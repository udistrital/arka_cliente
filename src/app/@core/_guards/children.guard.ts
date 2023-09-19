import { Injectable } from '@angular/core';
import { Router, CanLoad, Route, UrlSegment } from '@angular/router';
import { PopUpManager } from '../../managers/popUpManager';
import { ConfiguracionService } from '../data/configuracion.service';

@Injectable({
  providedIn: 'root',
})

export class CanLoadChildren implements CanLoad {

  constructor(
    private router: Router,
    private menu: ConfiguracionService,
    private pUpManager: PopUpManager,
  ) { }

  canLoad(route: Route, segments: UrlSegment[]) {
    if (!!this.menu.checkSegment(route.path)) {
      return true;
    }

    this.pUpManager.showErrorAlert('No tiene permisos');
    return false;

  }

}
