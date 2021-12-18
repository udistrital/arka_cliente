import { Soporte } from '../../../../pages/entradas/soporteHelper';
import { Movimiento } from '../entrada/entrada';

export class DetalleTraslado {
    FuncionarioOrigen: number;
    FuncionarioDestino: string;
    Elementos: Array<number>;
    Ubicacion: string;
    Consecutivo: string;
    RazonRechazo: string;
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
    Consecutivo: string;
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
