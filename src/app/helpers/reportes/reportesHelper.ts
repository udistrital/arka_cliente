import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';
import { RequestManager } from '../../managers/requestManager';

export type TipoReporte = 'entradas' | 'salidas' | 'consolidado_inventario';

export interface GenerarReportePayload {
  tipo_reporte: TipoReporte;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface ArchivoReporte {
  fileName: string;
  mimeType: string;
  file: string;
  version?: string;
}

const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Injectable({
  providedIn: 'root',
})
export class ReportesHelper {

  constructor(
    private rqManager: RequestManager,
    private translate: TranslateService,
    private pUpManager: PopUpManager,
  ) { }

  public generarReporte(payload: GenerarReportePayload) {
    this.rqManager.setPath('ARKA_SERVICE');
    return this.rqManager.post('reportes/generar', payload).pipe(
      map((res: any) => {
        const data = res && res.Body ? res.Body : res;
        if (!data || data.Type === 'error' || data.success === false || data.Success === false) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.reportes.error_generacion'));
          return undefined;
        }
        return this.normalizarArchivoReporte(data);
      }),
    );
  }

  public downloadBase64Excel(base64: string, fileName: string, mimeType: string = EXCEL_MIME_TYPE): void {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType || EXCEL_MIME_TYPE });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName || 'reporte.xlsx';
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();
  }

  private normalizarArchivoReporte(response: any): ArchivoReporte {
    const file = response.file || response.File || response.archivo || response.Archivo || '';
    return {
      fileName: response.fileName || response.FileName || response.file_name || 'reporte.xlsx',
      mimeType: response.mimeType || response.MimeType || response.mime_type || EXCEL_MIME_TYPE,
      file: typeof file === 'string' ? file.trim() : '',
      version: response.version || response.Version || '',
    };
  }
}
