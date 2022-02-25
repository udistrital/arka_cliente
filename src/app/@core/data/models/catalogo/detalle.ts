import { SubgrupoComun } from './jerarquia';
import { TipoBien } from '../acta_recibido/tipo_bien';

export class DetalleID {
  Id: number;
}

export class Detalle extends DetalleID {
  Depreciacion: boolean;
  Valorizacion: boolean;
  Amortizacion: boolean;
  Activo: boolean;
  SubgrupoId: SubgrupoComun;
  TipoBienId: TipoBien;
  VidaUtil: number;
  ValorResidual: number;
  FechaCreacion: Date;
  FechaModificacion: Date;
}
