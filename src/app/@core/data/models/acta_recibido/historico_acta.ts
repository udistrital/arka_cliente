import { Base } from '../base';
import { ActaRecibido } from './acta_recibido';
import { EstadoActa } from './estado_acta';

export class HistoricoActa extends Base {
    ProveedorId: number;
    UbicacionId: number;
    RevisorId: number;
    PersonaAsignadaId: number;
    Observaciones: string;
    FechaVistoBueno: Date;
    ActaRecibidoId: ActaRecibido;
    EstadoActaId: EstadoActa;
}
