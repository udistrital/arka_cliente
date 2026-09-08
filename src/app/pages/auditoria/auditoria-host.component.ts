import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'ngx-auditoria-host',
  templateUrl: './auditoria-host.component.html',
  styleUrls: ['./auditoria-host.component.scss'],
})
export class AuditoriaHostComponent {

  @ViewChild(
    'auditoriaFrame',
    { static: false },
  )
  auditoriaFrame: ElementRef<HTMLIFrameElement>;

  loading = true;
  errorMessage = '';

  /**
   * El iframe notifica cuando su host interno
   * está preparado para recibir la configuración.
   */
  @HostListener(
    'window:message',
    ['$event'],
  )
  onMessage(
    event: MessageEvent,
  ): void {

    if (
      event.origin !==
      window.location.origin
    ) {
      return;
    }

    if (
      !event.data ||
      event.data.source !==
        'ARKA_AUDITORIA_HOST'
    ) {
      return;
    }

    switch (event.data.type) {

      case 'AUDITORIA_HOST_READY':

        this.initializeMicrofrontend();
        break;

      case 'AUDITORIA_MF_READY':

        this.loading = false;
        this.errorMessage = '';
        break;

      case 'AUDITORIA_MF_ERROR':

        this.loading = false;

        this.errorMessage =
          event.data.payload &&
          event.data.payload.message
            ? event.data.payload.message
            : 'No fue posible cargar Auditoría';

        break;
    }
  }

  private initializeMicrofrontend(): void {

    if (
      !this.auditoriaFrame ||
      !this.auditoriaFrame.nativeElement ||
      !this.auditoriaFrame.nativeElement.contentWindow
    ) {
      return;
    }

    this.auditoriaFrame
      .nativeElement
      .contentWindow
      .postMessage(
        {
          source: 'ARKA_CLIENTE',

          type:
            'AUDITORIA_MF_INIT',

          payload: {
            mainJsUrl:
              environment
                .AUDITORIA_MF
                .MAIN_JS,

            clienteId:
              environment
                .TOKEN
                .CLIENTE_ID,
          },
        },

        window.location.origin,
      );
  }
}
