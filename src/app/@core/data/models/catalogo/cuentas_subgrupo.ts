import { FormatoTipoMovimiento } from '../entrada/entrada';
import { CuentaContable } from './cuenta_contable';

import { Subgrupo } from './jerarquia';

export class CuentasGrupoTransaccion {
    Id: number;
    CuentaCreditoId: CuentaContable;
    CuentaDebitoId: CuentaContable;
    SubtipoMovimientoId: FormatoTipoMovimiento;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: Subgrupo;
}
