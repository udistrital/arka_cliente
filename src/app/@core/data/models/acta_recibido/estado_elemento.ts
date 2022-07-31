export enum EstadoElemento_t {
    Registrado = 1,
    Verificado,
}

export class EstadoElemento {
    Id: number;
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean;
    NumeroOrden: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
}
