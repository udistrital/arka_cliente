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
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-lista-movimientos',
  templateUrl: './lista-movimientos.component.html',
  styleUrls: ['./lista-movimientos.component.scss'],
})

export class ListaMovimientosComponent implements OnInit {

  mostrar: boolean = false;
  mostrarMovimientos: boolean = false;
  mostrarActa: boolean = false;
  anulando: boolean = false;
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

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private router: Router,
    private pUpManager: PopUpManager,
    private entradasHelper: EntradaHelper,
    private salidasHelper: SalidaHelper,
    private bajasHelper: BajasHelper,
    private translate: TranslateService,
    private tercerosHelper: TercerosHelper,

  ) {
    this.ActasAsociadas = new LocalDataSource();
    this.Entrada = new LocalDataSource();
    this.ListaSalidas = new LocalDataSource();
    this.ListaBajas = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.actaSeleccionada = '';
  }

  ngOnInit() {
    this.loadTablasSettings();
    this.loadActas();
    this.loadTerceros();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
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
          width: '70px',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '110px',
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
          width: '110px',
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
          filter: false,
        },
        ActaRecibidoId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.una'),
          width: '130px',
          filter: false,
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
          width: '110px',
          filter: false,
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
        },
        TipoEntradaId: {
          title: this.translate.instant('GLOBAL.tipo_entrada'),
          width: '230px',
          filter: false,
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        EstadoMovimientoId: {
          title: this.translate.instant('GLOBAL.estado_entrada'),
          width: '160px',
          filter: false,
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Observacion: {
          title: this.translate.instant('GLOBAL.observaciones'),
          filter: false,
        },
      },
    };

    this.settingsSalidas = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_salidas'),
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
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '70px',
        },
        MovimientoPadreId: {
          title: 'Entrada Asociada',
          width: '140px',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return JSON.parse((value.Detalle)).consecutivo;
            } else {
              return '';
            }
          },
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '110px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
        },
        Funcionario: {
          title: this.translate.instant('GLOBAL.funcionario'),
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.NombreCompleto;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
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
          title: this.translate.instant('GLOBAL.sede'),
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
          title: this.translate.instant('GLOBAL.dependencia'),
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
        Ubicacion: {
          title: this.translate.instant('GLOBAL.ubicacion'),
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
        Observacion: {
          title: this.translate.instant('GLOBAL.observaciones'),
        },
      },
    };

    this.settingsBajas = {
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

  mostrarDetalleActa(event) {
    this.mostrarActa = event;
  }

  loadEntradaEspecifica(): void {
    this.entradasHelper.getEntradaByActa(this.actaSeleccionada).subscribe(res => {
      if (res !== null) {
        if (res.Entradas) {
          const data = <Array<any>>res.Entradas;
          for (const datos of Object.keys(data)) {
            const entrada = new Entrada;
            const detalle = JSON.parse((data[datos].Detalle));
            entrada.Id = data[datos].Id;
            entrada.Consecutivo = detalle.consecutivo;
            entrada.ActaRecibidoId = detalle.acta_recibido_id;
            entrada.FechaCreacion = data[datos].FechaCreacion;
            entrada.TipoEntradaId = data[datos].FormatoTipoMovimientoId.Nombre;
            entrada.EstadoMovimientoId = data[datos].EstadoMovimientoId.Nombre;
            entrada.Observacion = data[datos].Observacion;
            this.entradas.push(entrada);
          }
          this.Entrada.load(this.entradas);
        }

        if (res.Salidas) {
          this.ListaSalidas.load(res.Salidas);
        }

        // Falta la carga de la tabla de bajas una vez el flujo esté completo
        this.mostrarMovimientos = true;
      }
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
    this.loadBajas();
  }

  AnularEntrada(event) {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.DatosVeridicosTitle'),
      text: this.translate.instant('GLOBAL.ajustes.confirmar_anular_entrada'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value) {
        // this.anulando = true;
        // this.entradasHelper.anularMovimientosByEntrada(event.data.Id).subscribe((res: any) => {
          // console.log(res)
          // if (res !== null) {
            (Swal as any).fire({
              type: 'success',
              title: this.translate.instant('GLOBAL.ajustes.success_anular_entrada_title'),
              text: this.translate.instant('GLOBAL.ajustes.success_anular_entrada'),
            });
            // this.router.navigate(['/pages/acta_recibido/consulta_acta_recibido']);
          // }
          // else {
          // this.anulando = false;
          //   (Swal as any).fire({
          //     type: 'error',
          //     title: this.translate.instant('GLOBAL.ajustes.error_anular_entrada_title'),
          //     text: this.translate.instant('GLOBAL.ajustes.error_anular_entrada'),
          //   });
          //   this.anulando = false;
          // }
        // });
      }
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
