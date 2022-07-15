import { SubgrupoComun } from './jerarquia';
import { TipoBien } from '../acta_recibido/tipo_bien';
import { BaseId } from '../base';

export class Detalle extends BaseId {
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
