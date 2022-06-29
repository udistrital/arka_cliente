import { BaseId } from './base';

export class TipoTraduccion extends BaseId {
  Nombre: string;
  Descripcion: string;
  Codigoabreviacion: string;
  Activo: boolean;
  Numeroorden: number;
}
