import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { ActaRecibido, ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Tercero } from '../../../@core/data/models/terceros';
import { PopUpManager } from '../../../managers/popUpManager';
import { VerDetalleComponent } from '../../acta-recibido/ver-detalle/ver-detalle.component';
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
  selector: 'ngx-lista-movimientos',
  templateUrl: './lista-movimientos.component.html',
  styleUrls: ['./lista-movimientos.component.scss'],
})

export class ListaMovimientosComponent implements OnInit {

  mostrar: boolean = false;
  mostrarEntrada: boolean = false;

  // Datos Tabla
  ActasAsociadas: LocalDataSource;
  Entrada: LocalDataSource;
  ListaSalidas: LocalDataSource;
  ListaBajas: LocalDataSource;
  // Acta de recibido
  actaSeleccionada: string;
  settingsListaActas: any;
  settingsEntrada: any;
  settingsSalidas: any;
  settingsBajas: any;


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
    this.ActasAsociadas = new LocalDataSource();
    this.Entrada = new LocalDataSource();
    this.ListaSalidas = new LocalDataSource();
    this.ListaBajas = new LocalDataSource();
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
    this.settingsListaActas = {
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
    this.settingsEntrada = {
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
          width: '140px',
        },
        ActaRecibidoId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.una'),
          width: '130px',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
          width: '150px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
        },
        TipoEntradaId: {
          title: this.translate.instant('GLOBAL.tipo_entrada'),
          width: '230px',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Observacion: {
          title: this.translate.instant('GLOBAL.observaciones'),
        },
      },
    };
    this.settingsBajas = {
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

    this.settingsSalidas = {
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
          width: '70px',
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
            if (value !== null) {
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
      },
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
    this.entradasHelper.getEntradaByActa(this.actaSeleccionada).subscribe(res => {
      if (res !== null) {
        const entradas = new Array<Entrada>();
        const entrada = new Entrada;
        const detalle = JSON.parse((res[0].Detalle));
        entrada.Id = res[0].Id;
        entrada.FechaCreacion = res[0].FechaCreacion;
        entrada.TipoEntradaId = res[0].FormatoTipoMovimientoId.Nombre;
        entrada.Observacion = res[0].Observacion;
        entrada.ActaRecibidoId = detalle.acta_recibido_id;
        entrada.Consecutivo = detalle.consecutivo;
        entradas.push(entrada);
        this.Entrada.load(entradas);
        this.mostrarEntrada = true;
      }
    });
  }

  private loadSalidas(id) {

    this.salidasHelper.getSalida(id).subscribe(res1 => {
      if (Object.keys(res1).length !== 0) {
        const salida = res1.Salida;
        salida.Id = res1.Salida.Id;
        this.salidas.push(salida);
      }
      this.ListaSalidas.load(this.salidas);
    });
  }

  private loadBajas() {
    this.bajasHelper.getSolicitudes().subscribe((res: any) => {
      if (res !== '200' && Object.keys(res[0]).length !== 0) {
        this.ListaBajas.load(res);
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
      this.ActasAsociadas.load(this.actas.map(acta => {
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
