import { Component, Input, OnInit } from '@angular/core';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { GestorDocumentalService } from '../../../helpers/gestor_documental/gestorDocumentalHelper';

@Component({
  selector: 'ngx-detalle-entrada',
  templateUrl: './detalle-entrada.component.html',
  styleUrls: ['./detalle-entrada.component.scss'],
})
export class DetalleEntradaComponent implements OnInit {

  entradaEspecifica: Entrada;
  linkActa: string;
  Proveedor: any;
  factura: SoporteActa;
  contrato: Contrato;
  Supervisor: any;
  Ordenador: any;
  documentoId: number;
  entradaId: number;
  settings: any;
  source: LocalDataSource;

  @Input() detalleEntrada: any;

  constructor(
    private documento: GestorDocumentalService,
    private translate: TranslateService,
    private tabla: SmartTableService,
  ) {
    this.entradaEspecifica = new Entrada;
  }

  ngOnInit() {
    this.iniciarParametros();
  }

  iniciarParametros() {
    const tipoEntrada = new TipoEntrada;
    this.entradaEspecifica.TipoEntradaId = tipoEntrada;
    this.crearEntrada();
  }

  crearEntrada() {

    const detalle = JSON.parse(this.detalleEntrada.movimiento.Detalle);
    this.linkActa = '#/pages/acta_recibido/consulta_acta_recibido/' + detalle.acta_recibido_id;
    this.entradaEspecifica.Observacion = this.detalleEntrada.movimiento.Observacion;
    this.entradaEspecifica.TipoEntradaId.Nombre = this.detalleEntrada.movimiento.FormatoTipoMovimientoId.Nombre;
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id;
    this.entradaEspecifica.Consecutivo = detalle.consecutivo;
    this.entradaEspecifica.UnidadEjecutora = this.detalleEntrada.unidadEjecutora;
    this.loadContrato(this.detalleEntrada.contrato);

    this.documentoId = this.detalleEntrada.documentoId;
    this.Proveedor = this.detalleEntrada.proveedor;
    this.factura = this.detalleEntrada.factura;
    this.Supervisor = this.detalleEntrada.supervisor;
    this.Ordenador = this.detalleEntrada.ordenador;

    if (this.detalleEntrada.elementos && this.detalleEntrada.elementos.length) {
      this.loadTabla(this.detalleEntrada.elementos);
      this.getSettings();
    }

    switch (this.detalleEntrada.movimiento.FormatoTipoMovimientoId.Nombre) {
      case 'Adquisición': {
        this.loadDetalleAdquisicion(this.detalleEntrada);
        break;
      }
      case 'Elaboración Propia': {
        this.loadDetalleElaboracion(this.detalleEntrada);
        break;
      }
      case 'Donación': {
        this.loadDetalleDonacion(this.detalleEntrada);
        break;
      }
      case 'Sobrante': {
        this.loadDetalleSobrante(this.detalleEntrada);
        break;
      }
      case 'Terceros': {
        this.loadDetalleTerceros(this.detalleEntrada);
        break;
      }
      case 'Caja Menor': {
        this.loadDetalleCajaMenor(this.detalleEntrada);
        break;
      }
      case 'Adiciones y Mejoras': {
        this.loadDetalleAdicionesMejoras(this.detalleEntrada);
        break;
      }
      case 'Intangibles adquiridos': {
        this.loadDetalleIntangiblesAdquiridos(this.detalleEntrada);
        break;
      }
      case 'Provisional': {
        this.loadDetalleProvisional(this.detalleEntrada);
        break;
      }
      case 'Compra en el Extranjero': {
        this.loadDetalleComprasExtranjeras(this.detalleEntrada);
        break;
      }
      case 'Intangibles desarrollados': {
        this.loadDetalleIntangiblesDesarrollados(this.detalleEntrada);
        break;
      }
      case 'Partes por Aprovechamientos': {
        this.loadDetalleAprovechamientos(this.detalleEntrada);
        break;
      }
      case 'Reposición': {
        this.loadDetalleReposicion(this.detalleEntrada);
        break;
      }
      default: {
        break;
      }
    }

  }

  // CARGAR DETALLES DE ENTRADA
  loadDetalleAdquisicion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleElaboracion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleDonacion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleSobrante(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleTerceros(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleCajaMenor(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleAdicionesMejoras(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleIntangiblesAdquiridos(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleProvisional(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleComprasExtranjeras(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.RegistroImportacion = detalle.num_reg_importacion; // NUMERO DE IMPORTACION
    this.entradaEspecifica.TasaRepresentativaMercado = detalle.TRM; // TASA REPRESENTATIVA DEL MERCADO
    this.entradaEspecifica.Divisa = detalle.divisa;
  }

  loadDetalleIntangiblesDesarrollados(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleAprovechamientos(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadDetalleReposicion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
  }

  loadContrato(info: any): void {
    if (info) {
      this.contrato = new Contrato;
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
      this.contrato.TipoContrato = info.tipo_contrato;
      this.contrato.FechaSuscripcion = info.fecha_suscripcion;
      this.contrato.Supervisor = supervisorAux;
      this.contrato.Vigencia = info.vigencia;
    }
  }

  public loadSoporte() {

    if (!this.documentoId) {
      return;
    }

    const filesToGet = [{
      Id: this.documentoId,
    }];

    this.documento.get(filesToGet).subscribe((data: any) => {
      if (data && data.length && data[0].url) {
        window.open(data[0].url);
      }
    });
  }

  loadTabla(elementos: any[]) {
    for (const elemento of elementos) {
      elemento.Entrada = elemento.Salida.MovimientoPadreId.Detalle;
      elemento.FechaEntrada = elemento.Salida.MovimientoPadreId.FechaCreacion;
      elemento.Salida_ = elemento.Salida.Detalle;
      elemento.FechaSalida = elemento.Salida.FechaCreacion;
    }
    this.source = new LocalDataSource();
    this.source.load(elementos);
  }

  getSettings() {
    this.settings = {
      hideSubHeader: true,
      actions: {
        position: 'right',
        delete: false,
        edit: false,
        add: false,
      },
      mode: 'external',
      columns: {
        Placa: {
          title: this.translate.instant('GLOBAL.Placa'),
          width: '150px',
        },
        Entrada: {
          title: this.translate.instant('GLOBAL.Entrada'),
          width: '150px',
          ...this.tabla.getSettingsParse('consecutivo'),
        },
        FechaEntrada: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
          width: '70px',
          valuePrepareFunction: this.tabla.formatDate,
        },
        Salida_: {
          title: this.translate.instant('GLOBAL.Salida'),
          width: '150px',
          ...this.tabla.getSettingsParse('consecutivo'),
        },
        FechaSalida: {
          title: this.translate.instant('GLOBAL.fecha_salida'),
          width: '70px',
          valuePrepareFunction: this.tabla.formatDate,
        },
        ValorTotal: {
          type: 'html',
          title: this.translate.instant('GLOBAL.valor_total'),
          width: '70px',
          valuePrepareFunction: this.tabla.prepareFunctionCurrency,
        },
      },
    };
  }

}
