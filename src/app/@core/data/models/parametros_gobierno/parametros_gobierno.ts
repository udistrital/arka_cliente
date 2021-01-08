import { Impuesto } from './impuesto';

export class ParametrosGobierno {
    Id: number;
    Activo: boolean;
    Tarifa: number;
    PorcentajeAplicacion: number;
    BaseUvt: number;
    BasePesos: number;
    InicioVigencia: Date;
    FinVigencia: Date;
    Decreto: string;
    FechaCreacion: Date;
    FechaModificacion: Date;
    ImpuestoId: Impuesto;
}
