import { Component } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NbMenuItem } from '@nebular/theme';
import { UserService } from '../@core/data/users.service';
import { RolUsuario_t as Rol } from '../@core/data/models/roles/rol_usuario';
import { AutenticationService } from '../@core/utils/authentication.service';
import { PopUpManager } from '../managers/popUpManager';
import { NbToastStatus as s } from '@nebular/theme/components/toastr/model';

import { MENU_ITEMS } from './pages-menu';

/**
 * Tiempo antes que expire el token, en milisegundos
 */
const T_ADV_TIMEOUT: number = 1 * 60 * 1000;

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-sample-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
      <footer></footer>
    </ngx-sample-layout>
  `,
})
export class PagesComponent {

  menu: NbMenuItem[];

  constructor(
    private translate: TranslateService,
    private user: UserService,
    private auth: AutenticationService,
    private pUpManager: PopUpManager,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });

    this.construirMenu();
    this.ajustarNotificacionesTimeoutToken();
  }

  private construirMenu (): void {
    const menu = MENU_ITEMS;
    this.moduloActa(menu);
    this.moduloCatalogo(menu);
    this.menu = <NbMenuItem[]>menu.filter(modulo => (modulo.children && modulo.children.length));
  }

  private ajustarNotificacionesTimeoutToken() {
    const queda = this.auth.remains();
    // console.log({queda});

    // Mostrar el tiempo de la sesion
    window.setTimeout(() => {
      const minutos = Math.trunc(queda / 1000 / 60);
      // this.pUpManager.showToast('basic','msg_58','titulo');
      this.pUpManager.showToast(
        {status: <s>'basic', duration: 6000},
        this.translate.instant('GLOBAL.notificaciones.t_restante', {MINUTES: minutos}),
        this.translate.instant('GLOBAL.info'));

      // TODO: Revisar los colores del tema para usar a futuro el siguiente mensaje:
      // this.pUpManager.showSuccesToast('msg_63');
    });
    // Registrar la notificación cuando esté por expirar el token
    window.setTimeout(() => {
      const minutos = Math.trunc(T_ADV_TIMEOUT / 1000 / 60);
      this.pUpManager.showAlert(
        'warning',
        this.translate.instant('GLOBAL.notificaciones.t_restante_alerta', {MINUTES: minutos}),
        this.translate.instant('GLOBAL.notificaciones.t_restante_titulo'));
    }, queda - T_ADV_TIMEOUT);
  }

  private moduloCatalogo(menu: any) {
    if (this.user.tieneAlgunRol([Rol.AdminContable, Rol.Revisor])) {
      menu.find(item => item.title === 'Catalogo de Elementos').children.push({
        title: 'Asignacion de Cuentas',
        link: '/pages/catalogo_bienes/registro_cuentas_catalogo',
      });
    }
  }

  private moduloActa(menu: any) {

    const hijos = [
      {
        title: 'Consulta de Actas',
        link: '/pages/acta_recibido/consulta_acta_recibido',
      },
    ];

    if (this.user.tieneAlgunRol([Rol.Secretaria, Rol.Admin, Rol.Revisor])) {
      hijos.push({
        title: 'Registro de Acta',
        link: '/pages/acta_recibido/registro_acta_recibido',
      });
    }

    if (this.user.tieneAlgunRol([Rol.Admin, Rol.Revisor])) {
      hijos.push({
        title: 'Registro de Acta Especial',
        link: '/pages/acta_recibido/acta_especial',
      });
    }

    menu.find(item => item.title === 'Acta de Recibido').children = hijos;
  }
}
