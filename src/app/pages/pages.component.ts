import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MenuService } from '../@core/data/menu.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { ImplicitAutenticationService } from './../@core/utils/implicit_autentication.service';
import { environment } from '../../environments/environment';
import { NbSidebarService } from '@nebular/theme';
import { RouteConfigLoadStart, Router } from '@angular/router';
import { Menu } from '../@core/data/models/configuracion_crud';


@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-sample-layout>
      <nb-menu [items]='menu'></nb-menu>
      <router-outlet></router-outlet>
    </ngx-sample-layout>
  `,
})

export class PagesComponent implements OnInit {

  public menu = [];
  hijo: any;
  hijo2: any;
  rol: String;
  dataMenu: any;
  roles: any;

  constructor(
    public menuws: MenuService,
    private autenticacion: ImplicitAutenticationService,
    protected sidebarService: NbSidebarService,
    private router: Router,
    private translate: TranslateService) {
    router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.sidebarService.collapse('menu-sidebar');
      }
    });
  }

  addIcons(tree: any) {
    const trans = tree.map((n: any) => {
      let node = {};
      if (!n.link) {
        node = {
          title: n.title,
          icon: 'nb-list',
          url: n.link,
          home: false,
          key: n.Nombre,
          children: [],
        };
      } else {
        node = {
          title: n.title,
          icon: 'nb-list',
          link: n.link,
          home: false,
          key: n.Nombre,
        };
      }
      if (n.hasOwnProperty('children')) {
        if (n.children !== null) {
          const children = this.addIcons(n.children);
            node = { ...node, ...{ children: children }, ...{ icon: 'nb-compose' } };
          }
          return node;
        } else {
          return node;
        }
      });
    return trans;
  }

  getMenu(roles) {
    this.roles = roles;

    this.menuws.get(roles + '/arka_ii_main').subscribe(
      data => {
        this.dataMenu = this.menuws.filtrarMenus(<Partial<Menu>[]>data);
        this.buildMenu();
      },
      (error: HttpErrorResponse) => {

        if (this.dataMenu === undefined) {
          (Swal as any).fire({
            icon: 'info',
            title: this.translate.instant('ERROR.rol_insuficiente_titulo'),
            text: this.translate.instant('ERROR.rol_insuficiente'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            onAfterClose: () => {
              window.location.href =
                environment.TOKEN.SIGN_OUT_URL +
                '?id_token_hint=' +
                window.localStorage.getItem('id_token') +
                '&post_logout_redirect_uri=' +
                environment.TOKEN.SIGN_OUT_REDIRECT_URL +
                '&state=' +
                window.localStorage.getItem('state');
            },
          });
        } else {
          (Swal as any).fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.menu'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }

      });
  }

  ngOnInit() {
    this.autenticacion.user$.subscribe((data: any) => {
      const { user, userService } = data;
      const roleUser = typeof user.role !== 'undefined' ? user.role : [];
      const roleUserService = typeof userService.role !== 'undefined' ? userService.role : [];
      const roles = (roleUser.concat(roleUserService)).filter((data2: any) => (data2.indexOf('/') === -1));
      this.getMenu(Array.from(new Set(roles)));
    });
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.buildMenu();
    });
  }

  buildMenu(){

    const homeOption = {
      title: this.translate.instant('MENU.main.inicio.name'),
      icon: 'nb-home',
      url: '#/pages/dashboard',
    };

    const menuNb = this.menuws.convertirMenuNebular(this.dataMenu, 'MENU.main');
    this.menu = this.addIcons(menuNb);
    this.menu.unshift(homeOption);
  }

}
