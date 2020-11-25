import { CatalogoID, Catalogo } from './catalogo';
import { TipoBien } from '../acta_recibido/tipo_bien';
import { VerDetalleComponent } from '../../../../pages/acta-recibido/ver-detalle/ver-detalle.component';

export class SubgrupoID {
  Id: number;
}

export class SubgrupoComun extends SubgrupoID {
  Codigo: number;
  Nombre: string;
  Descripcion: string;
  Activo: boolean;
}

export class Subgrupo extends SubgrupoComun {
  FechaCreacion: Date;
  FechaModificacion: Date;
  TipoBienId: TipoBien;
}

export class Grupo extends SubgrupoComun {
  Catalogo: CatalogoID;
  // TipoBienId: TipoBien;
}

// A eliminar ?
export class Grupo2 extends Grupo {
  Depreciacion: boolean;
  Valorizacion: boolean;
  Deterioro: boolean;
  TipoBienId: TipoBien;
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
