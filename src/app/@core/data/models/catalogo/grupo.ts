import { Catalogo } from '../catalogo';
import { TipoBien } from '../acta_recibido/tipo_bien';
import { VerDetalleComponent } from '../../../../pages/acta-recibido/ver-detalle/ver-detalle.component';
import { Subgrupo } from './subgrupo';

export class Grupo {
  Id: number;
  Codigo: number;
  Nombre: string;
  Descripcion: string;
  Activo: boolean;
  Catalogo: Catalogo;
  // TipoBienId: TipoBien;
}

export class Grupo2 {
  Id: number;
  Codigo: number;
  Nombre: string;
  Descripcion: string;
  Activo: boolean;
  Catalogo: Catalogo;
  Depreciacion: boolean;
  Valorizacion: boolean;
  Deterioro: boolean;
  TipoBienId: TipoBien;
}

export class Detalle {
  Id: number;
  Depreciacion: boolean;
  Valorizacion: boolean;
  Deterioro: boolean;
  Activo: boolean;
  SubgrupoId: Subgrupo;
  TipoBienId: TipoBien;
  FechaCreacion: Date;
  FechaModificacion: Date;
}

export class GrupoTransaccion {
    Catalogo: Catalogo;
    Subgrupo: Grupo;
    DetalleSubgrupo: Detalle;
  }
