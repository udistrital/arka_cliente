import { OrdenadorGasto } from './ordenador_gasto';
import { Supervisor } from './supervisor';

export class Contrato {
    ContratoId: number;
    FechaSuscripcion: Date;
    Justificacion: string;
    TipoContrato: number;
    OrdenadorGasto: OrdenadorGasto;
    DescripcionFormaPago: string;
    ObjetoContrato: string;
    Contratista: number;
    NumeroContratoSuscrito: number;
    Supervisor: Supervisor;
    LugarEjecucion: number;
    Rubro: string;
    Actividades: string;
    UnidadEjecutora: number;
    NumeroContrato: number;
    PlazoEjecucion: number;
    ValorContrato: number;
}
