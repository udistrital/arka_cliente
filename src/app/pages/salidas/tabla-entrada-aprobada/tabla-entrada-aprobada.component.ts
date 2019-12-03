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

  constructor(private router: Router, private entradasHelper: EntradaHelper, private translate: TranslateService,
    private nuxeoService: NuxeoService, private documentoService: DocumentoService) {
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
            name: this.translate.instant('GLOBAL.detalle'),
            title: '<i class="fas fa-check" title="Ver"></i>',
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
          title: this.translate.instant('GLOBAL.acta_recibido'),
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
    this.entradasHelper.getEntradas().subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos) && data[datos].ActaRecibidoId !== undefined) {
            const entrada = new Entrada;
            entrada.Id = data[datos].Id;
            entrada.ActaRecibidoId = data[datos].ActaRecibidoId;
            entrada.ContratoId = data[datos].ContratoId;
            entrada.DocumentoContableId = data[datos].DocumentoContableId;
            entrada.FechaCreacion = data[datos].FechaCreacion;
            entrada.FechaModificacion = data[datos].FechaModificacion;
            entrada.Importacion = data[datos].Importacion;
            entrada.Observacion = data[datos].Observacion;
            entrada.Solicitante = data[datos].Solicitante;
            entrada.TipoEntradaId = data[datos].TipoEntradaId;
            entrada.ElementoId = data[datos].ElementoId;
            entrada.Consecutivo = data[datos].Consecutivo;
            entrada.Vigencia = data[datos].Vigencia;
            entrada.Activo = data[datos].Activo;
            this.entradas.push(entrada);
          }
        }
        this.source.load(this.entradas);
      }
    });
  }

  loadEntradaEspecifica(): void {
    this.entradasHelper.getEntrada(this.consecutivoEntrada).subscribe(res => {
      if (res !== null) {
        this.entradaEspecifica.ActaRecibidoId = res[0].ActaRecibidoId;
        this.entradaEspecifica.ContratoId = res[0].ContratoId;
        this.entradaEspecifica.DocumentoContableId = res[0].DocumentoContableId;
        this.entradaEspecifica.FechaCreacion = res[0].FechaCreacion;
        this.entradaEspecifica.FechaModificacion = res[0].FechaModificacion;
        this.entradaEspecifica.Importacion = res[0].Importacion;
        this.entradaEspecifica.Observacion = res[0].Observacion;
        this.entradaEspecifica.Solicitante = res[0].Solicitante;
        this.entradaEspecifica.TipoEntradaId = res[0].TipoEntradaId;
        this.entradaEspecifica.ElementoId = res[0].ElementoId;
        this.entradaEspecifica.Consecutivo = res[0].Consecutivo;
        this.entradaEspecifica.Vigencia = res[0].Vigencia;
        this.entradaEspecifica.Activo = res[0].Activo;
        if (this.entradaEspecifica.ContratoId !== 0) {
          this.loadContrato();
        }
        if (this.entradaEspecifica.TipoEntradaId.Id === 1
          || this.entradaEspecifica.TipoEntradaId.Id === 2
          || this.entradaEspecifica.TipoEntradaId.Id === 3) {
            this.documentoId = true;
        } else {
          this.documentoId = false;
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
      }
    });
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

  onCustom(event) {
    this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
    // this.consecutivoEntrada = `${event.data.Consecutivo}`;
    this.consecutivoEntrada = `${event.data.Id}`;
    this.detalle = true;
    this.loadEntradaEspecifica();
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
