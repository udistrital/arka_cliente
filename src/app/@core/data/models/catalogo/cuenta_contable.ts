import { NivelClasificacion } from './nivel_clasificacion';

export class CuentaContable {
    Id: number;
    Saldo: number;
}

export class Cuenta {
    Id: number;
    Nombre: string;
    Naturaleza: string;
    Descripcion: string;
    Codigo: string;
    NivelClasificacion: NivelClasificacion;
}
