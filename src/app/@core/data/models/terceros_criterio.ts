import { EspacioFisico } from './ubicacion/espacio_fisico';
import { Tercero } from './terceros';
import { Dependencia } from './oikos';

/**
 * Estructura retornada por
 * ARKA_SERVICE/terceros/tipo/funcionarioPlanta
 */
export class TerceroCriterioPlanta {
    Dependencia: Partial<Dependencia>;
    DependenciaId: number;
    Sede: EspacioFisico;
    TerceroPrincipal: Tercero;
    TipoVinculacion: number;
}
