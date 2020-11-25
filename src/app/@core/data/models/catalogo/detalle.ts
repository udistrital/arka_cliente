import { SubgrupoID } from './jerarquia';
import { TipoBien } from '../acta_recibido/tipo_bien';

export class Detalle {
  Id: number;
  Depreciacion: boolean;
  Valorizacion: boolean;
  Deterioro: boolean;
  Activo: boolean;
  SubgrupoId: SubgrupoID;
  TipoBienId: TipoBien;
  FechaCreacion: Date;
  FechaModificacion: Date;
}
