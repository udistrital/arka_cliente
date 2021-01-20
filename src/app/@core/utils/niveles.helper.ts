import { Nivel_t } from '../data/models/catalogo/tipo_nivel';

const jerarquia = [
  // [Padre, Hijo]
  [Nivel_t.Grupo, Nivel_t.Segmento],
  [Nivel_t.Segmento, Nivel_t.Familia],
  [Nivel_t.Familia, Nivel_t.Clase],
  [Nivel_t.Clase, undefined],
];

const grupoTraducciones = [
  [Nivel_t.Grupo, 'grupo'],
  [Nivel_t.Segmento, 'segmento'],
  [Nivel_t.Familia, 'familia'],
  [Nivel_t.Clase, 'clase'],
];

export class NivelHelper {

  // Retorna el nivel jerárquico que debería tener un subgrupo hijo
  // en función del nivel jerárquico del padre.
  static Hijo(nivelPadre: Nivel_t): Nivel_t {
    if (Object.values(Nivel_t).includes(nivelPadre)) {
      const result = jerarquia.filter((regla) => regla[0] === nivelPadre);
      return result[0][1];
    } else return undefined;
  }

  // Retorna el grupo de localizacion que debería usarse para los textos
  // (Usar con src/assets/i18n/*.json > GLOBAL.subgrupo.xxx. ...)
  static Texto(nivel: Nivel_t): string {
    if (Object.values(Nivel_t).includes(nivel)) {
      const result = grupoTraducciones.filter(regla => regla[0] === nivel);
      return <string>result[0][1];
    } else return undefined;
  }
}
