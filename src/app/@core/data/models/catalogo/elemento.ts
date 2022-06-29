import { BaseId } from '../base';

export class Elemento extends BaseId {
    Codigo: string;
    Nombre: string;
    Descripcion: string;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: BaseId;
}
