import { Base } from '../base';
import { TipoImpuesto } from './tipo_impuesto';

export class Impuesto extends Base {
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    NumeroOrden: number;
    TipoImpuestoId: TipoImpuesto;
}
