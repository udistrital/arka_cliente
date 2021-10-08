import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FooterService } from '../../../@core/utils/footer.service';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {

  social: any;

  constructor(private footerService: FooterService) { }

  ngOnInit() {
    this.social = {
      list: [
        {
          class: 'fas fa-clock',
          value: this.footerService.getHorarios(),
        },
        {
          class: 'fas fa-globe-americas',
          value: this.footerService.getProceso(),
        },
        {
          class: 'fas fa-phone-alt',
          value: this.footerService.getTelefono(),
        },
        {
          class: 'fas fa-map-marker-alt',
          value: this.footerService.getDireccion(),
        },
        {
          class: 'fas fa-at',
          value: this.footerService.getEmail(),
        },
      ],
    };
  }

}
