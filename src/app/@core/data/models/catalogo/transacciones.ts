import { CatalogoID } from './catalogo';
import { Detalle } from './detalle';
import { SubgrupoID, Grupo, Subgrupo } from './jerarquia';
import { TipoBien } from '../acta_recibido/tipo_bien';

export class GrupoTransaccion {
  Catalogo: CatalogoID;
  Subgrupo: Grupo;
  DetalleSubgrupo: Detalle;
}

export class SubgrupoTransaccion {
  SubgrupoPadre: SubgrupoID;
  SubgrupoHijo: Array<Subgrupo>;
}
