import { EspacioFisico } from '../ubicacion/espacio_fisico';
import { TipoActa } from './tipo_acta';

export class ActaRecibido {
    Id: number;
    Activo: boolean;
    TipoActaId: TipoActa;
    UnidadEjecutoraId: number;
    FechaModificacion: Date;
    FechaCreacion: Date;
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
