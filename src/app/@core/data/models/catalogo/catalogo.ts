export class CatalogoID {
    Id: number;
}

export class Catalogo extends CatalogoID {
    Nombre: string;
    Descripcion: string;
    FechaInicio: Date;
    FechaFin: Date;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
}
