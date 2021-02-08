import { Proveedor } from '../data/models/acta_recibido/Proveedor';
import { Cuenta } from '../data/models/catalogo/cuenta_contable';
import { Ubicacion } from '../data/models/acta_recibido/soporte_acta';
import { Dependencia } from '../data/models/oikos';
import { EstadoActa } from '../data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../data/models/acta_recibido/estado_elemento';
import { TipoBien } from '../data/models/acta_recibido/tipo_bien';
import { Impuesto } from '../data/models/parametros_gobierno/impuesto';
import { Unidad } from '../data/models/acta_recibido/unidades';
import { Subgrupo } from '../data/models/catalogo/jerarquia';

export interface IAppState {
  listProveedores: Proveedor[];
  listPlanCuentasCredito: Cuenta[];
  listPlanCuentasDebito: Cuenta[];
  listSedes: Ubicacion[];
  listDependencias: Dependencia[];
  listUbicaciones: Ubicacion[];
  listEstadosActa: EstadoActa[];
  listEstadosElemento: EstadoElemento[];
  listTipoBien: TipoBien[];
  listIVA: Impuesto[];
  listUnidades: Unidad[];
  listConsumo: Subgrupo[];
  listConsumoControlado: Subgrupo[];
  listDevolutivo: Subgrupo[];
  listFormatosKardex: any[];
  listEstadosMovimiento: any[];
  listFormatosMovimiento: any[];
  listClases: Subgrupo[];
}
