import { ActaRecibido } from './acta_recibido';
import { EstadoActa } from './estado_acta';

export class HistoricoActa {
    Id: number;
    ActaRecibidoId: ActaRecibido;
    EstadoActaId: EstadoActa;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
}
