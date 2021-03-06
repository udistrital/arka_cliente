import { Component, OnInit } from '@angular/core';
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
import { DocumentoService } from '../../../@core/data/documento.service';
import { ListService } from '../../../@core/store/services/list.service';
import { TerceroCriterioPlanta } from '../../../@core/data/models/terceros_criterio';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';

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
  consecutivoEntrada: string;
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

  constructor(
    private router: Router,
    private entradasHelper: EntradaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private listService: ListService,
    private store: Store<IAppState>,
    private tercerosHelper: TercerosHelper) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.detalle = false;
    this.entradaEspecifica = new Entrada;
    this.contrato = new Contrato;
    this.documentoId = false;
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
    // console.log(this.entradaEdit);
  }

  loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.registrar_nueva_entrada'),
      editar: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Title'),
    };
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: false,
        edit: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.detalle'),
            title: '<i class="fas fa-eye" title="Ver"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="fas fa-plus" title="' + t.registrar + '" aria-label="' + t.registrar + '"></i>',
      },
      mode: 'external',
      columns: {
        /*
        Id: {
          title: 'ID',
        },
        // */
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
          filter: {
            type: 'list',
            config: {
              selectText: 'Select...',
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
    this.entradasHelper.getEntradas().subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos) && data[datos].Movimiento.Id !== undefined) {
            const entrada = new Entrada;
            const tipoEntradaAux = new TipoEntrada;
            const detalle = JSON.parse((data[datos].Movimiento.Detalle));
            entrada.Id = data[datos].Movimiento.Id;
            entrada.ActaRecibidoId = detalle.acta_recibido_id;
            entrada.FechaCreacion = data[datos].Movimiento.FechaCreacion;
            entrada.Consecutivo = detalle.consecutivo;
            // tipoEntradaAux.Nombre = data[datos].TipoMovimiento.Nombre; // Innecesario, genera un error en el filter.
            entrada.TipoEntradaId = data[datos].TipoMovimiento.Nombre;
            this.entradas.push(entrada);
          }
        }
        // console.log(this.entradas)
        this.source.load(this.entradas);
        this.mostrar = true;
      }
    });
  }

  loadEntradaEspecifica(): void {
    this.entradasHelper.getEntrada(this.consecutivoEntrada).subscribe(res => {
      if (res !== null) {
        // console.log(res);
        switch (res.TipoMovimiento.TipoMovimientoId.Nombre) {
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
          case 'Caja menor': {
            this.loadDetalleCajaMenor(res);
            break;
          }
          case 'Adiciones y mejoras': {
            this.loadDetalleAdicionesMejoras(res);
            break;
          }
          case 'Intangibles': {
            this.loadDetalleIntangiblesAdquiridos(res);
            break;
          }
          case 'Provisional': {
            this.loadDetalleProvisional(res);
            break;
          }
          case 'Compras extranjeras': {
            this.loadDetalleComprasExtranjeras(res);
            break;
          }
          case 'Desarrollo interior': {
            this.loadDetalleIntangiblesDesarrollados(res);
            break;
          }
          case 'Aprovechamientos': {
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
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.Importacion = detalle.importacion; // IMPORTACIÓN
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
  }

  loadDetalleElaboracion(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.Solicitante = detalle.solicitante_id; // SOLICITANTE
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.mostrar = true;
  }

  loadDetalleDonacion(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_solicitante; // VIGENCIA SOLICITANTE
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
  }

  loadDetalleSobrante(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
  }

  loadDetalleTerceros(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
  }

  loadDetalleCajaMenor(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.loadSupervisorById(detalle.supervisor);
    this.loadOrdenadorById(detalle.ordenador_gasto_id);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia; // VIGENCIA ORDENADOR
    this.entradaEspecifica.Solicitante = detalle.solicitante_id; // SOLICITANTE
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.mostrar = true;
  }

  loadDetalleAdicionesMejoras(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
  }

  loadDetalleIntangiblesAdquiridos(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
    // this.mostrar=true;
  }
  loadDetalleProvisional(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
    // this.mostrar=true;
  }
  loadDetalleComprasExtranjeras(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.entradaEspecifica.RegistroImportacion = detalle.num_reg_importacion; // NUMERO DE IMPORTACION
    this.entradaEspecifica.TasaRepresentativaMercado = detalle.TRM; // TASA REPRESENTATIVA DEL MERCADO
    this.documentoId = false; // SOPORTE
    this.loadContrato(); // CONTRATO
    // this.mostrar=true;
  }
  loadAprovechamientos(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
  }
  loadDetalleIntangiblesDesarrollados(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.loadSupervisorById(detalle.supervisor);
    this.loadOrdenadorById(detalle.ordenador_gasto_id);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    this.mostrar = true;
  }
  loadDetalleAprovechamientos(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    // console.log(detalle.supervisor)
    this.loadSupervisorById(detalle.supervisor); // DATOS GENERALES DEL SUPERVISOR
    this.loadProveedor(detalle.proveedor);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
    // console.log(this.Proveedor)
  }
  loadDetalleReposicion(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.loadEncargadoByPlaca(detalle.placa_id);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.Placa = detalle.placa_id;
    this.documentoId = false;
    this.mostrar = true;
    // console.log(this.Proveedor)
  }

  onCustom(event) {
    this.mostrar = false;
    this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
    // this.consecutivoEntrada = `${event.data.Consecutivo}`;
    this.consecutivoEntrada = `${event.data.Id}`;
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
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.loadEntradas();
    this.loadLists();
    this.loadTablaSettings();

  }

}
