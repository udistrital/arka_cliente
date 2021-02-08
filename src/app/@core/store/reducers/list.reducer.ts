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

  static ListReducerPlanCuentasDebito(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.PlanCuentasDebito:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerPlanCuentasCredito(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.PlanCuentasCredito:
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

  static ListReducerDependencias(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.Dependencias:
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

  static ListReducerConsumo(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.Consumo:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerConsumoControlado(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.ConsumoControlado:
        return [...state, action.payload];
      default:
        return state;
    }
  }

  static ListReducerDevolutivo(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.Devolutivo:
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

  static ListReducerClases(state: Array<any> = new Array, action) {
    switch (action.type) {
      case REDUCER_LIST.Clases:
        return [...state, action.payload];
      default:
        return state;
    }
  }

}
