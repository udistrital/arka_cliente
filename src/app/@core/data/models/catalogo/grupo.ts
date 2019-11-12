import { Catalogo } from '../catalogo';
import { TipoBien } from '../acta_recibido/tipo_bien';

export class Grupo {
  Id: number;
  Codigo: number;
  Nombre: string;
  Descripcion: string;
  Activo: boolean;
  Catalogo: Catalogo;
  // TipoBienId: TipoBien;
}

export class GrupoTransaccion {
    Catalogo: Catalogo;
    Subgrupo: Grupo;
  }
