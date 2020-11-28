export enum Nivel {
    Grupo = 1,
    Segmento,
    Familia,
    Clase,
}

export class TipoNivelID {
    Id: Nivel;
}

export class TipoNivel extends TipoNivelID {
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Orden: number;
    Activo: boolean;
}
