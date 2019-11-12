import { Proveedor } from '../data/models/acta_recibido/Proveedor';
import { Cuenta } from '../data/models/catalogo/cuenta_contable';

export interface IAppState {
  listProveedores: Proveedor[];
  listPlanCuentasCredito: Cuenta[];
  listPlanCuentasDebito: Cuenta[];
}
