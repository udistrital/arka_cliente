import { Injectable } from '@angular/core';
import { IAppState } from '../app.state';
import { Store } from '@ngrx/store';
import { REDUCER_LIST } from '../reducer.constants';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { Observable } from 'rxjs';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Impuesto } from '../../data/models/acta_recibido/elemento';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';
@Injectable()
export class ListService {

  constructor(
    private ActaRecibido: ActaRecibidoHelper,
    private CatalogoElementos: CatalogoElementosHelper,
    private BodegaConsumo: BodegaConsumoHelper,
    private store: Store<IAppState>) {
  }

  public findProveedores() {

    this.store.select(REDUCER_LIST.Proveedores).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getProveedores()
            .subscribe(
              (res: any[]) => {

                for (const index in res) {
                  if (res.hasOwnProperty(index)) {
                    res[index].compuesto = res[index].NumDocumento + ' - ' + res[index].NomProveedor;
                  }
                }
                this.addList(REDUCER_LIST.Proveedores, res);

              },
              error => {
                this.addList(REDUCER_LIST.Proveedores, []);
              },
            );
        }
      },
    );
  }
  public findPlanCuentasCredito() {

    this.store.select(REDUCER_LIST.PlanCuentasCredito).subscribe(
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

    this.store.select(REDUCER_LIST.PlanCuentasDebito).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.CatalogoElementos.getPlanCuentas('credito') // tema de base financiera desplegada debito
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

    this.store.select(REDUCER_LIST.Sedes).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametrosSoporte()
            .subscribe(
              (res: any[]) => {
                console.log(res)
                this.addList(REDUCER_LIST.Sedes, res[0].Sedes);
              },
              error => {
                this.addList(REDUCER_LIST.Sedes, []);
              },
            );
        }
      },
    );
  }
  public findDependencias() {

    this.store.select(REDUCER_LIST.Dependencias).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametrosSoporte()
            .subscribe(
              (res: any[]) => {

                this.addList(REDUCER_LIST.Dependencias, res[0].Dependencias);
              },
              error => {
                this.addList(REDUCER_LIST.Dependencias, []);
              },
            );
        }
      },
    );
  }
  public findUbicaciones() {

    this.store.select(REDUCER_LIST.Ubicaciones).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametrosSoporte()
            .subscribe(
              (res: any[]) => {

                this.addList(REDUCER_LIST.Ubicaciones, res[0].Ubicaciones);
              },
              error => {
                this.addList(REDUCER_LIST.Ubicaciones, []);
              },
            );
        }
      },
    );
  }

  public findEstadosActa() {

    this.store.select(REDUCER_LIST.EstadosActa).subscribe(
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

    this.store.select(REDUCER_LIST.EstadosElemento).subscribe(
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

    this.store.select(REDUCER_LIST.TipoBien).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.ActaRecibido.getParametros()
            .subscribe(
              (res: any[]) => {

                this.addList(REDUCER_LIST.TipoBien, res[0].TipoBien);
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

    this.store.select(REDUCER_LIST.Unidades).subscribe(
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

    this.store.select(REDUCER_LIST.IVA).subscribe(
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
                        res[index].IVA[index2].ImpuestoId.CodigoAbreviacion;
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


  public findSubgruposConsumo() {

    this.store.select(REDUCER_LIST.Consumo).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.CatalogoElementos.getSubgrupoTipoBien(1)
            .subscribe(
              (res: any[]) => {
                // console.log(res)
                this.addList(REDUCER_LIST.Consumo, res);
              },
              error => {
                this.addList(REDUCER_LIST.Consumo, []);
              },
            );
        }
      },
    );
  }
  public findSubgruposConsumoControlado() {

    this.store.select(REDUCER_LIST.ConsumoControlado).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.CatalogoElementos.getSubgrupoTipoBien(2)
            .subscribe(
              (res: any[]) => {
                // console.log(res)
                this.addList(REDUCER_LIST.ConsumoControlado, res);
              },
              error => {
                this.addList(REDUCER_LIST.ConsumoControlado, []);
              },
            );
        }
      },
    );
  }
  public findSubgruposDevolutivo() {

    this.store.select(REDUCER_LIST.Devolutivo).subscribe(
      (list: any) => {
        if (!list || list.length === 0) {
          this.CatalogoElementos.getSubgrupoTipoBien(3)
            .subscribe(
              (res: any[]) => {
                // console.log(res)

                this.addList(REDUCER_LIST.Devolutivo, res);
              },
              error => {
                this.addList(REDUCER_LIST.Devolutivo, []);
              },
            );
        }
      },
    );
  }

  public findformatosKardex() {

    this.store.select(REDUCER_LIST.FormatosKardex).subscribe(
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

    this.store.select(REDUCER_LIST.EstadosMovimiento).subscribe(
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
