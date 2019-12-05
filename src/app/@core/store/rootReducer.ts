import { IAppState } from './app.state';
import { ActionReducerMap } from '@ngrx/store';
import { ListReducer } from './reducers/list.reducer';

export const rootReducer: ActionReducerMap<IAppState> = {
  listProveedores: ListReducer.ListReducerProveedor,
  listPlanCuentasDebito: ListReducer.ListReducerPlanCuentasDebito,
  listPlanCuentasCredito: ListReducer.ListReducerPlanCuentasCredito,
  listSedes: ListReducer.ListReducerSedes,
  listDependencias: ListReducer.ListReducerDependencias,
  listUbicaciones: ListReducer.ListReducerUbicaciones,
  listEstadosActa: ListReducer.ListReducerEstadosActa,
  listEstadosElemento: ListReducer.ListReducerEstadosElemento,
  listTipoBien: ListReducer.ListReducerTipoBien,
  listIVA: ListReducer.ListReducerIVA,
  listUnidades: ListReducer.ListReducerUnidades,
  listConsumo: ListReducer.ListReducerConsumo,
  listConsumoControlado: ListReducer.ListReducerConsumoControlado,
  listDevolutivo: ListReducer.ListReducerDevolutivo,
};
