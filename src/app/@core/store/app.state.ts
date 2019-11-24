import { Proveedor } from '../data/models/acta_recibido/Proveedor';
import { Cuenta } from '../data/models/catalogo/cuenta_contable';
import { Ubicacion, Dependencia } from '../data/models/acta_recibido/soporte_acta';

export interface IAppState {
  listProveedores: Proveedor[];
  listPlanCuentasCredito: Cuenta[];
  listPlanCuentasDebito: Cuenta[];
  listSedes: Ubicacion[];
  listDependencias: Dependencia[];
  listUbicaciones: Ubicacion[];
}
