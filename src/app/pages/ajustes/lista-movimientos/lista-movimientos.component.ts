import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { ActaRecibido, ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Tercero } from '../../../@core/data/models/terceros';
import { PopUpManager } from '../../../managers/popUpManager';
import { VerDetalleComponent } from '../../acta-recibido/ver-detalle/ver-detalle.component'
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { BajasHelper } from '../../../helpers/bajas/bajasHelper';
import Swal from 'sweetalert2';

@Component({
  selector: 'lista-movimientos',
  templateUrl: './lista-movimientos.component.html',
  styleUrls: ['./lista-movimientos.component.scss']
})

export class ListaMovimientosComponent implements OnInit {

  mostrar: boolean = false;
  mostrarEntrada: boolean = false;

  // Datos Tabla
  source: LocalDataSource;
  source2: LocalDataSource;
  source3: LocalDataSource;
  source4: LocalDataSource;
  tiposDeEntradas: string[];
  // Acta de recibido
  actaSeleccionada: string;
  settings: any;
  settings2: any;
  settings3: any;
  settings4: any;
  opcionEntrada: string;
  movimientoId: number;

  @Input() EntradaEdit: any;

  private terceros: Partial<Tercero>[];
  private actas: any[];
  entradas: any;
  salidas: any;

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager,
    private entradasHelper: EntradaHelper,
    private salidasHelper: SalidaHelper,
    private bajasHelper: BajasHelper,
    private translate: TranslateService,
    private listService: ListService,
    private store: Store<IAppState>,
    private tercerosHelper: TercerosHelper,

  ) {
    this.source = new LocalDataSource();
    this.source2 = new LocalDataSource();
    this.source3 = new LocalDataSource();
    this.source4 = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.salidas = new Array<any>();
    this.actaSeleccionada = '';
  }

  ngOnInit() {
    this.loadTablasSettings();
    this.loadActas();
    this.listService.findClases();
    this.listService.findImpuestoIVA();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablasSettings();
    });
    this.loadTerceros();
  }

  loadTablasSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_actas_entrada'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'detalle',
            title: '<i class="fa fa-location-arrow" title="Ver movimientos asociados"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        FechaVistoBueno: {
          title: this.translate.instant('GLOBAL.fecha_visto_bueno'),
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        RevisorId: {
          title: this.translate.instant('GLOBAL.revisor'),
        },
        UbicacionId: {
          title: this.translate.instant('GLOBAL.ubicacion'),
          valuePrepareFunction: (value: any) => {
            return value.EspacioFisicoId.Nombre.toUpperCase();
          },
        },
        Observaciones: {
          width: '20px',
          title: this.translate.instant('GLOBAL.observaciones'),
          valuePrepareFunction: (value: any) => {
            return value.toUpperCase();
          },
        },
      },
    };
    this.settings2 = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: false,
        edit: false,
        add: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.detalle'),
            title: '<i class="fa fa-ban" title="Anular"></i>',
          },
        ],
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        ActaRecibidoId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.una'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        TipoEntradaId: {
          title: this.translate.instant('GLOBAL.tipo_entrada'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Observacion: {
          title: this.translate.instant('GLOBAL.observaciones'),
        },
      },
    };
    this.settings3 = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'Seleccionar',
            title: '<i class="fa fa-ban" title="Anular"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: 'Consecutivo',
        },
        Observacion: {
          title: 'Observaciones',
        },
        FechaCreacion: {
          title: 'Fecha de Creacion',
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        MovimientoPadreId: {
          title: 'Entrada Asociada',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Id;
            } else {
              return '';
            }
          },
        },
        Funcionario: {
          title: 'Funcionario',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.NombreCompleto;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.NombreCompleto.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Sede: {
          title: 'Sede',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Dependencia: {
          title: 'Dependencia',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Ubicacion: {
          title: 'Ubicacion',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
      },
    };

    this.settings4 = {
      hideSubHeader: false,
      noDataMessage: 'Hay bajas asociadas a esta acta',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.detalle'),
            title: '<i class="fa fa-ban" title="Anular"></i>',
          },
        ],
      },

      mode: 'external',
      columns: {
        Id: {
          title: 'Consecutivo',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        FechaCreacion: {
          title: 'Fecha de registro',
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        FechaModificacion: {
          title: 'Fecha de Visto Bueno',
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        FechaVistoBueno: {
          title: 'Fecha de Visto Bueno',
          width: '70px',
          valuePrepareFunction: (value: any) => {
            if (value !== null ) {
              const date = value.split('T');
              return date[0];
            } else {
              return 'Por Aprobar';
            }
  
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        Revisor: {
          title: 'Revisor',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Funcionario: {
          title: 'Solicitante',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Estado: {
          title: 'Estado',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
      }
    };
  }

  loadActas(): void {
    this.actaRecibidoHelper.getActasRecibidoPorEstados(6).subscribe(res => {
      if (Array.isArray(res) && res.length !== 0) {
        const data = <Array<ActaRecibidoUbicacion>>res;
        this.actas = data;
        this.mostrarData();
      }
    });
  }

  loadEntradaEspecifica(): void {
    this.entradasHelper.getEntrada(200).subscribe(res => {
      if (res !== null) {
        if (res.Movimiento) {
          const entrada = new Entrada;
          const detalle = JSON.parse((res.Movimiento.Detalle));
          entrada.Id = res.Movimiento.Id;
          entrada.ActaRecibidoId = detalle.acta_recibido_id;
          entrada.FechaCreacion = res.Movimiento.FechaCreacion;
          entrada.Consecutivo = detalle.consecutivo;
          entrada.TipoEntradaId = res.TipoMovimiento.TipoMovimientoId.Nombre;
          entrada.Observacion = res.Movimiento.Observacion;
          this.entradas.push(entrada);
        }
        this.source2.load(this.entradas);
        this.mostrarEntrada = true;
      }
    });
  }

  private loadSalidas(id) {

    this.salidasHelper.getSalida(id).subscribe(res1 => {
      if (Object.keys(res1).length !== 0) {
        console.log(res1)
        const salida = res1.Salida;
        salida.Id = res1.Salida.Id;
        this.salidas.push(salida);
      }
      console.log(this.salidas)
      this.source3.load(this.salidas);

    });
  }
  
  private loadBajas() {
    this.bajasHelper.getSolicitudes().subscribe((res: any) => {
      if (res !== '200' && Object.keys(res[0]).length !== 0) {
        this.source4.load(res);
      }
    });
  }

  private loadTerceros(): void {
    this.tercerosHelper.getTerceros().subscribe(terceros => {
      this.terceros = terceros;
      this.mostrarData();
    });
  }

  private mostrarData(): void {
    if (!this.mostrar
      && this.actas && this.actas.length
      && this.terceros && this.terceros.length) {
      this.source.load(this.actas.map(acta => {
        const buscar = (tercero: Tercero) => tercero.Id === acta.RevisorId;
        let nombre = '';
        if (this.terceros.some(buscar)) {
          nombre = this.terceros.find(buscar).NombreCompleto;
        }
        acta.RevisorId = nombre;
        return acta;
      }));
      this.mostrar = true;
    }
  }

  CargarMovimientosAsociados(event) {
    this.actaSeleccionada = `${event.data.Id}`;
    this.loadEntradaEspecifica();
    this.loadSalidas(354);
    this.loadBajas();
  }

  AnularEntrada(event) {
    (Swal as any).fire({
      title: 'Anular Entrada',
      text: '¿Está seguro de anular esta entrada?, tenga en cuenta de que se anularán los movimientos asociados',
      type: 'warning',
    });
  }

  AnularSalidas(event) {
    (Swal as any).fire({
      title: 'Anular salida',
      text: '¿Está seguro de anular esta salida?, tenga en cuenta de que se anularán los movimientos asociados',
      type: 'warning',
    });
  }

  AnularBajas(event) {
    (Swal as any).fire({
      title: 'Anular Baja',
      text: '¿Está seguro de anular esta baja?',
      type: 'warning',
    });
  }

}
