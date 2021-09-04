import { CatalogoID, Catalogo } from './catalogo';
import { Detalle } from './detalle';
import { TipoBienID } from '../acta_recibido/tipo_bien';
import { TipoNivelID } from './tipo_nivel';

export class SubgrupoID {
  Id: number;
}

export class SubgrupoComun extends SubgrupoID {
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
  Catalogo: CatalogoID;
  // TipoBienId: TipoBien;
}

export class Clase extends Subgrupo {
  Detalle: Detalle;
}

// A eliminar ?
export class Grupo2 extends Grupo {
  DetalleId: number;
  Depreciacion: boolean;
  Valorizacion: boolean;
  Deterioro: boolean;
  TipoBienId: TipoBienID;
}

// A eliminar ?
export class SubgrupoComun2 extends SubgrupoID {
  Nombre: string;
  Descripcion: string;
  Activo: boolean;
}

// A eliminar ?
export class Grupo3 extends SubgrupoComun2 {
  Catalogo: Catalogo;
}

// A eliminar ?
export class Subgrupo1 extends SubgrupoComun2 {
  Grupo: Grupo;
}

// A eliminar ?
export class Subgrupo2 extends SubgrupoComun2 {
  Subgrupo1: Subgrupo1;
}
