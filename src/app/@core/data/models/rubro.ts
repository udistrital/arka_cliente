import { BaseId } from './base';

export class Rubro extends BaseId {
    Organizacion: number;
    Codigo: string;
    Descripcion: string;
    UnidadEjecutora: number;
    Nombre: string;
    RubroPadre: string;
}
