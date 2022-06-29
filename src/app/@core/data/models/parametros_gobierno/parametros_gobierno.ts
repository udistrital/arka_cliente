import { Base } from '../base';
import { Impuesto } from './impuesto';

export class ParametrosGobierno extends Base {
    Tarifa: number;
    PorcentajeAplicacion: number;
    BaseUvt: number;
    BasePesos: number;
    InicioVigencia: Date;
    FinVigencia: Date;
    Decreto: string;
    ImpuestoId: Impuesto;
}
