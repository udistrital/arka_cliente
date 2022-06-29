import { BaseId } from '../base';
import { Movimiento } from '../entrada/entrada';

export class DetalleTraslado {
    FuncionarioOrigen: number;
    FuncionarioDestino: string;
    Elementos: Array<number>;
    Ubicacion: string;
    Consecutivo: string;
    ConsecutivoId: number;
    RazonRechazo: string;
}

export class FormatoAjuste {
    RazonRechazo: string;
    TrContable: any;
    ConsecutivoId: Number;
    Consecutivo: string;
}

export class SoporteMovimiento extends BaseId {
    DocumentoId: number;
    Activo: boolean;
    MovimientoId: Movimiento;
}

export class DetalleBaja {
    Elementos: Array<number>;
    Funcionario: number;
    Consecutivo: string;
    ConsecutivoId: number;
    FechaRevisionA: string;
    Revisor: number;
    FechaRevisionC: string;
    RazonRechazo: string;
    Resolucion: string;
}

export class TrSoporteMovimiento {
    Movimiento: Movimiento;
    Soporte: SoporteMovimiento;
}
