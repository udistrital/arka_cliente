import { Base } from '../base';
import { EspacioFisico } from '../ubicacion/espacio_fisico';
import { TipoActa } from './tipo_acta';

export class ActaRecibido extends Base {
    TipoActaId: TipoActa;
}

export class ActaRecibidoUbicacion extends Base {
    FechaVistoBueno: Date;
    Observaciones: string;
    RevisorId: number;
    UbicacionId: EspacioFisico;
    CodigoAbreviacion: string;
}
