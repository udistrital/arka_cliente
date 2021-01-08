import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { ToasterConfig, ToasterService, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService } from '@ngx-translate/core';
import { spagoBIService } from '../../../@core/utils/spagoBIAPI/spagoBIService';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-registro-entradas',
  templateUrl: './registro-entradas.component.html',
  styleUrls: ['./registro-entradas.component.scss'],
})
export class RegistroEntradasComponent implements OnInit {

  config: ToasterConfig;
  consecutivo: string;
  detalle: boolean;

  @ViewChild('spagoBIDocumentArea') spagoBIDocumentArea: ElementRef;
  @Input() reportConfig: any;

  constructor(private router: Router, private translate: TranslateService, private toasterService: ToasterService) {
    this.loadParametros();
    this.initReportConfig();
  }

  loadParametros() {
    const navigation = this.router.getCurrentNavigation();
    this.consecutivo = '';
    if (navigation.extras.state) {
      const state = navigation.extras.state as { consecutivo: number };
      this.consecutivo = (state.consecutivo).toString();
    }
  }

  initReportConfig() {
    if (this.consecutivo === '') {
      this.reportConfig = {
        documentLabel: 'prueba_arka',
        executionRole: '/spagobi/user/admin',
        displayToolbar: true,
        displaySliders: true,
        iframe: {
          style: 'border: solid rgb(0,0,0,0.2) 1px;',
          height: '500px;',
          width: '100%',
        },
      };
    } else {
      const parametros = 'consecutivo=' + this.consecutivo + '&outputType=PDF';
      this.reportConfig = {
        documentLabel: 'prueba_arka',
        executionRole: '/spagobi/user/admin',
        // parameters: {'PARAMETERS': 'param_1=1&param_2=2'},
        parameters: { 'PARAMETERS': parametros },
        displayToolbar: true,
        displaySliders: true,
        iframe: {
          style: 'border: solid rgb(0,0,0,0.2) 1px;',
          height: '500px;',
          width: '100%',
        },
      };
    }
  }

  callbackFunction(result, args, success) {
    if (success === true) {
      const html = spagoBIService.getDocumentHtml(this.reportConfig);
      this.spagoBIDocumentArea.nativeElement.innerHTML = html;
    } else {
      // console.info('ERROR: authentication failed! Invalid username and/or password ');
      const message = this.translate.instant('reportes.error_obteniendo_reporte');
      this.spagoBIDocumentArea.nativeElement.innerHTML = `<h5>${message}</h5>`;
      this.showToast('error', 'Error', this.translate.instant('reportes.error_obteniendo_reporte'));
    }
  }

  ngOnInit() {
    this.getReport();
  }

  getReport() {
    spagoBIService.getReport(this, this.callbackFunction);
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
