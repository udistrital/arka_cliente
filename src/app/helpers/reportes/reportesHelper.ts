import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';
import { RequestManager } from '../../managers/requestManager';

export interface GenerarReportePayload {
  fecha_inicial: string;
  fecha_final: string;
}

export interface ArchivoReporte {
  fileName: string;
  mimeType: string;
  file: string;
  version?: string;
}

export interface PazYSalvoPayload {
  usuario: string;
  elaboro_tercero_id: number;
  numero_documento: string;
}

export interface PazYSalvoTercero {
  id: number;
  nombre_completo: string;
  numero_documento: string;
  tipo_documento: string;
  cargo: string;
}

export interface PazYSalvoElemento {
  Id?: number;
  ElementoActaId?: number;
  Placa: string;
  Nombre: string;
  Marca: string;
  Serie: string;
  Valor?: number;
}

export interface PazYSalvoResponse extends ArchivoReporte {
  mensaje: string;
  puede_generar_paz_y_salvo: boolean;
  tercero?: PazYSalvoTercero;
  elementos: PazYSalvoElemento[];
}

export interface DetalleCuentasEntrada {
  ElementoNombre: string;
  ElementoValorFinal: number;
  SalidaFuncionarioAsignado: string;
  CuentaDebitoEntrada: string;
  CuentaCreditoEntrada: string;
}

export interface DetalleCuentasSalida {
  ElementoNombre: string;
  ElementoValorFinal: number;
  SalidaFuncionarioAsignado: string;
  CuentaDebitoSalida: string;
  CuentaCreditoSalida: string;
}

export interface DetalleCuentaSeparada {
  Secuencia: number;
  Cuenta: string;
  Tercero: string;
  Descripcion: string;
  Debito: number;
  Credito: number;
}

const EXCEL_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PDF_MIME_TYPE = 'application/pdf';

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
    return this.rqManager.post('reportes/elementos', payload).pipe(
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

  public getDetalleCuentasEntrada(entradaConsecutivo: string) {
    this.rqManager.setPath('ARKA_SERVICE');
    return this.rqManager.get('reportes/detalle_cuentas_entrada?EntradaConsecutivo=' + encodeURIComponent(entradaConsecutivo)).pipe(
      map((res: any) => {
        if (res === 'error' || res === undefined) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.reportes.error_generacion'));
          return [];
        }
        return this.separarFilasEntrada(Array.isArray(res) ? res : []);
      }),
    );
  }

  public getDetalleCuentasSalida(salidaConsecutivo: string) {
    this.rqManager.setPath('ARKA_SERVICE');
    return this.rqManager.get('reportes/detalle_cuentas_salida?SalidaConsecutivo=' + encodeURIComponent(salidaConsecutivo)).pipe(
      map((res: any) => {
        if (res === 'error' || res === undefined) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.reportes.error_generacion'));
          return [];
        }
        return this.separarFilasSalida(Array.isArray(res) ? res : []);
      }),
    );
  }

  public generarPazYSalvo(payload: PazYSalvoPayload) {
    this.rqManager.setPath('ARKA_SERVICE');
    return this.rqManager.post('reportes/pazysalvo', payload).pipe(
      map((res: any) => {
        const data = res && res.Body ? res.Body : res;
        if (!data || data.Type === 'error' || data.success === false || data.Success === false) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.reportes.error_generacion'));
          return undefined;
        }
        return this.normalizarPazYSalvo(data);
      }),
    );
  }

  private separarFilasEntrada(detalles: DetalleCuentasEntrada[]): DetalleCuentaSeparada[] {
    const filas: DetalleCuentaSeparada[] = [];
    let secuencia = 1;
    detalles.forEach((detalle) => {
      filas.push({
        Secuencia: secuencia++,
        Cuenta: detalle.CuentaDebitoEntrada,
        Tercero: detalle.SalidaFuncionarioAsignado || '',
        Descripcion: detalle.ElementoNombre,
        Debito: detalle.ElementoValorFinal,
        Credito: 0,
      });
      filas.push({
        Secuencia: secuencia++,
        Cuenta: detalle.CuentaCreditoEntrada,
        Tercero: detalle.SalidaFuncionarioAsignado || '',
        Descripcion: detalle.ElementoNombre,
        Debito: 0,
        Credito: detalle.ElementoValorFinal,
      });
    });
    return filas;
  }

  private separarFilasSalida(detalles: DetalleCuentasSalida[]): DetalleCuentaSeparada[] {
    const filas: DetalleCuentaSeparada[] = [];
    let secuencia = 1;
    detalles.forEach((detalle) => {
      filas.push({
        Secuencia: secuencia++,
        Cuenta: detalle.CuentaDebitoSalida,
        Tercero: detalle.SalidaFuncionarioAsignado || '',
        Descripcion: detalle.ElementoNombre,
        Debito: detalle.ElementoValorFinal,
        Credito: 0,
      });
      filas.push({
        Secuencia: secuencia++,
        Cuenta: detalle.CuentaCreditoSalida,
        Tercero: detalle.SalidaFuncionarioAsignado || '',
        Descripcion: detalle.ElementoNombre,
        Debito: 0,
        Credito: detalle.ElementoValorFinal,
      });
    });
    return filas;
  }

  public downloadBase64Excel(base64: string, fileName: string, mimeType: string = EXCEL_MIME_TYPE): void {
    this.downloadBase64File(base64, fileName, mimeType || EXCEL_MIME_TYPE);
  }

  public downloadBase64Pdf(base64: string, fileName: string, mimeType: string = PDF_MIME_TYPE): void {
    this.downloadBase64File(base64, fileName, mimeType || PDF_MIME_TYPE);
  }

  public downloadBase64File(base64: string, fileName: string, mimeType: string): void {
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
    link.download = fileName || 'archivo';
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();
  }

  private normalizarArchivoReporte(response: any): ArchivoReporte {
    const source = this.obtenerFuenteArchivo(response);
    const file = this.obtenerBase64Archivo(source);
    return {
      fileName: this.obtenerValor(source, ['fileName', 'FileName', 'file_name', 'nombre_archivo', 'NombreArchivo']) || 'reporte.xlsx',
      mimeType: this.obtenerValor(source, [
        'mimeType',
        'MimeType',
        'mime_type',
        'tipo_mime',
        'TipoMime',
        'tipo_archivo',
        'TipoArchivo',
      ]) || EXCEL_MIME_TYPE,
      file,
      version: this.obtenerValor(source, ['version', 'Version']) || '',
    };
  }

  private normalizarPazYSalvo(response: any): PazYSalvoResponse {
    const source = this.obtenerFuenteArchivo(response);
    return {
      fileName: this.obtenerValor(source, ['fileName', 'FileName', 'file_name', 'nombre_archivo', 'NombreArchivo']) || 'paz_y_salvo.pdf',
      mimeType: this.obtenerValor(source, [
        'mimeType',
        'MimeType',
        'mime_type',
        'tipo_mime',
        'TipoMime',
        'tipo_archivo',
        'TipoArchivo',
      ]) || PDF_MIME_TYPE,
      file: this.obtenerBase64Archivo(source),
      version: this.obtenerValor(source, ['version', 'Version']) || '',
      mensaje: this.obtenerValor(source, ['mensaje', 'Mensaje']) || '',
      puede_generar_paz_y_salvo: !!this.obtenerValor(source, ['puede_generar_paz_y_salvo', 'PuedeGenerarPazYSalvo']),
      tercero: this.obtenerValor(source, ['tercero', 'Tercero']) || undefined,
      elementos: this.obtenerValor(source, ['elementos', 'Elementos']) || [],
    };
  }

  private obtenerFuenteArchivo(response: any): any {
    if (!response) {
      return {};
    }

    if (typeof response === 'string') {
      return { file: response };
    }

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    if (response.Data && typeof response.Data === 'object') {
      return response.Data;
    }

    if (response.result && typeof response.result === 'object') {
      return response.result;
    }

    if (response.Result && typeof response.Result === 'object') {
      return response.Result;
    }

    return response;
  }

  private obtenerBase64Archivo(source: any): string {
    const rawValue = this.obtenerValor(source, [
      'file',
      'File',
      'archivo',
      'Archivo',
      'archivo_base64',
      'ArchivoBase64',
      'base64',
      'Base64',
      'contenido',
      'Contenido',
      'contenidoBase64',
      'ContenidoBase64',
    ]);

    return typeof rawValue === 'string' ? rawValue.trim() : '';
  }

  private obtenerValor(source: any, keys: string[]): any {
    if (!source || typeof source !== 'object') {
      return undefined;
    }

    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null) {
        return source[key];
      }
    }

    return undefined;
  }
}
