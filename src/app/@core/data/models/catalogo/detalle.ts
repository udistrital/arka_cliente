import { SubgrupoID } from './jerarquia';
import { TipoBienID } from '../acta_recibido/tipo_bien';

export class DetalleID {
  Id: number;
}

export class Detalle extends DetalleID {
  Depreciacion: boolean;
  Valorizacion: boolean;
  Deterioro: boolean;
  Activo: boolean;
  SubgrupoId: SubgrupoID;
  TipoBienId: TipoBienID;
  FechaCreacion: Date;
  FechaModificacion: Date;
}
