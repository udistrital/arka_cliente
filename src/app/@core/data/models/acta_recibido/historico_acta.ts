import { ActaRecibido } from './acta_recibido';
import { EstadoActa } from './estado_acta';

export class HistoricoActa {
    Id: number;
    ProveedorId: number;
    UbicacionId: number;
    RevisorId: number;
    PersonaAsignadaId: number;
    Observaciones: string;
    FechaVistoBueno: Date;
    ActaRecibidoId: ActaRecibido;
    EstadoActaId: EstadoActa;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
}
