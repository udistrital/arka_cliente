import { TipoEntrada } from './tipo_entrada';

export class Entrada {
    Id: number;
    Solicitante: number;
    Observacion: string;
    Importacion: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    TipoEntradaId: TipoEntrada;
    ActaRecibidoId: number;
    ContratoId: number;
    Consecutivo: string;
    Vigencia: string;
    OrdenadorId: number;
    RegistroImportacion: string;
    TasaRepresentativaMercado: number;
    Divisa: string;
    EstadoMovimientoId: number;
}

export class Movimiento {
    Id: number;
    Observacion: string;
    Detalle: string;
    Activo: boolean;
    MovimientoPadreId: Movimiento;
    FormatoTipoMovimientoId: FormatoTipoMovimiento;
    EstadoMovimientoId: EstadoMovimiento;
}

export class FormatoTipoMovimiento {
    Id: number;
    Nombre: string;
    Formato: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    NumeroOrden: number;
    Activo: boolean;
}

export class EstadoMovimiento {
    Id: number;
    Nombre: string;
    Activo: boolean;
    Descripcion: string;
}

export class TrMovimiento extends Movimiento {
    SoporteMovimientoId: number;
}

export class TransaccionEntrada {
    Id: number;
    Observacion: string;
    Detalle: string;
    FormatoTipoMovimientoId: string;
    SoporteMovimientoId: number;
}

export class ElementoMovimientosArka {
    Id: number;
    ElementoActaId: number;
    Activo: boolean;
    SaldoCantidad: number;
    SaldoValor: number;
    Unidad: number;
    ValorUnitario: number;
    ValorTotal: number;
    VidaUtil: number;
    ValorResidual: number;
}

export class TrSalida {
    Salida: Movimiento;
    Elementos: ElementoMovimientosArka[];
}
