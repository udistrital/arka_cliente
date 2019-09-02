import { EstadoActa } from './estado_acta';

export class ConsultaActaRecibido {
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
    FechaVistoBueno: Date;
    Id: number;
    Observaciones: string;
    RevisorId: number;
    UbicacionId: number;
    CodigoAbreviacion: string;
    Estado: string;

}
