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
}
