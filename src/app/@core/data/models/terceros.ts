/**
 * Modelos asociados al CRUD API de Terceros
 */

import { Base } from './base';

export class TipoContribuyente extends Base {
    Nombre: string;
    CodigoAbreviacion: string;
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

export class TipoDocumento extends Base {
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    NumeroOrden: number;
}

export class DatosIdentificacion extends Base {
    TipoDocumentoId: Partial<TipoDocumento>;
    TerceroId: Partial<Tercero>;
    Numero: string;
    DigitoVerificacion: number;
    CiudadExpedicion: number;
    FechaExpedicion: Date;
    DocumentoSoporte: number;
}
