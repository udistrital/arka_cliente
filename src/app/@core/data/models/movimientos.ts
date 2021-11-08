import { Base } from './base';

export class TipoMovimientoKronos extends Base {
    Nombre: string;
    Descripcion: string;
    Acronimo: string;
    Parametros: string;
}

export class TipoMovimientoArka extends Base {
    Nombre: string;
    Formato: any;
    Descripcion: string;
    CodigoAbreviacion: string;
    NumeroOrden: number;
}
