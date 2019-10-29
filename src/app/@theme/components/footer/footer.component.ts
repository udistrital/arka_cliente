import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
})
export class FooterComponent {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.matIconRegistry.addSvgIcon(
      'clock-outline',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/images/clock-outline.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'globe-outline',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/images/globe-outline.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'at-outline',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/images/at-outline.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'phone-outline',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/images/phone-outline.svg'
      )
    );

    this.matIconRegistry.addSvgIcon(
      'pin-outline',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../assets/images/pin-outline.svg'
      )
    );
      }


}
