import { Component, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ElementoActa } from '../../../@core/data/models/acta_recibido/elemento';
import { PopUpManager } from '../../../managers/popUpManager';
import { Router } from '@angular/router';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { MatCheckbox } from '@angular/material';
import { ElementoMovimientosArka, EstadoMovimiento, FormatoTipoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
export const CONSUMO = 'Consumo';

@Component({
  selector: 'ngx-tabla-elementos-asignados',
  templateUrl: './tabla-elementos-asignados.component.html',
  styleUrls: ['./tabla-elementos-asignados.component.scss'],
})

export class TablaElementosAsignadosComponent implements OnInit {

  mode: string = 'determinate';
  baseI18n: string = 'GLOBAL.movimientos.';
  actaRecibidoId: number;
  entradaId: string;
  selected = new FormControl(0);
  estadoShift: boolean;
  JefeOficinaId: number;
  mostrar: boolean;
  checkTodos: boolean = false;
  checkParcial: boolean = false;
  displayedColumns: string[];
  displayedColumnsDev: string[];
  private checkAnterior: number = undefined;
  basePaginasD: number = 0;
  basePaginasC: number = 0;

  @ViewChild('paginatorD') paginatorD: MatPaginator;
  @ViewChild('paginatorC') paginatorC: MatPaginator;
  @ViewChild(MatSort) sortD: MatSort;
  @ViewChild(MatSort) sortC: MatSort;
  formatoMovimientoBodega: FormatoTipoMovimiento;
  formatoMovimientoFuncionario: FormatoTipoMovimiento;
  @Input('actaRecibidoId')
  set name(acta_id: number) {
    this.actaRecibidoId = acta_id;
  }
  @Input('entradaId')
  set name2(entrada_id: string) {
    this.entradaId = entrada_id;
  }
  @Input('salida_id') salida_id: number = 0;
  @Input('edicionSalida') edicionSalida: boolean = false;
  sourceDevolutivo: MatTableDataSource<any>;
  sourceConsumo: MatTableDataSource<any>;
  devolutivoSeleccionados: boolean;
  consumoSeleccionados: boolean;
  salida: any;
  @ViewChild('checkTodoInput') checkDummy: MatCheckbox;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.shiftKey) {
      this.estadoShift = true;
    }
  }
  @HostListener('window:keyup', ['$event'])
  handleKeyUp() {
    this.estadoShift = false;
  }

  constructor(
    private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private salidasHelper: SalidaHelper,
    private pUpManager: PopUpManager,
    private entradasHelper: EntradaHelper) {
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    if (!this.edicionSalida && this.actaRecibidoId) {
      this.loadElementos();
    } else if (this.edicionSalida && this.salida_id) {
      this.loadSalida();
    }

    this.getJefeAlmacen();
    this.setColumnas();
    this.getFormatoBodega();
    this.getFormatoFuncionario();

  }

  private loadSalida() {
    this.salidasHelper.getSalida(this.salida_id).subscribe(res => {
      if (res && res.Elementos && res.Elementos.length && res.Salida) {
        this.salida = res.Salida;
        this.loadTablas(res.Elementos, res.Salida.Sede, res.Salida.Dependencia, res.Salida.Ubicacion, res.Salida.Funcionario);
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant(this.baseI18n + 'salidas.errorElementos'));
      }
    });
  }

  private loadElementos() {
    this.actaRecibidoHelper.getElementosActa(this.actaRecibidoId).toPromise().then(res => {
      if (res && res.length > 0) {
        this.loadTablas(res, '', '', '', '');
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant(this.baseI18n + 'salidas.errorElementos'));
      }
    });
  }

  private loadTablas(elementos: any[], sede: any, dependencia: any, ubicacion: any, funcionario: any) {

    elementos.forEach(el => {
      if (!this.salida_id) {
        el.ElementoActaId = el.Id;
      }
      el.Funcionario = funcionario;
      el.Sede = sede;
      el.Dependencia = dependencia;
      el.Ubicacion = ubicacion;
      el.ValorResidual = !el.SubgrupoCatalogoId.Depreciacion && !el.SubgrupoCatalogoId.Amortizacion ? 0 :
        this.salida_id ? el.ValorResidual : el.SubgrupoCatalogoId.ValorResidual * 100;
      el.VidaUtil = !el.SubgrupoCatalogoId.Depreciacion && !el.SubgrupoCatalogoId.Amortizacion ? 0 :
        this.salida_id ? el.VidaUtil : el.SubgrupoCatalogoId.VidaUtil;
    });

    const elementosConsumo = elementos.filter(el => el.SubgrupoCatalogoId.TipoBienId.Nombre === CONSUMO);
    const elementosDevolutivo = elementos.filter(el => el.SubgrupoCatalogoId.TipoBienId.Nombre !== CONSUMO);
    this.sourceDevolutivo = new MatTableDataSource<ElementoActa>(elementosDevolutivo);
    this.sourceConsumo = new MatTableDataSource<ElementoActa>(elementosConsumo);
    this.sourceDevolutivo.paginator = this.paginatorD;
    this.sourceDevolutivo.sort = this.sortD;
    this.sourceConsumo.paginator = this.paginatorC;
    this.sourceConsumo.sort = this.sortC;
    this.mostrar = true;

  }

  private getJefeAlmacen() {
    this.salidasHelper.getJefeOficina().subscribe((res: any) => {
      if (res) {
        this.JefeOficinaId = res[0].TerceroPrincipalId.Id;
      }
    });
  }

  cambioCheckTodos(source, marcar: boolean) {
    source.data.forEach(elem => {
      elem.seleccionado = marcar;
    });
    this.checkAnterior = undefined;
    this.refrescaCheckTotal(source);
  }

  tabChange() {
    this.checkAnterior = undefined;
  }

  setCasilla(base, source, fila: number, checked: boolean) {
    fila += base;
    // console.log({fila, checked, 'shift': this.estadoShift, 'anterior': this.checkAnterior});
    if (this.estadoShift && this.checkAnterior !== undefined) { // Shift presionado
      const menor = Math.min(this.checkAnterior, fila);
      const mayor = Math.max(this.checkAnterior, fila);
      source.data
        .map((elem, idx) => elem.seleccionado = (idx >= menor && idx <= mayor));
    } else { // Shift suelto
      if (checked) {
        this.checkAnterior = fila;
      } else {
        if (fila === this.checkAnterior)
          this.checkAnterior = undefined;
      }
    }
    this.refrescaCheckTotal(source);
  }

  refrescaCheckTotal(source) {
    let checkTodos = false;
    let checkParcial = false;
    if (source && source.data && source.data.length) {
      if (source.data.every(elem => elem.seleccionado)) {
        // console.log('todos');
        checkTodos = true;
      } else if (source.data.some(elem => elem.seleccionado)) {
        // console.log('algunos');
        checkParcial = true;
      } // "else" ninguno
    }
    this.checkTodos = checkTodos;
    this.checkParcial = checkParcial;
    this.devolutivoSeleccionados = this.sourceDevolutivo.data.some(elem => elem.seleccionado);
    this.consumoSeleccionados = this.sourceConsumo.data.some(elem => elem.seleccionado);
  }

  setColumnas() {
    this.displayedColumns = [
      'AccionesMacro',
      'Nombre',
      'Cantidad',
      'SubgrupoCatalogoId',
      'TipoBienId',
      'Placa',
      'Marca',
      'Serie',
      'Funcionario',
      'Sede',
      'Dependencia',
      'Ubicacion',
      'ValorTotal',
    ];
    this.displayedColumnsDev = this.displayedColumns.concat(
      'VidaUtil',
      'ValorResidual',
    );
  }

  cambioPagina(base, eventoPagina) {
    if (base === 1) {
      this.basePaginasD = eventoPagina.pageIndex * eventoPagina.pageSize;
    } else {
      this.basePaginasC = eventoPagina.pageIndex * eventoPagina.pageSize;
    }
    this.checkDummy.focus();
  }

  AjustarDatos2(source, datos: any[]) {
    const seleccionados = this.getSeleccionados(source);
    seleccionados.forEach((index) => { this.setAsignacion(source, datos, index); });
    this.refrescaCheckTotal(source);
  }

  private getSeleccionados(source) {
    return source.data.map((elem, idx) => ({ 'idx_data': idx, elem }))
      .filter(elem => elem.elem.seleccionado)
      .map(elem => elem.idx_data);
  }

  private setAsignacion(source, item, index) {
    source.data[index].Funcionario = item.Funcionario;
    source.data[index].Sede = item.Sede;
    source.data[index].Dependencia = item.Dependencia;
    source.data[index].Ubicacion = item.Ubicacion;
    source.data[index].Observaciones = item.Observaciones;
    source.data[index].seleccionado = false;
  }

  public checkElementosAsignados() {
    const alertControlado = this.sourceDevolutivo.data.length &&
      this.sourceDevolutivo.data.some(el => !el.Funcionario.Id || !el.Ubicacion.Id);
    const alertConsumo = this.sourceConsumo.data.length &&
      this.sourceConsumo.data.some(el => !el.Funcionario.Id || !el.Ubicacion.Id);
    const elementos = this.sourceConsumo.data.concat(this.sourceDevolutivo.data);
    const alertResidual = elementos.some(el => (el.ValorResidual > 100 || el.ValorResidual < 0));
    const alertVidaUtil = elementos.some(el => (el.VidaUtil > 100 || el.VidaUtil < 0));
    const alert = (alertControlado && alertConsumo) ? this.baseI18n + 'alerta_ambos' :
      (alertConsumo) ? this.baseI18n + 'alerta_consumo' :
        (alertControlado) ? this.baseI18n + 'alerta_controlado' :
          (alertResidual) ? this.baseI18n + 'alertaResidual' :
            (alertVidaUtil) ? this.baseI18n + 'alertaVida' : '';

    if (alert) {
      this.pUpManager.showAlertWithOptions(this.getOptionsErrorDescargue(alert));
    } else {
      this.onSubmit();
    }

  }

  private crearElemento(elementoActa): ElementoMovimientosArka {
    return <ElementoMovimientosArka>{
      Id: !this.salida_id ? 0 : elementoActa.Id,
      ElementoActaId: elementoActa.ElementoActaId,
      Activo: true,
      SaldoCantidad: elementoActa.Cantidad,
      SaldoValor: elementoActa.ValorTotal,
      Unidad: elementoActa.Cantidad,
      ValorUnitario: elementoActa.ValorTotal / elementoActa.Cantidad,
      VidaUtil: elementoActa.VidaUtil,
      ValorTotal: elementoActa.ValorTotal,
      ValorResidual: this.getValorResidual(elementoActa.ValorTotal, elementoActa.ValorResidual),
    };

  }

  private getValorResidual(valorTotal: number, valorResidual: number): number {
    const decimalesT = valorTotal.toString().split('.').length > 1 ? valorTotal.toString().split('.')[1].length : 0;
    const decimalesR = valorResidual.toString().split('.').length > 1 ? valorResidual.toString().split('.')[1].length : 0;
    const valorTotal_ = valorTotal * Math.pow(10, decimalesT + 1);
    const valorResidual_ = valorResidual * Math.pow(10, decimalesR + 1);
    return valorTotal_ * valorResidual_ / Math.pow(10, decimalesT + decimalesR + 4);
  }

  private createDetalle(funcionario: number, ubicacion: number): string {
    if (this.salida_id) {
      const detalle = {
        funcionario,
        ubicacion,
        consecutivo: this.salida.Consecutivo,
        ConsecutivoId: this.salida.ConsecutivoId,
      };

      return JSON.stringify(detalle);

    } else {
      const detalle = {
        funcionario,
        ubicacion,
      };

      return JSON.stringify(detalle);

    }

  }

  private getFormatoBodega() {
    this.entradasHelper.getFormatoEntradaByName('Salida de Consumo').subscribe(res => {
      if (res !== null) {
        this.formatoMovimientoBodega = res[0];
      }
    });
  }

  private getFormatoFuncionario() {
    this.entradasHelper.getFormatoEntradaByName('Salida').subscribe(res => {
      if (res !== null) {
        this.formatoMovimientoFuncionario = res[0];
      }
    });
  }

  private salidaBodega() {

    const elementosBodega = this.sourceConsumo.data.filter((el) =>
      el.Ubicacion.Nombre === 'SECCION ALMACEN GENERAL E INVENTARIOS' &&
      el.Funcionario.Id === this.JefeOficinaId,
    );

    if (elementosBodega.length) {
      const Salida = {
        Salida: {
          Id: this.salida_id ? +this.salida_id : 0,
          Observacion: 'Salida automatica para Bodega de Consumo',
          Detalle: this.createDetalle(this.JefeOficinaId, elementosBodega[0].Ubicacion.Id),
          Activo: true,
          MovimientoPadreId: {
            Id: +this.entradaId,
          },
          FormatoTipoMovimientoId: {
            Id: this.formatoMovimientoBodega.Id,
          },
          EstadoMovimientoId: new EstadoMovimiento,
        },
        Elementos: [],
      };

      for (const currentValue of elementosBodega) {
        const elemento = this.crearElemento(currentValue);
        Salida.Elementos.push(elemento);
      }
      return Salida;
    } else {
      return null;
    }
  }

  private salidaFuncionarioDevolutivo() {
    if (this.sourceDevolutivo.data.length > 0) {
      const obs = 'Salida con elementos Devolutivos o de Consumo Controlado asignados a funcionario.';
      const datos_agrupados2 = this.sourceDevolutivo.data.reduce((accumulator, currentValue) => {
        const val = currentValue.Funcionario.Id + '-' + currentValue.Ubicacion.Id;
        accumulator[val] = accumulator[val] || {
          Salida: {
            Id: this.salida_id ? +this.salida_id : 0,
            Observacion: this.getObservacion(obs, currentValue.Observaciones),
            Detalle: this.createDetalle(currentValue.Funcionario.Id, currentValue.Ubicacion.Id),
            Activo: true,
            MovimientoPadreId: {
              Id: +this.entradaId,
            },
            FormatoTipoMovimientoId: {
              Id: this.formatoMovimientoFuncionario.Id,
            },
            EstadoMovimientoId: new EstadoMovimiento,
          },
          Elementos: [],
        };
        const elemento = this.crearElemento(currentValue); // incluir el id del elemento
        accumulator[val].Elementos.push(elemento);
        return accumulator;
      }, {});

      return datos_agrupados2;
    } else {
      return null;
    }
  }

  private salidaConsumoFuncionario() {

    const elementosAsignados = this.sourceConsumo.data.filter(el =>
      el.Ubicacion.Nombre !== 'SECCION ALMACEN GENERAL E INVENTARIOS' ||
      el.Funcionario.Id !== this.JefeOficinaId,
    );
    const obs = 'Salida con elementos de consumo asignados a funcionario.';

    if (elementosAsignados.length > 0) {
      const datos_agrupados2 = elementosAsignados.reduce((accumulator, currentValue) => {
        if (currentValue.Funcionario.Id) {
          const val = currentValue.Funcionario.Id + '-' + currentValue.Ubicacion.Id;
          accumulator[val] = accumulator[val] || {
            Salida: {
              Id: this.salida_id ? +this.salida_id : 0,
              Observacion: this.getObservacion(obs, currentValue.Observaciones),
              Detalle: this.createDetalle(currentValue.Funcionario.Id, currentValue.Ubicacion.Id),
              Activo: true,
              MovimientoPadreId: {
                Id: +this.entradaId,
              },
              FormatoTipoMovimientoId: {
                Id: this.formatoMovimientoFuncionario.Id,
              },
              EstadoMovimientoId: new EstadoMovimiento,
            },
            Elementos: [],
          };
          const elemento = this.crearElemento(currentValue);
          accumulator[val].Elementos.push(elemento);
          return accumulator;
        }
      }, {});

      return datos_agrupados2;
    } else {
      return null;
    }
  }

  onSubmit() {
    const salidaBodega = this.salidaBodega();
    const salidaFuncionariosC = this.salidaConsumoFuncionario();
    const salidaFuncionariosD = this.salidaFuncionarioDevolutivo();

    const Salidas = {
      Salidas: [],
    };

    if (salidaBodega) {
      Salidas.Salidas.push(salidaBodega);
    }
    if (salidaFuncionariosC) {
      for (const salida of Object.keys(salidaFuncionariosC)) {
        Salidas.Salidas.push(salidaFuncionariosC[salida]);
      }
    }
    if (salidaFuncionariosD) {
      for (const salida of Object.keys(salidaFuncionariosD)) {
        Salidas.Salidas.push(salidaFuncionariosD[salida]);
      }
    }

    if (Salidas.Salidas.length) {
      this.pUpManager.showAlertWithOptions(this.optionsConfirm).then((result) => {
        if (result.value) {
          if (this.edicionSalida) {
            this.salidasHelper.editarSalida(Salidas, this.salida_id).subscribe((res: any) => {
              this.getOptionsSuccess(res.trSalida.Salidas);
            });
          } else {
            this.salidasHelper.registrarSalida(Salidas).subscribe((res: any) => {
              this.getOptionsSuccess(res.trSalida.Salidas);
            });
          }
        }
      });
    }

  }

  private getOptionsSuccess(salidas: any[]) {
    if (salidas && salidas.length) {
      const length = salidas.length;
      const s = length > 1 ? 's' : '';
      const consecutivo0 = JSON.parse(salidas[0].Salida.Detalle).consecutivo;
      const consecutivoF = JSON.parse(salidas[length - 1].Salida.Detalle).consecutivo;
      const title = this.translate.instant(this.baseI18n + 'salidas.registroTtlOk', { S: s });
      const text = this.translate.instant(this.baseI18n + 'salidas.registroTxtOk' +
        (length > 1 ? 'Varios' : ''), { N: length, CONSECUTIVO0: consecutivo0, CONSECUTIVOF: consecutivoF });

      const options = {
        type: 'success',
        title,
        text,
        showConfirmButton: true,
      };
      this.pUpManager.showAlertWithOptions(options);
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl('/pages/salidas/consulta_salidas');
      });
      // this.router.navigate(['/pages/salidas/consulta_salidas']);
    }
  }

  get optionsConfirm(): any {
    return {
      title: this.translate.instant(this.baseI18n + 'salidas.registroConfrmTtl'),
      text: this.translate.instant(this.baseI18n + 'salidas.registroConfrmTxt'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }


  private getOptionsErrorDescargue(alert: string): any {
    return {
      title: this.translate.instant(this.baseI18n + 'alerta_descargue'),
      text: this.translate.instant(alert),
      type: 'warning',
    };
  }

  private getObservacion(min: string, custom: string) {
    return custom ? (min + ' // ' + custom) : min;
  }

}
