import { Detalle } from './detalle';
import { TipoBienID } from '../acta_recibido/tipo_bien';
import { TipoNivelID } from './tipo_nivel';
import { BaseId } from '../base';

export class SubgrupoComun extends BaseId {
  Codigo: string;
  Nombre: string;
  Descripcion: string;
  Activo: boolean;
  TipoNivelId: TipoNivelID;
}

export class Subgrupo extends SubgrupoComun {
  FechaCreacion: Date;
  FechaModificacion: Date;
}

export class Grupo extends SubgrupoComun {
  Catalogo: BaseId;
  DetalleId?: number;
  Depreciacion?: boolean;
  Valorizacion?: boolean;
  Amortizacion?: boolean;
  TipoBienId?: TipoBienID;
  VidaUtil?: number;
  ValorResidual?: number;
}
