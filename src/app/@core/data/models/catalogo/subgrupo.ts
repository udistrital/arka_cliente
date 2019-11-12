import { Grupo } from './grupo';
import { TipoBien } from '../acta_recibido/tipo_bien';

export class Subgrupo {
  Id: number;
  Codigo: number;
  Nombre: string;
  Descripcion: string;
  FechaCreacion: Date;
  FechaModificacion: Date;
  Activo: boolean;
  TipoBienId: TipoBien;
}

export class SubgrupoTransaccion {
  SubgrupoPadre: Subgrupo;
  SubgrupoHijo: Array<Subgrupo>;
}
