import { SubgrupoID, Subgrupo } from './jerarquia';
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

// A usar con SubgrupoTransaccion (tr_grupo)
// TODO: Revisar si es necesaria esta clase despues
// de que se actualice la API
export class SubgrupoDetalle extends Subgrupo {
  DetalleSubgrupo: Detalle;
}
