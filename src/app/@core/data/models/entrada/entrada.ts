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
    ElementoId: number; // REVISAR
    DocumentoContableId: number; // REVISAR
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
