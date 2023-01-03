import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EstadoActa_t } from '../../@core/data/models/acta_recibido/estado_acta';
import { TerceroCriterioContratista, TerceroCriterioProveedor } from '../../@core/data/models/terceros_criterio';

@Injectable()
export class CommonActas {

  constructor(
    private fb: FormBuilder,
  ) { }

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  static muestraContratista(contr: TerceroCriterioContratista): string {
    if (contr && contr.Identificacion.TipoDocumentoId.CodigoAbreviacion) {
      return contr.Identificacion.TipoDocumentoId.CodigoAbreviacion + ' ' + contr.Identificacion.Numero + ' ' + contr.Tercero.NombreCompleto;
    } else {
      if (contr) {
        return contr.Tercero.NombreCompleto;
      }
    }
  }

  static muestraProveedor(prov: Partial<TerceroCriterioProveedor>): string {
    if (prov) {
      const str = prov.Identificacion.TipoDocumentoId.CodigoAbreviacion ?
        prov.Identificacion.TipoDocumentoId.CodigoAbreviacion + ' ' + prov.Identificacion.Numero + ' ' : '';
      return str + prov.Tercero.NombreCompleto;
    }
  }

  static i18nEstado(estado: EstadoActa_t): string {
    return 'GLOBAL.Acta_Recibido.EstadosActa.' + EstadoActa_t[estado];
  }

  get Formulario_2(): FormGroup {
    return this.fb.group({
      Id: [0],
      Consecutivo: [''],
      Fecha_Factura: [''],
      Soporte: ['', Validators.required],
    });
  }

}
