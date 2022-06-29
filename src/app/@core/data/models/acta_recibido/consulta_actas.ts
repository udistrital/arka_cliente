import { Base } from '../base';
import { EstadoActa } from './estado_acta';

export class ConsultaActaRecibido extends Base {
    FechaVistoBueno: Date;
    Observaciones: string;
    RevisorId: any;
    UbicacionId: string;
    CodigoAbreviacion: string;
    Estado: string;
    PersonaAsignada: any;
}
