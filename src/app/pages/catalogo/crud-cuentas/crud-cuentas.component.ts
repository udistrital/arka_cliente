import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { Parametro } from '../../../@core/data/models/configuracion_crud';
import Swal from 'sweetalert2';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { ListService } from '../../../@core/store/services/list.service';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { FormatoTipoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'ngx-crud-cuentas',
  templateUrl: './crud-cuentas.component.html',
  styleUrls: ['./crud-cuentas.component.scss'],
})
export class CrudCuentasComponent implements OnInit {
  catalogos: Array<Catalogo>;
  catalogoId: number;
  subgrupo: Subgrupo;
  infoCuentas: any[];

  spinner: string;
  valid: boolean;
  estado_cargado: boolean;
  actualizar: boolean = false;
  cuentasPendientes: any[];
  texto_sesion_contable: string;
  texto_estado: string;
  modificando_cuentas: boolean;
  claseOk: boolean;
  tiposDeEMovimentos: any[];
  movimientoId: number = 0;

  private estadoAsignacionContable: Parametro;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private confService: ConfiguracionService,
    private pUpManager: PopUpManager,
    private listService: ListService,
    private entradasHelper: EntradaHelper,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.spinner = '';
    this.modificando_cuentas = false;
    this.catalogos = new Array<Catalogo>();
    this.catalogoId = 0;
    this.texto_sesion_contable = '';
    this.texto_estado = '';
  }

  ngOnInit() {
    this.listService.findPlanCuentas();
    this.loadCatalogos();
    this.cargarTiposDeMovimientos();
    this.cargaEstadoSesionContable();
  }

  private cargaEstadoSesionContable() {
    if (this.estado_cargado === undefined) {
      this.estado_cargado = false;
      this.confService.getParametro('modificandoCuentas').subscribe({
        next: (p: Parametro) => {
          this.refrescaEstadoSesionContable(p);
        },
        error: () => {
          this.refrescaEstadoSesionContable(undefined);
        },
      });
    }
  }

  private refrescaEstadoSesionContable(p: Parametro) {
    this.estadoAsignacionContable = p || <Parametro>{ Valor: 'false' };
    this.modificando_cuentas = this.estadoAsignacionContable.Valor === 'true';
    this.texto_sesion_contable = this.translate.instant('GLOBAL.cuentas.' + (this.modificando_cuentas ? 'terminar' : 'iniciar') + '_edicion_boton');
    this.texto_estado = this.translate.instant('GLOBAL.cuentas.estado_' + (this.modificando_cuentas ? 'modificando' : 'lectura'));
    this.estado_cargado = true;
  }

  preguntaSesionAsignacionContable() {
    const cambioModo = this.modificando_cuentas ? 'terminar' : 'iniciar';
    const title = this.translate.instant('GLOBAL.cuentas.' + cambioModo + '_edicion_titulo');
    const text = this.translate.instant('GLOBAL.cuentas.' + cambioModo + '_edicion_texto');
    (Swal as any).fire({
      title,
      text,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    }).then(res => {
      if (res.value) {
        this.estado_cargado = false;
        const valorAnterior = this.estadoAsignacionContable.Valor;
        if (this.modificando_cuentas) {
          this.estadoAsignacionContable.Valor = 'false';
        } else {
          this.estadoAsignacionContable.Valor = 'true';
        }
        const query = 'Nombre__in:cierreEnCurso,Valor:true';
        this.confService.getAllParametro(query).subscribe({
          next: (res_) => {
            if (res_ && res_.length) {
              this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCursoCuentas'));
              this.estado_cargado = true;
            } else {
              this.confService.setParametro(this.estadoAsignacionContable).subscribe({
                next: (res__) => {
                  this.refrescaEstadoSesionContable(<Parametro><any>res__);
                  this.actualizar = false;
                  this.cuentasPendientes = [];
                  if (this.subgrupo && this.movimientoId) {
                    this.loadCuentas();
                  }
                  this.estado_cargado = true;
                  (Swal as any).fire({
                    title: this.translate.instant('GLOBAL.Actualizado'),
                    type: 'success',
                    html: this.estadoAsignacionContable.Valor === 'true' ?
                      this.translate.instant('GLOBAL.cuentas.iniciar_edicion_aviso') :
                      this.translate.instant('GLOBAL.cuentas.terminar_edicion_aviso'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                    }
                  });
                },
                error: () => {
                  this.estadoAsignacionContable.Valor = valorAnterior;
                  this.refrescaEstadoSesionContable(this.estadoAsignacionContable);
                  this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.error_actualizar_estado'));
                },
              });
            }
          },
          error: () => {
            this.estado_cargado = true;
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.error_cargar_estado'));
          },
        });
      }
    });
  }

  loadCatalogos() {
    this.spinner = 'Cargando catálogos';
    this.catalogoElementosService.getCatalogo().subscribe((res) => {
      if (res !== null) {
        const data = <Array<Catalogo>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos)) {
            this.catalogos.push(data[datos]);
          }
        }
        this.spinner = '';
      }
    });
  }

  public onChange(catalogo: any = null) {
    if (catalogo) {
      this.catalogoId = catalogo;
    }
    this.claseOk = false;
    this.subgrupo = undefined;
    this.infoCuentas = undefined;
    this.cuentasPendientes = undefined;
    this.movimientoId = 0;
  }

  loadCuentas() {
    if (this.subgrupo && this.movimientoId) {
      const movimientoSeleccionado = this.obtenerMovimientoSeleccionado();
      this.spinner = 'Cargando Cuentas Contables';
      forkJoin({
        cuentas: this.catalogoElementosService.getCuentasContables(this.subgrupo.Id, this.movimientoId),
        detalle: this.catalogoElementosService.getDetalleSubgrupo(this.subgrupo.Id),
      }).subscribe(({ cuentas, detalle }) => {
        this.spinner = '';

        const detalleClase = Array.isArray(detalle) ? detalle.find(item => item && item.TipoBienId) : undefined;

        if (!detalleClase || !detalleClase.TipoBienId) {
          this.resetCuentaState();
          this.pUpManager.showAlertWithOptions(this.optionsNoPArametrizado);
          return;
        }

        this.infoCuentas = this.prepararCuentas(
          Array.isArray(cuentas) ? cuentas : [],
          detalleClase,
          movimientoSeleccionado,
        );
        this.cuentasPendientes = [];
        this.claseOk = !!this.infoCuentas.length;
      });
    } else {
      this.cuentasPendientes = [];
    }
  }

  receiveMessage(event) {
    if (event.TipoNivelId.Id === Nivel_t.Clase) {
      if (this.subgrupo === undefined || this.subgrupo.Id !== event.Id) {
        this.subgrupo = event;
        this.loadCuentas();
      }
    } else {
      this.onChange();
    }
  }

  public onSubmit() {
    if (this.cuentasPendientes.length) {
      this.updateMovimientos();
    }
  }

  private updateMovimientos(): void {
    this.pUpManager.showAlertWithOptions(this.optionsConfirm)
      .then((willDelete) => {
        if (willDelete.value) {
          const cuentasEnviadas = [...this.cuentasPendientes];
          this.spinner = 'Actualizando cuentas contables';
          this.catalogoElementosService.putTransaccionCuentasSubgrupo(this.cuentasPendientes, this.subgrupo.Id)
            .subscribe((res: any) => {
              this.spinner = '';
              if (res) {
                this.validarPersistenciaCuentas(cuentasEnviadas);
              }
            }, () => {
              this.spinner = '';
              this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.error_guardado'));
            });
        }
      });
  }

  public setValidness(event) {
    this.valid = event;
  }

  public setPendientes(event) {
    this.actualizar = false;
    this.cuentasPendientes = event;
  }

  private prepararCuentas(cuentas: any[], detalleClase: any, movimiento: FormatoTipoMovimiento): any[] {
    const tipoBien = detalleClase && detalleClase.TipoBienId ? detalleClase.TipoBienId : undefined;
    const cuentasExistentes = Array.isArray(cuentas) ? cuentas : [];
    const tipoBienId = tipoBien && tipoBien.Id ? tipoBien.Id : 0;
    const cuentasTipoActual = cuentasExistentes.filter(cuenta => cuenta && cuenta.TipoBienId && cuenta.TipoBienId.Id === tipoBienId);
    const cuentasEsperadas = this.buildCuentasTemplate(detalleClase, movimiento);

    if (!cuentasEsperadas.length) {
      return cuentasTipoActual;
    }

    const cuentasSincronizadas = cuentasEsperadas.map((cuentaEsperada) => {
      const cuentaActual = cuentasTipoActual.find((cuenta) => this.isSameCuentaConfig(cuenta, cuentaEsperada));

      if (cuentaActual) {
        return {
          ...cuentaActual,
          Depreciacion: !!cuentaEsperada.Depreciacion,
          Amortizacion: !!cuentaEsperada.Amortizacion,
        };
      }

      const cuentaPrevia = cuentasExistentes.find((cuenta) =>
        this.isSameCuentaConfig(cuenta, cuentaEsperada) && this.hasConfiguredAccounts(cuenta));

      if (cuentaPrevia) {
        return this.buildCuentaTemplate(
          cuentaEsperada.TipoMovimientoId,
          cuentaEsperada.SubtipoMovimientoId,
          tipoBien,
          cuentaPrevia.CuentaDebitoId,
          cuentaPrevia.CuentaCreditoId,
          detalleClase,
        );
      }

      return cuentaEsperada;
    });

    const extrasTipoActual = cuentasTipoActual.filter((cuentaActual) =>
      !cuentasEsperadas.some((cuentaEsperada) => this.isSameCuentaConfig(cuentaActual, cuentaEsperada)));

    return cuentasSincronizadas.concat(extrasTipoActual);
  }

  private buildCuentasTemplate(detalleClase: any, movimiento: FormatoTipoMovimiento): any[] {
    const tipoBien = detalleClase && detalleClase.TipoBienId ? detalleClase.TipoBienId : undefined;

    if (!tipoBien || !tipoBien.Id || !movimiento || !movimiento.Id) {
      return [];
    }

    const salidaAsociada = this.obtenerMovimientoSalidaAsociado(movimiento);
    const cuentas = [
      this.buildCuentaTemplate(this.emptyTipoMovimiento(), movimiento, tipoBien),
      this.buildCuentaTemplate(movimiento, salidaAsociada, tipoBien),
    ];

    if (this.debeCrearCuentaAjusteValor(detalleClase, movimiento)) {
      cuentas.push(this.buildCuentaTemplate(
        movimiento,
        this.obtenerMovimientoDepreciacion(),
        tipoBien,
        null,
        null,
        detalleClase,
      ));
    }

    return cuentas;
  }

  private buildCuentaTemplate(
    tipoMovimiento: FormatoTipoMovimiento,
    subtipoMovimiento: FormatoTipoMovimiento,
    tipoBien: any,
    cuentaDebitoId: any = null,
    cuentaCreditoId: any = null,
    detalleClase: any = null,
  ) {
    return {
      Id: 0,
      CuentaCreditoId: cuentaCreditoId,
      CuentaDebitoId: cuentaDebitoId,
      TipoMovimientoId: this.normalizeTipoMovimiento(tipoMovimiento),
      SubtipoMovimientoId: this.normalizeTipoMovimiento(subtipoMovimiento),
      TipoBienId: tipoBien,
      SubgrupoId: this.subgrupo ? this.subgrupo.Id : null,
      Depreciacion: !!(detalleClase && detalleClase.Depreciacion),
      Amortizacion: !!(detalleClase && detalleClase.Amortizacion),
    };
  }

  private normalizeTipoMovimiento(movimiento: Partial<FormatoTipoMovimiento>): FormatoTipoMovimiento {
    return {
      Id: movimiento && movimiento.Id ? movimiento.Id : 0,
      Nombre: movimiento && movimiento.Nombre ? movimiento.Nombre : '',
      Formato: movimiento && movimiento.Formato ? movimiento.Formato : '',
      Descripcion: movimiento && movimiento.Descripcion ? movimiento.Descripcion : '',
      CodigoAbreviacion: movimiento && movimiento.CodigoAbreviacion ? movimiento.CodigoAbreviacion : '',
      NumeroOrden: movimiento && movimiento.NumeroOrden ? movimiento.NumeroOrden : 0,
      Activo: !!(movimiento && movimiento.Activo),
    };
  }

  private emptyTipoMovimiento(): FormatoTipoMovimiento {
    return this.normalizeTipoMovimiento({});
  }

  private obtenerMovimientoSalidaAsociado(movimiento: FormatoTipoMovimiento): FormatoTipoMovimiento {
    if (movimiento && movimiento.CodigoAbreviacion === 'SAL') {
      return movimiento;
    }

    return this.tiposDeEMovimentos.find(tipo => tipo.CodigoAbreviacion === 'SAL') || movimiento;
  }

  private obtenerMovimientoDepreciacion(): FormatoTipoMovimiento {
    return this.tiposDeEMovimentos.find(tipo => tipo.CodigoAbreviacion === 'CRR') || this.emptyTipoMovimiento();
  }

  private obtenerMovimientoSeleccionado(): FormatoTipoMovimiento {
    return this.tiposDeEMovimentos.find(tipo => tipo.Id === this.movimientoId);
  }

  private debeCrearCuentaAjusteValor(detalleClase: any, movimiento: FormatoTipoMovimiento): boolean {
    const movimientoDepreciacion = this.obtenerMovimientoDepreciacion();
    const codigoMovimiento = this.getCodigoAbreviacion(movimiento);

    return !!(detalleClase && (detalleClase.Depreciacion || detalleClase.Amortizacion)
      && movimientoDepreciacion && movimientoDepreciacion.Id
      && codigoMovimiento !== 'SAL'
      && codigoMovimiento !== 'CRR');
  }

  private isSameCuentaConfig(cuentaActual: any, cuentaEsperada: any): boolean {
    const tipoMovimientoActual = cuentaActual && cuentaActual.TipoMovimientoId ? cuentaActual.TipoMovimientoId.Id : 0;
    const tipoMovimientoEsperado = cuentaEsperada && cuentaEsperada.TipoMovimientoId ? cuentaEsperada.TipoMovimientoId.Id : 0;
    const subtipoMovimientoActual = cuentaActual && cuentaActual.SubtipoMovimientoId ? cuentaActual.SubtipoMovimientoId.Id : 0;
    const subtipoMovimientoEsperado = cuentaEsperada && cuentaEsperada.SubtipoMovimientoId ? cuentaEsperada.SubtipoMovimientoId.Id : 0;

    return tipoMovimientoActual === tipoMovimientoEsperado
      && subtipoMovimientoActual === subtipoMovimientoEsperado;
  }

  private hasConfiguredAccounts(cuenta: any): boolean {
    return !!(cuenta && cuenta.CuentaDebitoId && cuenta.CuentaCreditoId);
  }

  private resetCuentaState() {
    this.claseOk = false;
    this.infoCuentas = undefined;
    this.cuentasPendientes = [];
  }

  private validarPersistenciaCuentas(cuentasEnviadas: any[]) {
    this.spinner = 'Validando cuentas contables guardadas';
    const movimientoSeleccionado = this.obtenerMovimientoSeleccionado();

    forkJoin({
      cuentas: this.catalogoElementosService.getCuentasContables(this.subgrupo.Id, this.movimientoId),
      detalle: this.catalogoElementosService.getDetalleSubgrupo(this.subgrupo.Id),
    }).subscribe(({ cuentas, detalle }) => {
      this.spinner = '';

      const detalleClase = Array.isArray(detalle) ? detalle.find(item => item && item.TipoBienId) : undefined;

      if (!detalleClase || !detalleClase.TipoBienId) {
        return;
      }

      this.infoCuentas = this.prepararCuentas(
        Array.isArray(cuentas) ? cuentas : [],
        detalleClase,
        movimientoSeleccionado,
      );
      this.actualizar = true;
      this.cuentasPendientes = [];
      this.claseOk = !!this.infoCuentas.length;

      if (this.verificarCuentasGuardadas(cuentasEnviadas, this.infoCuentas)) {
        this.pUpManager.showAlertWithOptions(this.optionsActualizado);
      }
    }, () => {
      this.spinner = '';
    });
  }

  private verificarCuentasGuardadas(cuentasEnviadas: any[], cuentasActuales: any[]): boolean {
    if (!Array.isArray(cuentasEnviadas) || !cuentasEnviadas.length) {
      return false;
    }

    return cuentasEnviadas.every(cuentaEnviada => {
      const cuentaActual = (cuentasActuales || []).find(cuenta =>
        this.isSameCuentaConfig(cuenta, cuentaEnviada) &&
        this.getCuentaId(cuenta.CuentaDebitoId) === this.getCuentaId(cuentaEnviada.CuentaDebitoId) &&
        this.getCuentaId(cuenta.CuentaCreditoId) === this.getCuentaId(cuentaEnviada.CuentaCreditoId) &&
        this.getTipoBienId(cuenta.TipoBienId) === this.getTipoBienId(cuentaEnviada.TipoBienId));

      return !!cuentaActual;
    });
  }

  private getCuentaId(cuenta: any): number {
    return cuenta && cuenta.Id ? cuenta.Id : cuenta ? +cuenta : 0;
  }

  private getTipoBienId(tipoBien: any): number {
    return tipoBien && tipoBien.Id ? tipoBien.Id : tipoBien ? +tipoBien : 0;
  }

  private getCodigoAbreviacion(movimiento: any): string {
    return movimiento && movimiento.CodigoAbreviacion ? movimiento.CodigoAbreviacion : '';
  }

  private cargarTiposDeMovimientos() {
    this.entradasHelper.getTiposMovimientos().subscribe({
      next: (res_) => {
        this.tiposDeEMovimentos = Array.isArray(res_)
          ? res_.filter(tipo => tipo.Activo)
          : [];
      },
      error: (err) => {
        this.tiposDeEMovimentos = [];
      },
    });
  }

  get optionsNoPArametrizado() {
    return {
      title: this.translate.instant('GLOBAL.catalogo.errorDetalleTtl'),
      text: this.translate.instant('GLOBAL.catalogo.errorDetalleTxt'),
      type: 'warning',
    };
  }

  get optionsConfirm() {
    return {
      title: this.translate.instant('GLOBAL.Actualizar'),
      text: this.translate.instant('GLOBAL.Actualizar_Movimientos_placeholder'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

  get optionsActualizado() {
    return {
      title: this.translate.instant('GLOBAL.Actualizado'),
      text: this.translate.instant('GLOBAL.Actualizado_Movimientos_placeholder'),
      type: 'success',
    };
  }

}
