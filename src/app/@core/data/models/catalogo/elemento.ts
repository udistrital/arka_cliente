import { SubgrupoID } from './jerarquia';

export class Elemento {
    Id: number;
    Nombre: string;
    Descripcion: string;
    FechaInicio: Date;
    FechaFin: Date;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: SubgrupoID;
}
