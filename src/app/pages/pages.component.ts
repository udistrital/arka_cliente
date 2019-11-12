import { Component } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

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

  constructor(private translate: TranslateService,
    ) {
      this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      });
    }

  menu = MENU_ITEMS;
}
