import { Subgrupo } from './jerarquia';
import { Detalle } from './detalle'; // TODO: Eliminar una vez se actualice la API
import { BaseId } from '../base';

export class GrupoTransaccion {
  Catalogo: BaseId;
  Subgrupo: Subgrupo;
}

export class SubgrupoTransaccion {
  SubgrupoPadre: BaseId;
  SubgrupoHijo: Subgrupo;
}

export class SubgrupoTransaccionDetalle extends SubgrupoTransaccion {
  DetalleSubgrupo: Detalle;
}
