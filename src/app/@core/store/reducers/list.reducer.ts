import { REDUCER_LIST } from '../reducer.constants';

export class ListReducer {
  constructor() {
  }

  static ListReducerProveedor(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.Proveedores:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerPlanCuentas(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.PlanCuentas:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerSedes(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.Sedes:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerUnidadesEjecutoras(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.UnidadesEjecutoras:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerUbicaciones(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.Ubicaciones:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerEstadosActa(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.EstadosActa:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerEstadosElemento(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.EstadosElemento:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerTipoBien(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.TipoBien:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerIVA(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.IVA:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerUnidades(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.Unidades:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerFormatosKardex(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.FormatosKardex:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerEstadosMovimiento(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.EstadosMovimiento:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerFormatosMovimiento(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.FormatosMovimiento:
        return [...state, action.payload];
      default:
        return state;
    }
  }

}
