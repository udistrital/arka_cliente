import { Component, HostListener, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
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
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import Swal from 'sweetalert2';
import { PopUpManager } from '../../../managers/popUpManager';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';

@Component({
  selector: 'ngx-consulta-entrada',
  templateUrl: './consulta-entrada.component.html',
  styleUrls: ['./consulta-entrada.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})

export class ConsultaEntradaComponent implements OnInit {
  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  entradaId: string;
  entradaEspecifica: Entrada;
  tipos: Array<any>;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  mostrar: boolean = false;
  edit: boolean;
  entradaEdit: any;
  Supervisor: any;
  Ordenador: any;
  Proveedores: any;
  Proveedor: any;
  Placa: any;
  encargado: any;
  estadosMovimiento: Array<EstadoMovimiento>;
  movimiento: Movimiento;
  modo: string = 'consulta';
  filaSeleccionada: any;
  verComponente: boolean;
  transaccionContable: any;
  detalleentrada: String;
  key: boolean = false;
  editarEntrada: boolean = false;
  trContable: any;
  fecha: Date;
  concepto: string;
  factura: SoporteActa;

  constructor(
    private pUpManager: PopUpManager,
    private router: Router,
    private entradasHelper: EntradaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private listService: ListService,
    private store: Store<IAppState>,
    private tercerosHelper: TercerosHelper,
    private route: ActivatedRoute) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.detalle = false;
    this.entradaEspecifica = new Entrada;
    this.contrato = new Contrato;
    this.documentoId = false;
    this.movimiento = new Movimiento;
    this.iniciarParametros();
    this.listService.findClases();
    this.listService.findImpuestoIVA();

  }

@HostListener('window:keydown', ['$event'])
keyEventDown(event: KeyboardEvent) {
   this.key = true;
}


@HostListener('window:keyup', ['$event'])
keyEventUp(event: KeyboardEvent) {
   this.key = false;
}



  onEdit(event) {
    this.edit = true;
    this.entradaEdit = event.data;
  }

  loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.registrar_nueva_entrada'),
      accion: this.translate.instant('GLOBAL.' +
        (this.modo === 'consulta' ? 'verDetalle' : 'movimientos.entradas.accionRevision')),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
    };

    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.tipo_entrada'),
        width: '300px',
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              { value: 'Entrada En Trámite', title: 'En Trámite' },
              { value: 'Entrada Aprobada', title: 'Aprobada' },
              { value: 'Entrada Rechazada', title: 'Rechazada' },
              { value: 'Entrada Con Salida', title: 'Con Salida' },
            ],
          },
        },
      },
    } : [];

    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.movimientos.entradas.' +
        (this.modo === 'consulta' ? 'noEntradasView' : 'noEntradasReview')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: false,
        edit: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.detalle'),
            title: '<i class="fas fa-' + t.icon + '" title="' + t.accion + '" aria-label="' + t.accion + '"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="fas" title="' + t.registrar + '" aria-label="' + t.registrar + '">'
        + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '150px',
        },
        ActaRecibidoId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.una'),
          width: '140px',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = new Date(value);
            date.setUTCMinutes(date.getTimezoneOffset());
            return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
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
        FormatoTipoMovimientoId: {
          title: this.translate.instant('GLOBAL.tipo_entrada'),
          width: '300px',
          filter: {
            type: 'list',
            config: {
              selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
              list: [
                { value: 'Adquisición', title: 'Adquisición' },
                { value: 'Elaboración Propia', title: 'Elaboración Propia' },
                { value: 'Donación', title: 'Donación' },
                { value: 'Reposición', title: 'Reposición' },
                { value: 'Sobrante', title: 'Sobrante' },
                { value: 'Terceros', title: 'Terceros' },
                { value: 'Caja menor', title: 'Caja Menor' },
                { value: 'Adiciones y Mejoras', title: 'Adiciones y Mejoras' },
                { value: 'Intangibles adquiridos', title: 'Intangibles adquiridos' },
                { value: 'Provisional', title: 'Provisional' },
                { value: 'Compra en el Extranjero', title: 'Compra en el Extranjero' },
                { value: 'Intangibles desarrollados', title: 'Intangibles desarrollados' },
                { value: 'Partes por Aprovechamientos', title: 'Partes por Aprovechamientos' },
              ],
            },
          },
        },
        ...columns,
      },
    };
  }

  loadEntradas(): void {
    this.entradasHelper.getEntradas(this.modo === 'revision').subscribe(res => {
      if (res.length) {
        res.forEach(entrada => {
          entrada.Detalle = JSON.parse((entrada.Detalle));
          entrada.ActaRecibidoId = entrada.Detalle.acta_recibido_id;
          entrada.Consecutivo = entrada.Detalle.consecutivo;
          entrada.FormatoTipoMovimientoId = entrada.FormatoTipoMovimientoId.Nombre;
          entrada.EstadoMovimientoId = entrada.EstadoMovimientoId.Nombre;
        });
        this.source.load(res);
        this.source.setSort([{ field: 'FechaCreacion', direction: 'desc' }]);
      }
      this.mostrar = true;
    });
  }

  loadEntradaEspecifica(): void {
    this.entradasHelper.getEntrada(this.entradaId).subscribe(res => {
      if (res.movimiento) {
        this.movimiento = res.movimiento;
        if (res.trContable) {
          const fecha = new Date(res.trContable.fecha).toLocaleString();
          this.trContable = {
            rechazo: '',
            movimientos: res.trContable.movimientos,
            concepto: res.trContable.concepto,
            fecha,
          };
        }

        if (res.proveedor) {
          this.Proveedor = res.proveedor;
        }

        if (res.factura) {
          this.factura = res.factura;
        }

        if (res.supervisor) {
          this.Supervisor = res.supervisor;
        }

        if (res.ordenador) {
          this.Ordenador = res.ordenador;
        }

        switch (this.movimiento.FormatoTipoMovimientoId.Nombre) {
          case 'Adquisición': {
            this.loadDetalleAdquisicion(res);
            break;
          }
          case 'Elaboración Propia': {
            this.loadDetalleElaboracion(res);
            break;
          }
          case 'Donación': {
            this.loadDetalleDonacion(res);
            break;
          }
          case 'Sobrante': {
            this.loadDetalleSobrante(res);
            break;
          }
          case 'Terceros': {
            this.loadDetalleTerceros(res);
            break;
          }
          case 'Caja Menor': {
            this.loadDetalleCajaMenor(res);
            break;
          }
          case 'Adiciones y Mejoras': {
            this.loadDetalleAdicionesMejoras(res);
            break;
          }
          case 'Intangibles adquiridos': {
            this.loadDetalleIntangiblesAdquiridos(res);
            break;
          }
          case 'Provisional': {
            this.loadDetalleProvisional(res);
            break;
          }
          case 'Compra en el Extranjero': {
            this.loadDetalleComprasExtranjeras(res);
            break;
          }
          case 'Intangibles desarrollados': {
            this.loadDetalleIntangiblesDesarrollados(res);
            break;
          }
          case 'Partes por Aprovechamientos': {
            this.loadDetalleAprovechamientos(res);
            break;
          }
          case 'Reposición': {
            this.loadDetalleReposicion(res);
            break;
          }
          default: {
            break;
          }
        }
      }
    });
  }

  loadContrato(info: any): void {
    if (info) {
      const ordenadorAux = new OrdenadorGasto;
      const supervisorAux = new Supervisor;
      ordenadorAux.Id = info.ordenador_gasto.id;
      ordenadorAux.NombreOrdenador = info.ordenador_gasto.nombre_ordenador;
      ordenadorAux.RolOrdenadorGasto = info.ordenador_gasto.rol_ordenador;
      supervisorAux.Id = info.supervisor.id;
      supervisorAux.Nombre = info.supervisor.nombre;
      supervisorAux.Cargo = info.supervisor.cargo;
      supervisorAux.Dependencia = info.supervisor.dependencia_supervisor;
      supervisorAux.Sede = info.supervisor.sede_supervisor;
      supervisorAux.DocumentoIdentificacion = info.supervisor.documento_identificacion;
      this.contrato.OrdenadorGasto = ordenadorAux;
      this.contrato.NumeroContratoSuscrito = info.numero_contrato_suscrito;
      this.contrato.TipoContrato = info.tipo_contrato &&
        this.tipos.find(ct => +ct.Id === +info.tipo_contrato) ? this.tipos.find(ct => +ct.Id === +info.tipo_contrato).Nombre : '';
      this.contrato.FechaSuscripcion = info.fecha_suscripcion;
      this.contrato.Supervisor = supervisorAux;
      this.contrato.Vigencia = info.vigencia;
      this.mostrar = true;
    } else this.mostrar = true;
  }

  confirmSubmit(aprobar: boolean) {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.movimientos.entradas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTtl'),
      text: this.translate.instant('GLOBAL.movimientos.entradas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTxt'),
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
      this.entradasHelper.postEntrada({}, +this.entradaId).toPromise().then((res: any) => {
        this.mostrar = true;
        if (res && res.errorTransaccion === '') {
          this.verComponente = true;
          this.transaccionContable = res.transaccionContable;
          this.source.remove(this.filaSeleccionada);
        } else if (res && res.errorTransaccion !== '') {
          this.verComponente = false;
          this.pUpManager.showErrorAlert(res.errorTransaccion);
          this.onVolver();
        }
      });
    } else {
      const estado = this.estadosMovimiento.find(estadoMovimiento => estadoMovimiento.Nombre === 'Entrada Rechazada').Id;
      this.movimiento.EstadoMovimientoId = <EstadoMovimiento>{ Id: estado };
      this.entradasHelper.putMovimiento(this.movimiento).toPromise().then((res: any) => {
        if (res) {
          this.alertSuccess(false);
        }
      });
    }
  }


  private alertSuccess(aprobar: boolean) {
    const consecutivo = JSON.parse(this.movimiento.Detalle).consecutivo;
    (Swal as any).fire({
      type: 'success',
      title: this.translate.instant('GLOBAL.movimientos.entradas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'TtlOk'),
      text: this.translate.instant('GLOBAL.movimientos.entradas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'TxtOk', { CONSECUTIVO: consecutivo }),
    });
    this.source.remove(this.filaSeleccionada);
    this.onVolver();
    this.mostrar = true;
  }

  loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
      }
    });
  }

  loadSoporte() {
    this.entradasHelper.getSoportes(this.entradaId).subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;

        const filesToGet = [
          {
            Id: data[0].DocumentoId,
            key: data[0].DocumentoId,
          },
        ];

        this.nuxeoService.getDocumentoById$(filesToGet, this.documentoService)
          .subscribe(response => {
            const filesResponse = <any>response;
            // console.log(filesResponse)
            if (Object.keys(filesResponse).length === filesToGet.length) {
              // console.log("files", filesResponse);
              filesToGet.forEach((file: any) => {
                const url = filesResponse[file.Id];
                // let newWindow = window.open('','_blank')
                const new_tab = window.open(url);
                new_tab.onload = () => {
                  new_tab.location = url;
                };
                new_tab.focus();
              });
            }
          });
      }
    });
  }

  // CARGAR DETALLES DE ENTRADA
  loadDetalleAdquisicion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.Importacion = detalle.importacion; // IMPORTACIÓN
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(info.contrato); // CONTRATO
  }

  loadDetalleElaboracion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.Solicitante = detalle.solicitante_id; // SOLICITANTE
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.mostrar = true;
  }

  loadDetalleDonacion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_solicitante; // VIGENCIA SOLICITANTE
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(info.contrato); // CONTRATO
  }

  loadDetalleSobrante(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
  }

  loadDetalleTerceros(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(info.contrato); // CONTRATO
  }

  loadDetalleCajaMenor(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia; // VIGENCIA ORDENADOR
    this.entradaEspecifica.Solicitante = detalle.solicitante_id; // SOLICITANTE
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.mostrar = true;
  }

  loadDetalleAdicionesMejoras(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(info.contrato); // CONTRATO
  }

  loadDetalleIntangiblesAdquiridos(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(info.contrato); // CONTRATO
  }
  loadDetalleProvisional(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(info.contrato); // CONTRATO
    // this.mostrar=true;
  }
  loadDetalleComprasExtranjeras(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.entradaEspecifica.RegistroImportacion = detalle.num_reg_importacion; // NUMERO DE IMPORTACION
    this.entradaEspecifica.TasaRepresentativaMercado = detalle.TRM; // TASA REPRESENTATIVA DEL MERCADO
    this.entradaEspecifica.Divisa = detalle.divisa;
    this.documentoId = false; // SOPORTE
    this.loadContrato(info.contrato); // CONTRATO
    // this.mostrar=true;
  }

  loadDetalleIntangiblesDesarrollados(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
  }
  loadDetalleAprovechamientos(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
    // console.log(this.Proveedor)
  }
  loadDetalleReposicion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.loadEncargadoByPlaca(detalle.placa_id);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.Placa = detalle.placa_id;
    this.documentoId = false;
    this.mostrar = true;
    // console.log(this.Proveedor)
  }

  onCustom(event) {
    if (!this.key) {
       this.mostrar = false;
       this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
       this.filaSeleccionada = event.data;
       this.entradaId = `${event.data.Id}`;
       this.detalle = true;
       this.loadEntradaEspecifica();
    } else {
       if (event.data.EstadoMovimientoId === 'Entrada Rechazada') {
          this.mostrar = true;
          this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
          this.filaSeleccionada = event.data;
          this.entradaId = `${event.data.Id}`;
          this.detalle = false;
          this.edit = false;
          this.editarEntrada = true;
          this.loadEntradaEspecifica();
        }
    }
  }

  onVolver() {
    this.detalle = !this.detalle;
    if (this.editarEntrada) {
        this.detalle = false;
        this.editarEntrada = false;
    }
    this.iniciarParametros();
    this.mostrar = true;
    this.router.navigate(['/pages/entradas']);
  }

  iniciarParametros() {
    this.tipos = this.entradasHelper.getTiposContrato();
    const tipoEntrada = new TipoEntrada;
    const supervisor = new Supervisor;
    const ordenadorGasto = new OrdenadorGasto;
    this.entradaEspecifica.TipoEntradaId = tipoEntrada;
    this.contrato.Supervisor = supervisor;
    this.contrato.OrdenadorGasto = ordenadorGasto;
  }

  loadEncargadoByPlaca(placa: string) {
    this.entradasHelper.getEncargadoElementoByPlaca(placa).subscribe(res => {
      if (res != null && res !== undefined) {
        this.encargado = res.NombreCompleto;
      }else {
        this.encargado = '';
      }
    });
  }

  onRegister() {
    this.router.navigate(['/pages/entradas/registro']);
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
    this.loadEntradas();
    this.loadTablaSettings();

  }

  private formatDate(value) {
    const date = new Date(value);
    date.setUTCMinutes(date.getTimezoneOffset());
    return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
  }

}
