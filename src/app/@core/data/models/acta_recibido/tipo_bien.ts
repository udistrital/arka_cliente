export enum Bien_t {
    consumo = 1,
    consumoControlado,
    devolutivo,
}

export class TipoBienID {
    Id: Bien_t;
}

export class TipoBien extends TipoBienID {
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean;
    NumeroOrden: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
    NecesitaPlaca:  boolean;
    TipoBienPadre: TipoBien;
    Reglas: any;
}
