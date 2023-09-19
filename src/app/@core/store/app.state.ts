import { Cuenta } from '../data/models/catalogo/cuenta_contable';
import { Ubicacion } from '../data/models/acta_recibido/soporte_acta';
import { EstadoActa } from '../data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../data/models/acta_recibido/estado_elemento';
import { TipoBien } from '../data/models/acta_recibido/tipo_bien';
import { Impuesto } from '../data/models/parametros_gobierno/impuesto';
import { Unidad } from '../data/models/acta_recibido/unidades';

export interface IAppState {
  listPlanCuentas: Cuenta[][];
  listSedes: Ubicacion[];
  listEstadosActa: EstadoActa[];
  listEstadosElemento: EstadoElemento[];
  listTipoBien: TipoBien[];
  listIVA: Impuesto[];
  listUnidades: Unidad[];
  listFormatosKardex: any[];
  listEstadosMovimiento: any[];
  listFormatosMovimiento: any[];
  listUnidadesEjecutoras: any[];
  listFuncionarios: any[];
}
