import { SubgrupoID } from './jerarquia';
import { Cuenta } from './cuenta_contable';


export class CuentaGrupo {
    Id: number;
    CuentaDebitoId: number;
    CuentaCreditoId: number;
    SubtipoMovimientoId: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: Partial<SubgrupoID>;
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
