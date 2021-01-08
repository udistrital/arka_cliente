import { TipoImpuesto } from './tipo_impuesto';

export class Impuesto {
    Id: number;
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean;
    NumeroOrden: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
    TipoImpuestoId: TipoImpuesto;
}
