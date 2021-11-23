import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { ActivatedRoute, Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada, EstadoMovimiento, Movimiento } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { parse } from 'path';
import { combineLatest } from 'rxjs';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-consulta-salidas',
  templateUrl: './consulta-salidas.component.html',
  styleUrls: ['./consulta-salidas.component.scss'],
})
export class ConsultaSalidasComponent implements OnInit {

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  editaentrada: boolean;
  actaParametro: number = 0;
  entradaParametro: string = '';
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  salidaId: string;
  Proveedores: any;
  Dependencias: any;
  Sedes: any;
  mostrar: boolean;
  modo: string = 'consulta';
  estadosMovimiento: Array<EstadoMovimiento>;
  movimiento: Movimiento;
  filaSeleccionada: any;

  constructor(
    private router: Router,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private Actas_Recibido: ActaRecibidoHelper,
    private listService: ListService,
    private terceros: TercerosHelper,
    private route: ActivatedRoute,
    private entradasHelper: EntradaHelper,
  ) {
    this.source = new LocalDataSource();
    this.detalle = false;
  }



  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data && data.modo !== null && data.modo !== undefined) {
        this.modo = data.modo;
      }
    });
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.loadEstados();
  }

  loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
        this.loadTablaSettings();
        this.loadSalidas();
      }
    });
  }

  loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.movimientos.salidas.nuevaSalida'),
      accion: this.translate.instant('GLOBAL.' +
        (this.modo === 'consulta' ? 'verDetalle' : 'movimientos.salidas.accionRevision')),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
    };
    const estadoSelect = 'GLOBAL.movimientos.estado';
    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.tipo_entrada'),
        width: '300px',
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              { value: this.estadosMovimiento.find(status => status.Nombre === 'Salida En Trámite').Nombre,
                title: this.translate.instant(estadoSelect + 'Tramite') },
              { value: this.estadosMovimiento.find(status => status.Nombre === 'Salida Aprobada').Nombre,
                title: this.translate.instant(estadoSelect + 'Aprobado') },
              { value: this.estadosMovimiento.find(status => status.Nombre === 'Salida Rechazada').Nombre,
                title: this.translate.instant(estadoSelect + 'Rechazo') },
            ],
          },
        },
      },
    } : [];
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.movimientos.salidas.' +
        (this.modo === 'consulta' ? 'noSalidasView' : 'noSalidasReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: true,
        edit: (this.modo === 'consulta' ? true : false),
        add: true,
      },
      add: {
        addButtonContent: '<i class="fas fa-plus"></i>',
      },
      edit: {
        editButtonContent: '<i ng-disabled="true"  class="far fa-edit"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-' + t.icon + '"></i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
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
        ...columns,
      },
    };
  }
  loadSalidas(): void {
    this.salidasHelper.getSalidas(this.modo === 'revision').subscribe(res => {
      if (res.length) {
        res.forEach(salida => {
          const movimientoPadre = salida.MovimientoPadreId;
          salida.MovimientoPadreId = movimientoPadre ? JSON.parse(movimientoPadre.Detalle).consecutivo : '';
          salida.EstadoMovimientoId = this.estadosMovimiento.find(estado =>
            estado.Id === salida.EstadoMovimientoId).Nombre;
        });
        this.source.load(res);
        this.source.setSort([{ field: 'FechaCreacion', direction: 'desc' }]);
      }
      this.mostrar = true;
    });
  }

  onDelete(event) {
    this.salidaId = `${event.data.Id}`;
    this.detalle = true;
    this.editaentrada = false;
    this.filaSeleccionada = event.data;
    this.cargarSalida();
  }

  onEdit(event) {
    if (event.data.EstadoMovimientoId === 'Salida Rechazada') {
       this.salidaId = `${event.data.Id}`;
       this.detalle = false;
       this.editaentrada = true;
       this.filaSeleccionada = event.data;
       this.cargarSalida();
	}
  }

  onRegister() {
    this.router.navigate(['/pages/salidas/registro_salidas']);
  }
  onVolver() {
    this.detalle = false;
    this.editaentrada = false;
  }

  private cargarSalida () {
    this.entradasHelper.getMovimiento(this.salidaId).toPromise().then((res: any) => {
      this.entradaParametro = res[0].MovimientoPadreId.Id;
      this.actaParametro = JSON.parse(res[0].MovimientoPadreId.Detalle).acta_recibido_id;
      this.movimiento = res[0];
    });
  }

  confirmSubmit(aprobar: boolean) {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.movimientos.salidas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTtl'),
      text: this.translate.instant('GLOBAL.movimientos.salidas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTxt'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    }).then((result) => {
      if (result.value) {
        this.onSubmitRevision(aprobar);
      }
    });
  }

  private onSubmitRevision(aprobar: boolean) {
    this.mostrar = false;
    if (aprobar) {
      this.salidasHelper.postSalida(this.movimiento.Id).toPromise().then((res: any) => {
        if (res) {
          this.alertSuccess(true);
        }
      });
    } else {
      const estado = this.estadosMovimiento.find(estadoMovimiento => estadoMovimiento.Nombre === 'Salida Rechazada').Id;
      this.movimiento.EstadoMovimientoId = <EstadoMovimiento>{ Id: estado };
      this.entradasHelper.putMovimiento(this.movimiento).toPromise().then((res: any) => {
        if (res) {
          this.alertSuccess(false);
        }
      });
    }
  }

  private alertSuccess(aprobar: boolean) {
    (Swal as any).fire({
      type: 'success',
      title: this.translate.instant('GLOBAL.movimientos.salidas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'TtlOk'),
      text: this.translate.instant('GLOBAL.movimientos.salidas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'TxtOk',
        { CONSECUTIVO: this.movimiento.Id }),
      showConfirmButton: false,
      timer: 3000,
    });
    this.source.remove(this.filaSeleccionada);
    this.onVolver();
    this.mostrar = true;
  }
}
