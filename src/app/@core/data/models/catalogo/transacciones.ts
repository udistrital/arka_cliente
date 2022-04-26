import { CatalogoID } from './catalogo';
import { SubgrupoID, Grupo, Subgrupo } from './jerarquia';
import { Detalle } from './detalle'; // TODO: Eliminar una vez se actualice la API

export class GrupoTransaccion {
  Catalogo: CatalogoID;
  Subgrupo: Subgrupo;
}

export class SubgrupoTransaccion {
  SubgrupoPadre: SubgrupoID;
  SubgrupoHijo: Subgrupo;
}

export class SubgrupoTransaccionDetalle extends SubgrupoTransaccion {
  DetalleSubgrupo: Detalle;
}
