/**
 * Modelos asociados al CRUD API de Terceros
 */

import { Base } from './base';

export class TipoContribuyente extends Base {
    Nombre: string;
    CodigoAbreviaion: string; // TODO: Cambiar cuando se corrija en la API de terceros
    Descripcion: string;
}

export class Tercero extends Base {
    NombreCompleto: string;
    PrimerNombre: string;
    SegundoNombre: string;
    PrimerApellido: string;
    SegundoApellido: string;
    LugarOrigen: number;
    FechaNacimiento: Date;
    TipoContribuyenteId: Partial<TipoContribuyente>;
}
