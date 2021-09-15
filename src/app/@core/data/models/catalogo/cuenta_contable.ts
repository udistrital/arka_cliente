import { NivelClasificacion } from './nivel_clasificacion';


export class Cuenta {
    Id: number;
    Nombre: string;
    Naturaleza: string;
    Descripcion: string;
    Codigo: string;
    NivelClasificacion: NivelClasificacion;
}

export class CuentaContable extends Cuenta {
    Id: number;
    Saldo: number;
}
