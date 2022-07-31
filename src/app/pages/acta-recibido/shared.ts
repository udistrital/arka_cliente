import { EstadoActa_t } from '../../@core/data/models/acta_recibido/estado_acta';
import { TerceroCriterioContratista, TerceroCriterioProveedor } from '../../@core/data/models/terceros_criterio';

export class CommonActas {

  static async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  static preparaSedes(sedes: any) {
    if (!(sedes && sedes.length)) {
      return [];
    }
    return sedes.sort((a, b) => a.Nombre.toLowerCase().localeCompare(b.Nombre.toLowerCase()));
  }

  static preparaDependencias(dependencias: any) {
    if (!(dependencias && dependencias.length)) {
      return [];
    }
    return dependencias.sort((a, b) => a.Nombre.toLowerCase().localeCompare(b.Nombre.toLowerCase()));
  }

  static convierteDependencias(dependencias: any) {
    return dependencias.map((dep) => { return {
      value: dep.Id,
      name: dep.Nombre,
    }; });
  }

  static muestraContratista(contr: TerceroCriterioContratista): string {
    if (contr && contr.Identificacion) {
      return contr.Identificacion.TipoDocumentoId.CodigoAbreviacion + ':' + contr.Identificacion.Numero + ' - ' + contr.Tercero.NombreCompleto;
    } else {
      if (contr) {
        return contr.Tercero.NombreCompleto;
      }
    }
  }

  static muestraProveedor(prov: Partial<TerceroCriterioProveedor>): string {
    if (prov) {
      const str = prov.Identificacion ? prov.Identificacion.TipoDocumentoId.CodigoAbreviacion + ':' + prov.Identificacion.Numero + ' - ' : '';
      return str + prov.Tercero.NombreCompleto;
    }
  }

  static i18nEstado(estado: EstadoActa_t): string {
    return 'GLOBAL.Acta_Recibido.EstadosActa.' + EstadoActa_t[estado];
  }

}
