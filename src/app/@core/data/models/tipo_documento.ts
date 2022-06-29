import { BaseId } from './base';

export class TipoDocumento extends BaseId {
    Activo: boolean;
    CodigoAbreviacion: string;
    Descripcion: string;
    Extension: string;
    Nombre: string;
    NumeroOrden: number;
    Tamano: number;
    Workspace: string;
    TipoDocumentoNuxeo: string;
}
