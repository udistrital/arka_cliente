export enum Acta_t {
    Regular = 1,
    Especial,
    Inmueble,
}

export class TipoActa {
    Id: number;
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
}
