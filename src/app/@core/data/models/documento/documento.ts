import { BaseId } from '../base';
import { TipoDocumento } from './tipo_documento';

export class Documento extends BaseId {
    Descripcion: string;
    Enlace: string;
    Metadatos: string;
    Nombre: string;
    Activo?: boolean;
    TipoDocumento: TipoDocumento;
}
