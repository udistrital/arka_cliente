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
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-consulta-entrada',
  templateUrl: './consulta-entrada.component.html',
  styleUrls: ['./consulta-entrada.component.scss'],
})

export class ConsultaEntradaComponent implements OnInit {

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  entradaId: string;
  entradaEspecifica: Entrada;
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

  constructor(
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
    this.listService.findProveedores();
    this.loadLists();

  }
  private loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Proveedores = list.listProveedores[0];
        // console.log(this.Proveedores)
      },
    );

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
        addButtonContent: '<i class="fas fa-plus" title="' + t.registrar + '" aria-label="' + t.registrar + '"></i>',
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
                { value: 'Desarrollo interior', title: 'Desarrollo interior' },
                { value: 'Adiciones y mejoras', title: 'Adiciones y mejoras' },
                { value: 'Intangibles', title: 'Intangibles' },
                { value: 'Aprovechamientos', title: 'Aprovechamientos' },
                { value: 'Compras extranjeras', title: 'Compras extranjeras' },
                { value: 'Provisional', title: 'Provisional' },
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
      if (res !== null) {
        this.movimiento = res[0];
        switch (this.movimiento.FormatoTipoMovimientoId.Nombre) {
          case 'Adquisición': {
            this.loadDetalleAdquisicion(res[0]);
            break;
          }
          case 'Elaboración Propia': {
            this.loadDetalleElaboracion(res[0]);
            break;
          }
          case 'Donación': {
            this.loadDetalleDonacion(res[0]);
            break;
          }
          case 'Sobrante': {
            this.loadDetalleSobrante(res[0]);
            break;
          }
          case 'Terceros': {
            this.loadDetalleTerceros(res[0]);
            break;
          }
          case 'Caja menor': {
            this.loadDetalleCajaMenor(res[0]);
            break;
          }
          case 'Adiciones y mejoras': {
            this.loadDetalleAdicionesMejoras(res[0]);
            break;
          }
          case 'Intangibles adquiridos': {
            this.loadDetalleIntangiblesAdquiridos(res[0]);
            break;
          }
          case 'Provisional': {
            this.loadDetalleProvisional(res[0]);
            break;
          }
          case 'Compra en el Extranjero': {
            this.loadDetalleComprasExtranjeras(res[0]);
            break;
          }
          case 'Intangibles desarrollados': {
            this.loadDetalleIntangiblesDesarrollados(res[0]);
            break;
          }
          case 'Partes por Aprovechamientos': {
            this.loadDetalleAprovechamientos(res[0]);
            break;
          }
          case 'Reposición': {
            this.loadDetalleReposicion(res[0]);
            break;
          }
          default: {
            break;
          }
        }
      }
    });
  }

  loadContrato(): void {
    if (this.entradaEspecifica.ContratoId && this.entradaEspecifica.Vigencia) {
      this.entradasHelper.getContrato(this.entradaEspecifica.ContratoId, this.entradaEspecifica.Vigencia).subscribe(res => {
        if (res !== null) {
          const ordenadorAux = new OrdenadorGasto;
          const supervisorAux = new Supervisor;
          ordenadorAux.Id = res.contrato.ordenador_gasto.id;
          ordenadorAux.NombreOrdenador = res.contrato.ordenador_gasto.nombre_ordenador;
          ordenadorAux.RolOrdenadorGasto = res.contrato.ordenador_gasto.rol_ordenador;
          supervisorAux.Id = res.contrato.supervisor.id;
          supervisorAux.Nombre = res.contrato.supervisor.nombre;
          supervisorAux.Cargo = res.contrato.supervisor.cargo;
          supervisorAux.Dependencia = res.contrato.supervisor.dependencia_supervisor;
          supervisorAux.Sede = res.contrato.supervisor.sede_supervisor;
          supervisorAux.DocumentoIdentificacion = res.contrato.supervisor.documento_identificacion;
          this.contrato.OrdenadorGasto = ordenadorAux;
          this.contrato.NumeroContratoSuscrito = res.contrato.numero_contrato_suscrito;
          this.contrato.TipoContrato = res.contrato.tipo_contrato;
          this.contrato.FechaSuscripcion = res.contrato.fecha_suscripcion;
          this.contrato.Supervisor = supervisorAux;
          this.mostrar = true;
        }
      });
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
        if (res) {
          this.alertSuccess(true);
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
      showConfirmButton: false,
      timer: 3000,
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
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.Importacion = detalle.importacion; // IMPORTACIÓN
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
  }

  loadDetalleElaboracion(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.Solicitante = detalle.solicitante_id; // SOLICITANTE
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.mostrar = true;
  }

  loadDetalleDonacion(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_solicitante; // VIGENCIA SOLICITANTE
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
  }

  loadDetalleSobrante(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
  }

  loadDetalleTerceros(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
  }

  loadDetalleCajaMenor(info) {
    const detalle = JSON.parse(info.Detalle);
    this.loadSupervisorById(detalle.supervisor);
    this.loadOrdenadorById(detalle.ordenador_gasto_id);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia; // VIGENCIA ORDENADOR
    this.entradaEspecifica.Solicitante = detalle.solicitante_id; // SOLICITANTE
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.mostrar = true;
  }

  loadDetalleAdicionesMejoras(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
  }

  loadDetalleIntangiblesAdquiridos(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
    // this.mostrar=true;
  }
  loadDetalleProvisional(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
    // this.mostrar=true;
  }
  loadDetalleComprasExtranjeras(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.entradaEspecifica.RegistroImportacion = detalle.num_reg_importacion; // NUMERO DE IMPORTACION
    this.entradaEspecifica.TasaRepresentativaMercado = detalle.TRM; // TASA REPRESENTATIVA DEL MERCADO
    this.entradaEspecifica.Divisa = detalle.divisa;
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
    // this.mostrar=true;
  }
  loadAprovechamientos(info) {
    const detalle = JSON.parse(info.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
  }
  loadDetalleIntangiblesDesarrollados(info) {
    const detalle = JSON.parse(info.Detalle);
    this.loadSupervisorById(detalle.supervisor);
    this.loadOrdenadorById(detalle.ordenador_gasto_id);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
  }
  loadDetalleAprovechamientos(info) {
    const detalle = JSON.parse(info.Detalle);
    // console.log(detalle.supervisor)
    this.loadSupervisorById(detalle.supervisor); // DATOS GENERALES DEL SUPERVISOR
    this.loadProveedor(detalle.proveedor);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    // console.log(this.Proveedor)
  }
  loadDetalleReposicion(info) {
    const detalle = JSON.parse(info.Detalle);
    this.loadEncargadoByPlaca(detalle.placa_id);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Observacion; // OBSERVACIÓN
    this.Placa = detalle.placa_id;
    this.documentoId = false;
    this.mostrar = true;
    // console.log(this.Proveedor)
  }

  onCustom(event) {
    this.mostrar = false;
    this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
    // this.consecutivoEntrada = `${event.data.Consecutivo}`;
    this.filaSeleccionada = event.data;
    this.entradaId = `${event.data.Id}`;
    this.detalle = true;
    this.loadEntradaEspecifica();
  }

  onVolver() {
    this.detalle = !this.detalle;
    this.iniciarParametros();
    this.mostrar = true;
  }

  iniciarParametros() {
    const tipoEntrada = new TipoEntrada;
    const supervisor = new Supervisor;
    const ordenadorGasto = new OrdenadorGasto;
    this.entradaEspecifica.TipoEntradaId = tipoEntrada;
    this.contrato.Supervisor = supervisor;
    this.contrato.OrdenadorGasto = ordenadorGasto;
  }
  loadSupervisorById(id: number): void {
    this.tercerosHelper.getTercerosByCriterio('funcionarioPlanta', id).subscribe( res => {
      if (Array.isArray(res)) {
        this.Supervisor = res[0];
        // console.log(this.Supervisor)
      }
    });
    this.mostrar = true;
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
  loadOrdenadorById(id: number): void {
    this.tercerosHelper.getTercerosByCriterio('ordenadoresGasto', id).subscribe( res => {
      if (Array.isArray(res)) {
        this.Ordenador = res[0];
        // console.log(this.Ordenador)
      }
    });
    this.mostrar = true;
  }
  loadProveedor(Compuesto: string) {
    this.Proveedor = this.Proveedores.find((prov) => prov.compuesto === Compuesto).NomProveedor;
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
    this.loadLists();
    this.loadTablaSettings();

  }

}
