import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NbMenuItem } from '@nebular/theme';
import { UserService } from '../@core/data/users.service';
import { MenuService } from '../@core/data/menu.service';
import { RolUsuario_t as Rol } from '../@core/data/models/roles/rol_usuario';
import { Menu } from '../@core/data/models/configuracion_crud';
import { AutenticationService } from '../@core/utils/authentication.service';
import { PopUpManager } from '../managers/popUpManager';
import { NbToastStatus as s } from '@nebular/theme/components/toastr/model';

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
export class PagesComponent implements OnInit {

  menu: NbMenuItem[];

  private menus: Partial<Menu>[];

  constructor(
    private translate: TranslateService,
    private user: UserService,
    private auth: AutenticationService,
    private pUpManager: PopUpManager,
    private menuService: MenuService,
  ) {
    this.menu = [];
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.menu = this.menuService.convertirMenuNebular(this.menus, 'MENU.main');
    });

    this.construirMenu();
    this.ajustarNotificacionesTimeoutToken();
  }

  private construirMenu (): void {
    this.menuService.traerMenus().subscribe(m => {
      this.menus = m;
      this.menu = this.menuService.convertirMenuNebular(this.menus, 'MENU.main');
    });
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
}
