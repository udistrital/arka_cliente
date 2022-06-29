import { NivelClasificacion } from './nivel_clasificacion';
import { BaseId } from '../base';

export class Cuenta extends BaseId {
    Nombre: string;
    Naturaleza: string;
    Descripcion: string;
    Codigo: string;
    NivelClasificacion: NivelClasificacion;
}

export class CuentaContable extends Cuenta {
    Saldo: number;
}
