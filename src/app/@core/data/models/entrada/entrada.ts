import { Base, BaseId } from '../base';
import { TipoEntrada } from './tipo_entrada';

export class Entrada extends Base {
    Solicitante: number;
    Observacion: string;
    Importacion: boolean;
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

export class Movimiento extends BaseId {
    Observacion: string;
    Detalle: string;
    Activo: boolean;
    MovimientoPadreId: Movimiento;
    FormatoTipoMovimientoId: FormatoTipoMovimiento;
    EstadoMovimientoId: EstadoMovimiento;
}

export class FormatoTipoMovimiento extends BaseId {
    Nombre: string;
    Formato: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    NumeroOrden: number;
    Activo: boolean;
}

export class EstadoMovimiento extends BaseId {
    Nombre: string;
    Activo: boolean;
    Descripcion: string;
}

export class TrMovimiento extends Movimiento {
    SoporteMovimientoId: number;
}

export class TransaccionEntrada extends BaseId {
    Observacion: string;
    Detalle: any;
    FormatoTipoMovimientoId: string;
    SoporteMovimientoId: number;
}

export class ElementoMovimientosArka extends BaseId {
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
