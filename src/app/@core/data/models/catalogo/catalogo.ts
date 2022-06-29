import { BaseId } from '../base';

export class Catalogo extends BaseId {
    Nombre: string;
    Descripcion: string;
    FechaInicio: Date;
    FechaFin: Date;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
}
