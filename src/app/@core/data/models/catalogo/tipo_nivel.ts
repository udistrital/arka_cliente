export class TipoNivelID {
    Id: number;
}

export class TipoNivel extends TipoNivelID {
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Orden: number;
    Activo: boolean;
}
