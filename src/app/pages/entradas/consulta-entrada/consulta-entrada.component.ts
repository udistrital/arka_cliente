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
import { PopUpManager } from '../../../managers/popUpManager';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { SmartTableService } from '../../../@core/data/SmartTableService';

@Component({
  selector: 'ngx-consulta-entrada',
  templateUrl: './consulta-entrada.component.html',
  styleUrls: ['./consulta-entrada.component.scss'],
})

export class ConsultaEntradaComponent implements OnInit {
  source: LocalDataSource;
  actaRecibidoId: number;
  entradaId: number;
  entradaEspecifica: Entrada;
  tipos: Array<any>;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  mostrar: boolean = false;
  mostrarEntrada: boolean = false;
  spinner: string;
  Supervisor: any;
  Ordenador: any;
  Proveedor: any;
  Placa: any;
  encargado: any;
  estadosMovimiento: Array<EstadoMovimiento>;
  movimiento: Movimiento;
  modo: string = 'consulta';
  filaSeleccionada: any;
  verComponente: boolean;
  transaccionContable: any;
  updateEntrada: boolean = false;
  trContable: any;
  factura: SoporteActa;
  linkActa: string;

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
    private route: ActivatedRoute,
    private confService: ConfiguracionService,
    private tabla: SmartTableService) {
    this.source = new LocalDataSource();
    this.entradaEspecifica = new Entrada;
    this.contrato = new Contrato;
    this.documentoId = false;
    this.movimiento = new Movimiento;
    this.iniciarParametros();
    this.listService.findClases();
    this.listService.findImpuestoIVA();

  }

  loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.registrar_nueva_entrada'),
      accion: this.translate.instant('GLOBAL.' +
        (this.modo === 'consulta' ? 'verDetalle' : 'movimientos.entradas.accionRevision')),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
      edit: this.translate.instant('GLOBAL.movimientos.entradas.editar'),
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
        delete: this.modo === 'consulta',
        edit: true,
        add: !!this.confService.getRoute('/pages/entradas/registro'),
      },
      add: {
        addButtonContent: '<i class="fas" title="' + t.registrar + '" aria-label="' + t.registrar + '">'
          + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      delete: {
        deleteButtonContent: '<i class="far fa-eye" title="' + 'Editar entrada' + '" aria-label="' + 'Editar entrada' + '"></i>',
      },
      edit: {
        editButtonContent: '<i class="far fa-edit" title="' + t.edit + '" aria-label="' + t.edit + '"></i>',
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
          valuePrepareFunction: this.tabla.formatDate,
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
                { value: 'Adiciones y Mejoras', title: 'Adiciones y Mejoras' },
                { value: 'Adquisición', title: 'Adquisición' },
                { value: 'Caja menor', title: 'Caja Menor' },
                { value: 'Compra en el Extranjero', title: 'Compra en el Extranjero' },
                { value: 'Donación', title: 'Donación' },
                { value: 'Elaboración Propia', title: 'Elaboración Propia' },
                { value: 'Intangibles adquiridos', title: 'Intangibles adquiridos' },
                { value: 'Intangibles desarrollados', title: 'Intangibles desarrollados' },
                { value: 'Partes por Aprovechamientos', title: 'Partes por Aprovechamientos' },
                { value: 'Provisional', title: 'Provisional' },
                { value: 'Reposición', title: 'Reposición' },
                { value: 'Sobrante', title: 'Sobrante' },
                { value: 'Terceros', title: 'Terceros' },
              ],
            },
          },
        },
        ...columns,
      },
    };
  }

  loadEntradas(): void {
    this.spinner = 'Cargando Entradas';
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
      this.spinner = '';
      this.mostrar = true;
    });
  }

  loadEntradaEspecifica(): void {
    this.spinner = 'Cargando detalle de la entrada';
    this.entradasHelper.getEntrada(this.entradaId).subscribe(res => {
      if (res.movimiento) {
        this.movimiento = res.movimiento;

        const detalle = JSON.parse(res.movimiento.Detalle);
        this.actaRecibidoId = detalle.acta_recibido_id;
        this.linkActa = '#/pages/acta_recibido/consulta_acta_recibido/' + this.actaRecibidoId;

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
      this.spinner = '';
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
      this.contrato.TipoContrato = info.tipo_contrato && this.tipos &&
        this.tipos.find(ct => +ct.Id === +info.tipo_contrato) ? this.tipos.find(ct => +ct.Id === +info.tipo_contrato).TipoContrato : '';
      this.contrato.FechaSuscripcion = info.fecha_suscripcion;
      this.contrato.Supervisor = supervisorAux;
      this.contrato.Vigencia = info.vigencia;
      this.mostrarEntrada = true;
    } else {
      this.mostrar = true;
      this.mostrarEntrada = false;
    }
  }

  verLista() {
    this.mostrar = true;
    this.mostrarEntrada = false;
  }

  confirmSubmit(aprobar: boolean) {
    if (this.movimiento && this.movimiento.EstadoMovimientoId && this.movimiento.EstadoMovimientoId.Nombre === 'Entrada En Trámite') {
      this.pUpManager.showAlertWithOptions(this.getOptionsRevision(aprobar))
        .then((result) => {
          if (result.value) {
            this.onSubmitRevision(aprobar);
          }
        });
    }
  }

  private onSubmitRevision(aprobar: boolean) {
    if (aprobar) {
      this.spinner = 'Aprobando entrada y generando transacción contable';
      this.entradasHelper.postEntrada({}, +this.entradaId, true).toPromise().then((res: any) => {
        this.spinner = '';
        if (res && res.errorTransaccion === '') {
          this.alertSuccess(true);
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
      this.spinner = 'Actualizando entrada';
      const estado = this.estadosMovimiento.find(estadoMovimiento => estadoMovimiento.Nombre === 'Entrada Rechazada').Id;
      this.movimiento.EstadoMovimientoId = <EstadoMovimiento>{ Id: estado };
      this.entradasHelper.putMovimiento(this.movimiento).toPromise().then((res: any) => {
        this.spinner = '';
        if (res) {
          this.alertSuccess(false);
        }
      });
    }
  }


  private alertSuccess(aprobar: boolean) {
    const consecutivo = JSON.parse(this.movimiento.Detalle).consecutivo;
    this.pUpManager.showAlertWithOptions(this.getOptionsSubmit(aprobar, consecutivo));
    this.source.remove(this.filaSeleccionada);
    if (!aprobar) {
      this.onVolver();
      this.mostrar = true;
    }
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
    this.mostrarEntrada = true;
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
    this.mostrarEntrada = true;
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
    this.mostrarEntrada = true;
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
    this.mostrarEntrada = true;
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
    this.mostrarEntrada = true;
  }
  loadDetalleAprovechamientos(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrarEntrada = true;
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
    this.mostrarEntrada = true;
  }

  onDelete(event) {
    this.router.navigateByUrl('/pages/entradas/consulta_entrada/' + event.data.Id);
  }

  onEdit(event) {
    if (this.modo === 'revision') {
      this.router.navigateByUrl('/pages/entradas/aprobar_entrada/' + event.data.Id);
    } else if (event.data.EstadoMovimientoId === 'Entrada Rechazada') {
      this.mostrar = false;
      this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
      this.filaSeleccionada = event.data;
      this.entradaId = event.data.Id;
      this.updateEntrada = true;
    } else {
      this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errorEditar'));
    }

  }

  onVolver($event: boolean = false) {
    if ($event) {
      this.loadEntradas();
    }
    this.updateEntrada = false;
    this.iniciarParametros();
    this.mostrar = true;
    this.mostrarEntrada = false;
    this.filaSeleccionada = undefined;
    this.entradaId = undefined;
    this.trContable = undefined;
    this.transaccionContable = undefined;
    this.verComponente = false;
    this.router.navigateByUrl('/pages/entradas/' +
      (this.modo === 'consulta' ? 'consulta' : this.modo === 'revision' ? 'aprobar' : '') + '_entrada');
  }

  private getTiposContrato() {
    this.entradasHelper.getTiposContrato().subscribe((res: any) => {
      this.tipos = res;
    });
  }

  iniciarParametros() {
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
      } else {
        this.encargado = '';
      }
    });
  }

  onRegister() {
    this.updateEntrada = true;
    this.mostrar = false;
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.getTiposContrato();
    this.loadEstados();

    this.route.data.subscribe(data => {
      if (data && data.modo) {
        this.modo = data.modo;
      }
    });

    this.route.paramMap.subscribe(params => {

      if (params && +params.get('id')) {
        this.entradaId = +this.route.snapshot.paramMap.get('id');
        this.loadEntradaEspecifica();
      } else {
        this.loadEntradas();
        this.loadTablaSettings();
      }

    });

  }

  private getOptionsRevision(aprobar: boolean) {
    const base = 'GLOBAL.movimientos.entradas.';
    return {
      title: this.translate.instant(base + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTtl'),
      text: this.translate.instant(base + (aprobar ? 'aprobacion' : 'rechazo') + 'ConfrmTxt'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

  private getOptionsSubmit(aprobar: boolean, consecutivo: string) {
    const base = 'GLOBAL.movimientos.entradas.';
    return {
      type: 'success',
      title: this.translate.instant(base + (aprobar ? 'aprobacion' : 'rechazo') + 'TtlOk'),
      text: this.translate.instant(base + (aprobar ? 'aprobacion' : 'rechazo') + 'TxtOk', { CONSECUTIVO: consecutivo }),
    };
  }

}
