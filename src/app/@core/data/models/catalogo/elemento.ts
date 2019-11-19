import { Subgrupo } from './subgrupo';

export class Elemento {
    Id: number;
    Nombre: string;
    Descripcion: string;
    FechaInicio: Date;
    FechaFin: Date;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: Subgrupo;
}
