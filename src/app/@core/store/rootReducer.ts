import { IAppState } from './app.state';
import { ActionReducerMap } from '@ngrx/store';
import { ListReducer } from './reducers/list.reducer';

export const rootReducer: ActionReducerMap<IAppState> = {
  listPlanCuentas: ListReducer.ListReducerPlanCuentas,
  listSedes: ListReducer.ListReducerSedes,
  listEstadosActa: ListReducer.ListReducerEstadosActa,
  listEstadosElemento: ListReducer.ListReducerEstadosElemento,
  listTipoBien: ListReducer.ListReducerTipoBien,
  listIVA: ListReducer.ListReducerIVA,
  listUnidades: ListReducer.ListReducerUnidades,
  listFormatosKardex: ListReducer.ListReducerFormatosKardex,
  listEstadosMovimiento: ListReducer.ListReducerEstadosMovimiento,
  listFormatosMovimiento: ListReducer.ListReducerFormatosMovimiento,
  listUnidadesEjecutoras: ListReducer.ListReducerUnidadesEjecutoras,
  listFuncionarios: ListReducer.ListReducerFuncionarios,
};
