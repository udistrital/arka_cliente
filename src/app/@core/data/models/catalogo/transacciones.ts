import { CatalogoID } from './catalogo';
import { SubgrupoID, Grupo, Subgrupo } from './jerarquia';
import { Detalle } from './detalle'; // TODO: Eliminar una vez se actualice la API

export class GrupoTransaccion {
  Catalogo: CatalogoID;
  Subgrupo: Grupo;
  DetalleSubgrupo: Detalle; // TODO: Eliminar una vez se actualice la API
}

export class SubgrupoTransaccion {
  SubgrupoPadre: SubgrupoID;
  SubgrupoHijo: Array<Subgrupo>;
}
