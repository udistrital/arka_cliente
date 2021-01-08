import { SoporteActa } from './soporte_acta';
import { ActaRecibido } from './acta_recibido';
import { Elemento } from './elemento';
import { HistoricoActa } from './historico_acta';

export class TransaccionSoporteActa {
    SoporteActa: SoporteActa;
    Elementos: Array<Elemento>;
}

export class TransaccionActaRecibido {
    ActaRecibido: ActaRecibido;
    UltimoEstado: HistoricoActa;
    SoportesActa: Array<TransaccionSoporteActa>;
}

