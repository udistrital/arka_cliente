import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { ToasterConfig, ToasterService, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { spagoBIService } from '../../../@core/utils/spagoBIAPI/spagoBIService';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-registro-entradas',
  templateUrl: './registro-entradas.component.html',
  styleUrls: ['./registro-entradas.component.scss'],
})
export class RegistroEntradasComponent implements OnInit {
  url = '';
  config: ToasterConfig;
  consecutivo: string;
  loading: boolean;

  @ViewChild('spagoBIDocumentArea') spagoBIDocumentArea: ElementRef;
  @Input() reportConfig: any;

  constructor(private router: Router, private translate: TranslateService, private toasterService: ToasterService) {
  }

  loadParametros() {
    const navigation = this.router.getCurrentNavigation();
    this.consecutivo = '';
    if (navigation.extras.state) {
      const state = navigation.extras.state as { consecutivo: number };
      this.consecutivo = (state.consecutivo).toString();
    }
  }

  ngOnInit() {
    this.getReport();
  }

  getReport() {
    const parametros = this.consecutivo ? 'consecutivo=' + this.consecutivo : '';
    this.url = spagoBIService.buildUrl('DOCUMENT_LABEL_ENTRADAS', parametros);
    this.loading = false;
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }

  onRegister() {
    this.router.navigate(['/pages/entradas/registro']);
  }


}
