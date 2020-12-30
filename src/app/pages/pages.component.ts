import { Component } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NbMenuItem } from '@nebular/theme';
import { UserService } from '../@core/data/users.service';
import { RolUsuario_t as Rol } from '../@core/data/models/roles/rol_usuario';
import { AutenticationService } from '../@core/utils/authentication.service';

import { MENU_ITEMS } from './pages-menu';

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
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });

    const menu = MENU_ITEMS;
    this.moduloActa(menu);

    this.menu = <NbMenuItem[]>menu.filter(modulo => (modulo.children && modulo.children.length));
    // console.log({'queda': this.auth.remains(), 'expiro': this.auth.expired()});
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
