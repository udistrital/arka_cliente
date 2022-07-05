import { Component, Input, OnInit } from '@angular/core';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';

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
  encargado: any;
  Placa: any;
  Supervisor: any;
  Ordenador: any;
  documentoId: boolean;
  entradaId: number;
  @Input() detalleEntrada: any;

  constructor(
    private entradasHelper: EntradaHelper,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService) {
    this.entradaEspecifica = new Entrada;
    this.contrato = new Contrato;
  }

  ngOnInit() {
    this.iniciarParametros();
  }

  iniciarParametros() {
    const tipoEntrada = new TipoEntrada;
    const supervisor = new Supervisor;
    const ordenadorGasto = new OrdenadorGasto;
    this.entradaEspecifica.TipoEntradaId = tipoEntrada;
    this.contrato.Supervisor = supervisor;
    this.contrato.OrdenadorGasto = ordenadorGasto;
    this.crearEntrada();
  }

  crearEntrada() {

    const detalle = JSON.parse(this.detalleEntrada.movimiento.Detalle);
    this.linkActa = '#/pages/acta_recibido/consulta_acta_recibido/' + detalle.acta_recibido_id;

    if (this.detalleEntrada.proveedor) {
      this.Proveedor = this.detalleEntrada.proveedor;
    }

    if (this.detalleEntrada.factura) {
      this.factura = this.detalleEntrada.factura;
    }

    if (this.detalleEntrada.supervisor) {
      this.Supervisor = this.detalleEntrada.supervisor;
    }

    if (this.detalleEntrada.ordenador) {
      this.Ordenador = this.detalleEntrada.ordenador;
    }

    if (this.detalleEntrada.encargado) {
      this.encargado = this.detalleEntrada.encargado;
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
  }
  loadDetalleAprovechamientos(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.Vigencia = detalle.vigencia; // VIGENCIA CONTRATO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.documentoId = false;
  }
  loadDetalleReposicion(info) {
    const detalle = JSON.parse(info.movimiento.Detalle);
    this.entradaEspecifica.ActaRecibidoId = detalle.acta_recibido_id; // ACTA RECIBIDO
    this.entradaEspecifica.Consecutivo = detalle.consecutivo; // CONSECUTIVO
    this.entradaEspecifica.TipoEntradaId.Nombre = info.movimiento.FormatoTipoMovimientoId.Nombre; // TIPO ENTRADA
    this.entradaEspecifica.Observacion = info.movimiento.Observacion; // OBSERVACIÓN
    this.Placa = detalle.placa_id;
    this.documentoId = false;
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
      this.contrato.TipoContrato = info.tipo_contrato;
      this.contrato.FechaSuscripcion = info.fecha_suscripcion;
      this.contrato.Supervisor = supervisorAux;
      this.contrato.Vigencia = info.vigencia;
    }
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

}
