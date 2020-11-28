import { Nivel } from '../data/models/catalogo/tipo_nivel';

export class NivelHelper {

  // Retorna el nivel jerárquico que debería tener un subgrupo hijo
  // en función del nivel jerárquico del padre.
  static Hijo(nivelPadre: Nivel): Nivel {
    if (Object.values(Nivel).includes(nivelPadre)) {
      const jerarquia = [
        // [Padre, Hijo]
        [Nivel.Grupo, Nivel.Segmento],
        [Nivel.Segmento, Nivel.Familia],
        [Nivel.Familia, Nivel.Clase],
        [Nivel.Clase, undefined],
      ];
      const result = jerarquia.filter((regla) => regla[0] === nivelPadre);
      return result[0][1];
    } else return undefined;
  }

  // Retorna el grupo de localizacion que debería usarse para los textos
  // (Usar con src/assets/i18n/*.json > GLOBAL.subgrupo.xxx. ...)
  static Texto(nivel: Nivel): string {
    if (Object.values(Nivel).includes(nivel)) {
      const grupoTraducciones = [
        [Nivel.Grupo, 'grupo'],
        [Nivel.Segmento, 'segmento'],
        [Nivel.Familia, 'familia'],
        [Nivel.Clase, 'clase'],
      ];
      const result = grupoTraducciones.filter(regla => regla[0] === nivel);
      return <string>result[0][1];
    } else return undefined;
  }
}
