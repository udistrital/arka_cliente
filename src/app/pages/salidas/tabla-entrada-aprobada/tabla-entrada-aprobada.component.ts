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
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';

@Component({
  selector: 'ngx-tabla-entrada-aprobada',
  templateUrl: './tabla-entrada-aprobada.component.html',
  styleUrls: ['./tabla-entrada-aprobada.component.scss'],
})
export class TablaEntradaAprobadaComponent implements OnInit {

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  show: boolean;
  mode: string = 'determinate';
  showList: boolean;

  constructor(
    private router: Router,
    private entradasHelper: EntradaHelper,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
  ) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.detalle = false;
    this.entradaEspecifica = new Entrada;
    this.contrato = new Contrato;
    this.documentoId = false;
    this.loadTablaSettings();
    this.iniciarParametros();
    this.loadEntradas();
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.detalle'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            // name: this.translate.instant('GLOBAL.detalle'),
            name: 'Seleccionar',
            title: '<i class="fas fa-pencil-alt" title="Ver"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: 'ID',
        },
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
            return value.Nombre;
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
              ],
            },
          },
        },
      },
    };
  }

  loadEntradas(): void {

    this.salidasHelper.getEntradasSinSalida().subscribe(res => {
      if (Object.keys(res[0]).length !== 0) {
        for (const datos of res) {
          const entrada = new Entrada;
          const tipoEntradaAux = new TipoEntrada;
          const detalle = JSON.parse((datos.Detalle));
          entrada.Id = datos.Id;
          entrada.ActaRecibidoId = detalle.acta_recibido_id;
          entrada.FechaCreacion = datos.FechaCreacion;
          entrada.Consecutivo = detalle.consecutivo;
          tipoEntradaAux.Nombre = datos.FormatoTipoMovimientoId.Nombre;
          entrada.TipoEntradaId = tipoEntradaAux;
          this.entradas.push(entrada);
        }
        this.source.load(this.entradas);
        this.showList = true;
      }
    });
  }

  loadEntradaEspecifica(): void {
    this.entradasHelper.getEntrada(this.consecutivoEntrada).subscribe(res => {
      if (res !== null) {
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
          default: {
            this.show = true;
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
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.loadContrato(); // CONTRATO
    this.entradaEspecifica.Importacion = detalle.importacion; // IMPORTACIÓN
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
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
    this.documentoId = true; // SOPORTE
    this.show = true;
  }

  loadDetalleDonacion(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.loadContrato(); // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_solicitante; // VIGENCIA SOLICITANTE
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
    this.show = true;
  }

  loadDetalleSobrante(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia_ordenador; // VIGENCIA ORDENADOR
    this.entradaEspecifica.OrdenadorId = detalle.ordenador_gasto_id; // ORDENADOR DE GASTO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = true;
    this.show = true;
  }

  loadDetalleTerceros(info) {
    const detalle = JSON.parse(info.Movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.ContratoId = detalle.contrato_id; // CONTRATO
    this.entradaEspecifica.Vigencia = detalle.vigencia_contrato; // VIGENCIA CONTRATO
    this.loadContrato(); // CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.TipoMovimiento.TipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.Movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false; // SOPORTE
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
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
  }

}
