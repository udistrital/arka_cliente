export class CatalogoID {
    Id: number;
}

export class Catalogo extends CatalogoID {
    Nombre: string;
    Descripcion: string;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
}
