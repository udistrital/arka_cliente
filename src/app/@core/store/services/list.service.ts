import { Injectable } from '@angular/core';
import { IAppState } from '../app.state';
import { Store } from '@ngrx/store';
import { REDUCER_LIST } from '../reducer.constants';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';
@Injectable()
export class ListService {

  constructor(
    private ActaRecibido: ActaRecibidoHelper,
    private CatalogoElementos: CatalogoElementosHelper,
    private BodegaConsumo: BodegaConsumoHelper,
    private oikosHelper: OikosHelper,
    private store: Store<IAppState>,
  ) { }

  public findPlanCuentasCredito() {

    this.store.select(<any>REDUCER_LIST.PlanCuentasCredito).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.CatalogoElementos.getPlanCuentas('credito')
            .subscribe(
              (res: any[]) => {

                this.addList(REDUCER_LIST.PlanCuentasCredito, res);
              },
              error => {
                this.addList(REDUCER_LIST.PlanCuentasCredito, []);
              },
            );
        }
      },
    );
  }

  public findPlanCuentasDebito() {

    this.store.select(<any>REDUCER_LIST.PlanCuentasDebito).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.CatalogoElementos.getPlanCuentas('debito') // tema de base financiera desplegada debito
            .subscribe(
              (res: any[]) => {
                this.addList(REDUCER_LIST.PlanCuentasDebito, res);
              },
              error => {
                this.addList(REDUCER_LIST.PlanCuentasDebito, []);
              },
            );
        }
      },
    );
  }

  public findSedes() {
    this.store.select(<any>REDUCER_LIST.Sedes).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.oikosHelper.getSedes()
            .subscribe(
              (res: any[]) => {
                this.addList(REDUCER_LIST.Sedes, res);
              },
              error => {
                this.addList(REDUCER_LIST.Sedes, []);
              },
            );
        }
      },
    );
  }

  public findUnidadesEjecutoras() {

    this.store.select(<any>REDUCER_LIST.UnidadesEjecutoras).subscribe(
      (list: any) => {
        if (!list || !list.length || !list[0].length) {
          this.ActaRecibido.getUnidadEjecutoraByID('?query=TipoParametroId__CodigoAbreviacion:UE')
            .subscribe(
              (res: any) => {
                if (res.Data.length) {
                  this.addList(REDUCER_LIST.UnidadesEjecutoras, res.Data);
                }
              },
              error => {
                this.addList(REDUCER_LIST.UnidadesEjecutoras, []);
              },
            );
        }
      },
    );
  }

  public findListsActa() {

    this.store.select(<any>REDUCER_LIST.EstadosActa).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametros()
            .subscribe(
              (res: any[]) => {
                this.addList(REDUCER_LIST.EstadosActa, res[0].EstadoActa);
                this.addList(REDUCER_LIST.EstadosElemento, res[0].EstadoElemento);
                this.addList(REDUCER_LIST.Unidades, res[0].Unidades);
                this.addList(REDUCER_LIST.IVA, res[0].IVA);
              },
              error => {
                this.addList(REDUCER_LIST.EstadosActa, []);
                this.addList(REDUCER_LIST.EstadosElemento, []);
                this.addList(REDUCER_LIST.Unidades, []);
                this.addList(REDUCER_LIST.IVA, []);
              },
            );
        }
      },
    );
  }

  public findEstadosActa() {

    this.store.select(<any>REDUCER_LIST.EstadosActa).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametros()
            .subscribe(
              (res: any[]) => {

                this.addList(REDUCER_LIST.EstadosActa, res[0].EstadoActa);
              },
              error => {
                this.addList(REDUCER_LIST.EstadosActa, []);
              },
            );
        }
      },
    );
  }

  public findEstadosElemento() {

    this.store.select(<any>REDUCER_LIST.EstadosElemento).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametros()
            .subscribe(
              (res: any[]) => {

                this.addList(REDUCER_LIST.EstadosElemento, res[0].EstadoElemento);
              },
              error => {
                this.addList(REDUCER_LIST.EstadosElemento, []);
              },
            );
        }
      },
    );
  }

  public findTipoBien() {

    this.store.select(<any>REDUCER_LIST.TipoBien).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.CatalogoElementos.getTipoBien()
            .subscribe(
              (res: any[]) => {
                this.addList(REDUCER_LIST.TipoBien, res);
              },
              error => {
                this.addList(REDUCER_LIST.TipoBien, []);
              },
            );
        }
      },
    );
  }

  public findUnidades() {

    this.store.select(<any>REDUCER_LIST.Unidades).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametros()
            .subscribe(
              (res: any[]) => {

                this.addList(REDUCER_LIST.Unidades, res[0].Unidades);
              },
              error => {
                this.addList(REDUCER_LIST.Unidades, []);
              },
            );
        }
      },
    );
  }

  public findImpuestoIVA() {

    this.store.select(<any>REDUCER_LIST.IVA).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametros()
            .subscribe(
              (res: any[]) => {

                for (const index in res) {
                  if (res.hasOwnProperty(index)) {
                    for (const index2 in res[index].IVA) {
                      if (true) {
                        res[index].IVA[index2].Nombre = res[index].IVA[index2].Tarifa.toString() + '% ' +
                        res[index].IVA[index2].CodigoAbreviacion;
                      }
                    }
                    // console.log(res[index].IVA)
                  }
                }
                this.addList(REDUCER_LIST.IVA, res[0].IVA);
              },
              error => {
                this.addList(REDUCER_LIST.IVA, []);
              },
            );
        }
      },
    );
  }

  public findformatosKardex() {

    this.store.select(<any>REDUCER_LIST.FormatosKardex).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.BodegaConsumo.getFormatosKardex()
            .subscribe(
              (res: any[]) => {
                // console.log(res)

                this.addList(REDUCER_LIST.FormatosKardex, res);
              },
              error => {
                this.addList(REDUCER_LIST.FormatosKardex, []);
              },
            );
        }
      },
    );
  }

  public findEstadosMovimiento() {

    this.store.select(<any>REDUCER_LIST.EstadosMovimiento).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.BodegaConsumo.getEstadosMovimiento()
            .subscribe(
              (res: any[]) => {
                // console.log(res)

                this.addList(REDUCER_LIST.EstadosMovimiento, res);
              },
              error => {
                this.addList(REDUCER_LIST.EstadosMovimiento, []);
              },
            );
        }
      },
    );
  }

  private addList(type: string, object: Array<any>) {
    this.store.dispatch({
      type: type,
      payload: object,
    });
  }
}
