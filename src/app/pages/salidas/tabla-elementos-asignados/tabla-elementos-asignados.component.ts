import { Component, OnInit, ViewChild, Input, HostListener } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ElementoActa } from '../../../@core/data/models/acta_recibido/elemento';
import { PopUpManager } from '../../../managers/popUpManager';
import { Router } from '@angular/router';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { isArray } from 'util';
import { MatCheckbox } from '@angular/material';
import { ElementoMovimientosArka } from '../../../@core/data/models/entrada/entrada';

@Component({
  selector: 'ngx-tabla-elementos-asignados',
  templateUrl: './tabla-elementos-asignados.component.html',
  styleUrls: ['./tabla-elementos-asignados.component.scss'],
})
export class TablaElementosAsignadosComponent implements OnInit {

  actaRecibidoId: number;
  formulario: boolean;
  Observaciones: string;
  ObservacionesConsumo: string;
  entradaId: string;
  selected = new FormControl(0);
  estadoShift: boolean;
  JefeOficinaId: number;
  mostrar: boolean;
  mode: string = 'determinate';
  checkTodos: boolean = false;
  checkParcial: boolean = false;
  displayedColumns: string[];
  private checkAnterior: number = undefined;
  counter = 0;
  basePaginasD: number = 0;
  basePaginasC: number = 0;

  @ViewChild('paginatorD') paginatorD: MatPaginator;
  @ViewChild('paginatorC') paginatorC: MatPaginator;
  @ViewChild(MatSort) sortD: MatSort;
  @ViewChild(MatSort) sortC: MatSort;
  @Input('actaRecibidoId')
  set name(acta_id: number) {
    this.actaRecibidoId = acta_id;
  }
  @Input('entradaId')
  set name2(entrada_id: string) {
    this.entradaId = entrada_id;
  }
  sourceDevolutivo: MatTableDataSource<any>;
  sourceConsumo: MatTableDataSource<any>;
  devolutivoSeleccionados: boolean;
  consumoSeleccionados: boolean;
  @ViewChild('checkTodoInput') checkDummy: MatCheckbox;

  constructor(private translate: TranslateService,
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private salidasHelper: SalidaHelper,
    private pUpManager: PopUpManager) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.loadElementos();
    this.getJefeAlmacen();
    this.setColumnas();
  }

  private loadElementos() {
    this.actaRecibidoHelper.getElementosActa(this.actaRecibidoId).toPromise().then(res => {
      if (res && res.length > 0) {
        res.forEach(el => {
          el.Funcionario = '',
            el.Sede = '',
            el.Dependencia = '',
            el.Ubicacion = '',
            el.Combinado = el.SubgrupoCatalogoId.SubgrupoId.Id ?
              el.SubgrupoCatalogoId.SubgrupoId.Codigo + ' - ' + el.SubgrupoCatalogoId.SubgrupoId.Nombre : '';
        });
        const elementosConsumo = res.filter(el => el.SubgrupoCatalogoId.TipoBienId.Id === 1);
        const elementosDevolutivo = res.filter(el => el.SubgrupoCatalogoId.TipoBienId.Id !== 1);
        this.sourceDevolutivo = new MatTableDataSource<ElementoActa>(elementosDevolutivo);
        this.sourceConsumo = new MatTableDataSource<ElementoActa>(elementosConsumo);
        this.sourceDevolutivo.paginator = this.paginatorD;
        this.sourceDevolutivo.sort = this.sortD;
        this.sourceConsumo.paginator = this.paginatorC;
        this.sourceConsumo.sort = this.sortC;
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.salidas.errorElementos'));
      }
    });
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
    if (source && isArray(source.data) && source.data.length) {
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
    ];
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
    source.data[index].seleccionado = false;
  }

  asignarPlacas(datos: any, elemento: any) {
    this.salidasHelper.getElemento(datos).subscribe((res: any) => {
      if (res.Placa === '') {
        this.salidasHelper.putElemento(res).subscribe((res1: any) => {
          return res1.placa;
        });
      }
    });
    return '';
  }

  checkElementosAsignados() {
    const alertControlado = !this.sourceDevolutivo.data.length ? false :
      this.sourceDevolutivo.data.every(el => el.Funcionario.Id && el.Ubicacion.Id) ? false : true;

    const alertConsumo = !this.sourceConsumo.data.length ? false :
      this.sourceConsumo.data.every(el => el.Funcionario.Id && el.Ubicacion.Id) ? false : true;

    const alert = (alertControlado && alertConsumo) ? 'GLOBAL.movimientos.alerta_ambos' :
      (alertConsumo ? 'GLOBAL.movimientos.alerta_consumo' : (alertControlado ? 'GLOBAL.movimientos.alerta_controlado' : null));

    alert ? (Swal as any).fire({
      title: this.translate.instant('GLOBAL.movimientos.alerta_descargue'),
      text: this.translate.instant(alert),
      type: 'warning',
    }) : this.onSubmit();

  }

  private crearElemento(elementoActa) {
    const elemento = new ElementoMovimientosArka;
    elemento.Activo = true;
    elemento.ElementoActaId = elementoActa.Id;
    elemento.SaldoCantidad = elementoActa.Cantidad;
    elemento.SaldoValor = elementoActa.ValorTotal;
    elemento.Unidad = elementoActa.Cantidad;
    elemento.ValorUnitario = elementoActa.ValorUnitario;
    elemento.ValorTotal = elementoActa.ValorTotal;
    return elemento;
  }

  private salidaBodega() {
    const elementosBodega = this.sourceConsumo.data.filter(el =>
      el.Ubicacion.Nombre === 'SECCION ALMACEN GENERAL E INVENTARIOS' &&
      el.Funcionario.Id === this.JefeOficinaId,
    );

    if (elementosBodega.length > 0) {
      const detalle = {
        ubicacion: elementosBodega[0].Ubicacion.Id,
        funcionario: this.JefeOficinaId,
      };

      const Salida = {
        Salida: {
          Observacion: 'Salida Automatica para Bodega de Consumo',
          Detalle: JSON.stringify(detalle),
          Activo: true,
          MovimientoPadreId: {
            Id: parseFloat(this.entradaId),
          },
          FormatoTipoMovimientoId: {
            Id: 9,
          },
          EstadoMovimientoId: {
            Id: 3,
          },
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
      const datos_agrupados2 = this.sourceDevolutivo.data.reduce((accumulator, currentValue) => {
        const detalle = {
          funcionario: currentValue.Funcionario.Id,
          ubicacion: currentValue.Ubicacion.Id,
        };
        const val = currentValue.Funcionario.Id + '-' + currentValue.Ubicacion.Id;
        const obs = 'Salida con elementos Devolutivos o de Consumo Controlado asignados a funcionario.';
        accumulator[val] = accumulator[val] || {
          Salida: {
            Observacion: this.Observaciones ? obs + ' // ' + this.Observaciones : obs,
            Detalle: JSON.stringify(detalle),
            Activo: true,
            MovimientoPadreId: {
              Id: parseFloat(this.entradaId),
            },
            FormatoTipoMovimientoId: {
              Id: 7,
            },
            EstadoMovimientoId: {
              Id: 3,
            },
          },
          Elementos: [],
        };
        const elemento = this.crearElemento(currentValue);
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

    if (elementosAsignados.length > 0) {
      const datos_agrupados2 = elementosAsignados.reduce((accumulator, currentValue) => {
        if (currentValue.Funcionario.Id) {
          const detalle = {
            funcionario: currentValue.Funcionario.Id,
            ubicacion: currentValue.Ubicacion.Id,
          };
          const val = currentValue.Funcionario.Id + '-' + currentValue.Ubicacion.Id;
          const obs = 'Salida con elementos de consumo asignados a funcionario.';
          accumulator[val] = accumulator[val] || {
            Salida: {
              Observacion: this.ObservacionesConsumo ? obs + ' // ' + this.ObservacionesConsumo : obs,
              Detalle: JSON.stringify(detalle),
              Activo: true,
              MovimientoPadreId: {
                Id: parseFloat(this.entradaId),
              },
              FormatoTipoMovimientoId: {
                Id: 7,
              },
              EstadoMovimientoId: {
                Id: 3,
              },
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

    // console.log(Salidas);
    (Swal as any).fire({
      title: 'Desea Registrar Salida?',
      text: 'Está seguro de registrar los datos suministrados',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        this.salidasHelper.registrarSalidas(Salidas).subscribe(res => {
          // console.log(res);
          if (res) {
            (Swal as any).fire({
              type: 'success',
              title: this.translate.instant('GLOBAL.movimientos.salidas.registroTtlOk'),
              text: this.translate.instant('GLOBAL.movimientos.salidas.registroTxtOk'),
            });
            this.router.navigate(['/pages/salidas/consulta_salidas']);
          }
        });
      }
    });
  }

}
