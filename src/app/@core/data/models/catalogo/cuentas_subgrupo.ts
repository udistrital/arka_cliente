import { TipoMovimientoKronos } from '../movimientos';
import { CuentaContable } from './cuenta_contable';

import { Subgrupo } from './jerarquia';

export class CuentasGrupoTransaccion {
    Id: number;
    CuentaCreditoId: CuentaContable;
    CuentaDebitoId: CuentaContable;
    SubtipoMovimientoId: TipoMovimientoKronos;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Activo: boolean;
    SubgrupoId: Subgrupo;
}
