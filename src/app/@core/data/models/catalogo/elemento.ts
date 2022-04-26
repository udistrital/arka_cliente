import { SubgrupoID } from './jerarquia';

export class Elemento {
    Id: number;
    Codigo: string;
    Nombre: string;
    Descripcion: string;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: SubgrupoID;
}
