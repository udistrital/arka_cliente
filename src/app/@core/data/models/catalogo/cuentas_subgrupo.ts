import { CuentaContable } from './cuenta_contable';

import { Subgrupo } from './jerarquia';

export class CuentasGrupoTransaccion {
    Id: number;
    CuentaCreditoId: CuentaContable;
    CuentaDebitoId: CuentaContable;
    SubtipoMovimientoId: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: Subgrupo;
}
