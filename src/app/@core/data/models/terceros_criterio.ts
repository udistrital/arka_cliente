import { EspacioFisico } from './ubicacion/espacio_fisico';
import { Tercero, DatosIdentificacion } from './terceros';
import { Dependencia } from './oikos';
import { BaseId } from './base';

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

export class Supervisor extends BaseId {
    Nombre: string;
    Cargo: string;
    SedeSupervisor: string;
}

export class TerceroCriterioJefe {
    Cargo: number;
    DependenciaId: number;
    TerceroPrincipal: Tercero;
}

export class TerceroCriterioContratista {
    Identificacion: Partial<DatosIdentificacion>;
    Tercero: Partial<Tercero>;
}

export class TerceroCriterioProveedor {
    Identificacion: Partial<DatosIdentificacion>;
    Tercero: Partial<Tercero>;
}
