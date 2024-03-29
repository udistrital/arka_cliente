import { EspacioFisico } from './ubicacion/espacio_fisico';
import { Tercero, DatosIdentificacion } from './terceros';
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

export class Supervisor {
    Id: number;
    Nombre: string;
    Cargo: string;
    SedeSupervisor: string;
    DependenciaSupervisor: string;
}

export class Ordenador {
    Id: number;
    NombreOrdenador: string;
    RolOrdenador: string;
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
