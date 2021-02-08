import { EspacioFisico } from './ubicacion/espacio_fisico';
import { Tercero } from './terceros';
import { Dependencia } from './acta_recibido/soporte_acta';

/**
 * Estructura retornada por
 * ARKA_SERVICE/terceros/tipo/funcionarioPlanta
 */
export class TerceroCriterioPlanta {
    Dependencia: Dependencia;
    DependenciaId: number;
    Sede: EspacioFisico;
    TerceroPrincipal: Tercero;
    TipoVinculacion: number;
}
