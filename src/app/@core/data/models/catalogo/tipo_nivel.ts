export enum Nivel_t {
    Grupo = 1,
    Segmento,
    Familia,
    Clase,
}

export class TipoNivelID {
    Id: Nivel_t;
}

export class TipoNivel extends TipoNivelID {
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Orden: number;
    Activo: boolean;
}
