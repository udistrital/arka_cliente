import { EspacioFisico } from '../ubicacion/espacio_fisico';

export class ActaRecibido {
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
    FechaVistoBueno: Date;
    Id: number;
    Observaciones: string;
    RevisorId: number;
    UbicacionId: number;
    CodigoAbreviacion: string;
    PersonaAsignada: number;
}

export class ActaRecibidoUbicacion {
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
    FechaVistoBueno: Date;
    Id: number;
    Observaciones: string;
    RevisorId: number;
    UbicacionId: EspacioFisico;
    CodigoAbreviacion: string;
}
