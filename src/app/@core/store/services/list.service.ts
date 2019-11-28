import { Injectable } from '@angular/core';
import { IAppState } from '../app.state';
import { Store } from '@ngrx/store';
import { REDUCER_LIST } from '../reducer.constants';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { Observable } from 'rxjs';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
@Injectable()
export class ListService {

  constructor(
    private ActaRecibido: ActaRecibidoHelper,
    private CatalogoElementos: CatalogoElementosHelper,
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

  private addList(type: string, object: Array<any>) {
    this.store.dispatch({
      type: type,
      payload: object,
    });
  }
}
