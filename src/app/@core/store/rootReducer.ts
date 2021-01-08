import { IAppState } from './app.state';
import { ActionReducerMap } from '@ngrx/store';
import { ListReducer } from './reducers/list.reducer';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';

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
  listFormatosKardex: ListReducer.ListReducerFormatosKardex,
  listEstadosMovimiento: ListReducer.ListReducerEstadosMovimiento,
  listFormatosMovimiento: ListReducer.ListReducerFormatosMovimiento,
  listClases: ListReducer.ListReducerClases,
};
