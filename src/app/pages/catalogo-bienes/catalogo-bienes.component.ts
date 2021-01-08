import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'ngx-catalogo-bienes',
  template: `<router-outlet></router-outlet>`,
})
export class CatalogoBienesComponent implements OnInit {

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  ngOnInit() {
  }

}
