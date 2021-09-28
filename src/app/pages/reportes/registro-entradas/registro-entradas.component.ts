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
  detalle: boolean;
  loading: boolean;

  @ViewChild('spagoBIDocumentArea') spagoBIDocumentArea: ElementRef;
  @Input() reportConfig: any;

  constructor(private router: Router, private translate: TranslateService, private toasterService: ToasterService) {
    // this.loadParametros();
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
    this.consecutivo  = 'P1-00419-2021'
    this.url = environment.SPAGOBI.PROTOCOL + '://' + environment.SPAGOBI.HOST +
      '/' + environment.SPAGOBI.CONTEXTPATH + '/' +
      '/servlet/AdapterHTTP?ACTION_NAME=EXECUTE_DOCUMENT_ACTION&NEW_SESSION=TRUE&IGNORE_SUBOBJECTS_VIEWPOINTS_SNAPSHOTS=true&flag=0&TOOLBAR_VISIBLE=true&OBJECT_LABEL=' +
      environment.SPAGOBI.DOCUMENT_LABEL_ENTRADAS + '&PARAMETERS=consecutivo=' + this.consecutivo;
    this.loading = false;



      console.log(this.url)
    if (this.consecutivo === '') {
      this.reportConfig = {
        documentLabel: environment.SPAGOBI.DOCUMENT_LABEL_ENTRADAS,
        executionRole: '/spagobi/user',
        displayToolbar: true,
        displaySliders: true,
        iframe: {
          style: 'border: solid rgb(0,0,0,0.2) 1px;',
          height: '500px;',
          width: '100%',
        },
      };
    } else {
      const parametros = 'consecutivo=' + this.consecutivo;
      this.reportConfig = {
        documentLabel: environment.SPAGOBI.DOCUMENT_LABEL_ENTRADAS,
        executionRole: '/spagobi/user',
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

  callbackFunction() {
    const iframeSpago = spagoBIService.getDocumentHtml(this.reportConfig);
    console.log(iframeSpago.split('"')[3])
    // this.url = iframeSpago.split('"')[3];
    // this.url = 'https://inteligenciainstitucional.portaloas.udistrital.edu.co/knowage/servlet/AdapterHTTP?ACTION_NAME=EXECUTE_DOCUMENT_ACTION&OBJECT_LABEL=RteTitan&TOOLBAR_VISIBLE=true&ORGANIZATION=DEFAULT_TENANT&NEW_SESSION=true';
    this.loading = false;
  }

  ngOnInit() {
    // this.getReport();
  }

  getReport() {
    this.loading = true;
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
