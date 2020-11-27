export class TipoBienID {
    Id: number;
}

export class TipoBien extends TipoBienID {
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean;
    NumeroOrden: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
}
