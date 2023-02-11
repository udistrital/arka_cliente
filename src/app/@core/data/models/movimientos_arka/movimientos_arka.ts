import { Movimiento } from '../entrada/entrada';

export class DetalleTraslado {
    FuncionarioOrigen: number;
    FuncionarioDestino: string;
    Elementos: Array<number>;
    Ubicacion: string;
    RazonRechazo: string;
}

export class FormatoAjuste {
    RazonRechazo: string;
    TrContable: any;
    ConsecutivoId: Number;
    Consecutivo: string;
}

export class SoporteMovimiento {
    Id: number;
    DocumentoId: number;
    Activo: boolean;
    MovimientoId: Movimiento;
}

export class DetalleBaja {
    Elementos: Array<number>;
    Funcionario: number;
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
