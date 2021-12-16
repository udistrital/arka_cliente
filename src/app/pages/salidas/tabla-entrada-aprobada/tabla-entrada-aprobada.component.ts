import { Component, OnInit, Input, ComponentFactoryResolver } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { ListService } from '../../../@core/store/services/list.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { TerceroCriterioPlanta } from '../../../@core/data/models/terceros_criterio';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';

@Component({
  selector: 'ngx-tabla-entrada-aprobada',
  templateUrl: './tabla-entrada-aprobada.component.html',
  styleUrls: ['./tabla-entrada-aprobada.component.scss'],
})
export class TablaEntradaAprobadaComponent implements OnInit {


  @Input('editar') edicion: boolean = false;
  @Input('actaParametro') actaParametro: number = 0;
  @Input('salida_id') salida_id: number = 0;
  @Input('idEntradaParametro') idEntradaParametro: string = '';

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  show: boolean = false;
  mode: string = 'determinate';
  showList: boolean;
  Supervisor: any;
  Ordenador: any;
  Proveedores: any;
  Proveedor: any;
  encargado: any;
  Placa: any;
  salida: any;

  constructor(
    private router: Router,
    private entradasHelper: EntradaHelper,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private listService: ListService,
    private store: Store<IAppState>,
    private tercerosHelper: TercerosHelper,
  ) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.detalle = false;
    this.entradaEspecifica = new Entrada;
    this.contrato = new Contrato;
    this.documentoId = false;
    this.listService.findClases();
    this.listService.findImpuestoIVA();
    this.listService.findProveedores();
    this.loadTablaSettings();
    this.iniciarParametros();
    this.loadEntradas();
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

  loadTablaSettings() {
    const t = {
      accion: this.translate.instant('GLOBAL.seleccionar'),
    };
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.movimientos.entradas.noEntradasAprobadas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.detalle'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: t.accion,
            title: '<i class="fas fa-arrow-right" title="' + t.accion + '" aria-label="' + t.accion + '"></i>',
          },
        ],
      },
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
        FormatoTipoMovimientoId: {
          title: this.translate.instant('GLOBAL.tipo_entrada'),
          valuePrepareFunction: (value: any) => {
            return value;
          },
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
      },
    };
  }

  loadEntradas(): void {

    this.salidasHelper.getEntradasSinSalida().subscribe(res => {
      if (res.length) {
        res.forEach(entrada => {
          entrada.Detalle = JSON.parse((entrada.Detalle));
          entrada.ActaRecibidoId = entrada.Detalle.acta_recibido_id;
          entrada.Consecutivo = entrada.Detalle.consecutivo;
          entrada.FormatoTipoMovimientoId = entrada.FormatoTipoMovimientoId.Nombre;
        });
        this.source.load(res);
        this.source.setSort([{ field: 'FechaCreacion', direction: 'desc' }]);
      }
      this.showList = true;
    });
  }

  loadEntradaEspecifica(): void {

    if (this.edicion) {
        this.salidasHelper.getSalida(this.salida_id).subscribe(res1 => {
          this.salida = res1.Salida;
        });
    }
    this.entradasHelper.getMovimiento(this.consecutivoEntrada).subscribe(res => {
      if (res !== null) {
        switch (res[0].FormatoTipoMovimientoId.Nombre) {
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
          case 'Intangibles': {
            this.loadDetalleIntangiblesAdquiridos(res[0]);
            break;
          }
          case 'Provisional': {
            this.loadDetalleProvisional(res[0]);
            break;
          }
          case 'Compras extranjeras': {
            this.loadDetalleComprasExtranjeras(res[0]);
            break;
          }
          case 'Desarrollo interior': {
            this.loadDetalleIntangiblesDesarrollados(res[0]);
            break;
          }
          case 'Aprovechamientos': {
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
        this.show = true;
      }
    });
  }

  loadOrdenador() {

  }

  loadSoporte() {
    this.entradasHelper.getSoportes(this.consecutivoEntrada).subscribe(res => {
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
    this.show = true;
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
    this.show = true;
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
    this.show = true;
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
    // this.show=true;
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
    // this.show=true;
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
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
    // this.show=true;
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
    this.show = true;
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
    this.show = true;
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
    this.show = true;
    // console.log(this.Proveedor)
  }

  loadSupervisorById(id: number): void {
    this.tercerosHelper.getTercerosByCriterio('funcionarioPlanta', id).subscribe( res => {
      if (Array.isArray(res)) {
        this.Supervisor = res[0];
        // console.log(this.Supervisor)
      }
    });
    this.show = true;
  }
  loadOrdenadorById(id: number): void {
    this.tercerosHelper.getTercerosByCriterio('ordenadoresGasto', id).subscribe( res => {
      if (Array.isArray(res)) {
        this.Ordenador = res[0];
        // console.log(this.Ordenador)
      }
    });
    this.show = true;
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
  loadProveedor(Compuesto: string) {
    this.Proveedor = this.Proveedores.find((prov) => prov.compuesto === Compuesto).NomProveedor;
  }

  onCustom(event) {
    // console.log(event.data);
    this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
    // this.consecutivoEntrada = `${event.data.Consecutivo}`;
    this.consecutivoEntrada = `${event.data.Id}`;
    this.detalle = true;
    this.loadEntradaEspecifica();
  }

  onVolver() {
    this.detalle = !this.detalle;
    this.iniciarParametros();
    this.show = false;
  }

  iniciarParametros() {
    const tipoEntrada = new TipoEntrada;
    const supervisor = new Supervisor;
    const ordenadorGasto = new OrdenadorGasto;
    this.entradaEspecifica.TipoEntradaId = tipoEntrada;
    this.contrato.Supervisor = supervisor;
    this.contrato.OrdenadorGasto = ordenadorGasto;
  }

  onRegister() {
    this.router.navigate(['/pages/entradas/registro']);
  }

  ngOnInit() {

    if (!this.edicion) {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
        this.loadTablaSettings();
        });
    } else {
       this.consecutivoEntrada = this.idEntradaParametro;
       this.actaRecibidoId = this.actaParametro;
       this.detalle = true;
       this.loadEntradaEspecifica();
    }

  }

}
