import { BaseId } from '../base';
import { Cuenta } from './cuenta_contable';


export class CuentaGrupo extends BaseId {
    CuentaDebitoId: number;
    CuentaCreditoId: number;
    SubtipoMovimientoId: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: Partial<BaseId>;
    Tipo_Texto: string;
    orden: number;
}
export class CuentasFormulario {
    CuentaCreditoId: Cuenta;
    CuentaDebitoId: Cuenta;
}
export class ObservableCuentas {
    Movimiento: number;
    Cuentas: CuentasFormulario;
}
