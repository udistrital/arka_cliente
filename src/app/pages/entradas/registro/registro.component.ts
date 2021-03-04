import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { ActaRecibido, ActaRecibidoUbicacion } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Tercero } from '../../../@core/data/models/terceros';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';

@Component({
  selector: 'ngx-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {

  mostrar: boolean = false;

  // Datos Tabla
  source: LocalDataSource;
  tiposDeEntradas: string[];
  // Acta de recibido
  actaSeleccionada: string;
  settings: any;
  opcionEntrada: string;
  movimientoId: number;

  @Input() EntradaEdit: any;

  private terceros: Partial<Tercero>[];
  private actas: any[];

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
    private listService: ListService,
    private store: Store<IAppState>,
    private tercerosHelper: TercerosHelper,

  ) {
    this.source = new LocalDataSource();
    this.actaSeleccionada = '';
  }

  ngOnInit() {
    this.loadTablaSettings();
    this.loadActas();
    this.listService.findClases();
    this.listService.findImpuestoIVA();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.loadTerceros();
    this.actaSeleccionada = this.EntradaEdit ? this.EntradaEdit.ActaRecibidoId : '';
    this.movimientoId = this.EntradaEdit ? this.EntradaEdit.Id : '';
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_actas_entrada'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'detalle',
            title: '<i class="fas fa-door-open" title="Seleccionar"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
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
        FechaVistoBueno: {
          title: this.translate.instant('GLOBAL.fecha_visto_bueno'),
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
        RevisorId: {
          title: this.translate.instant('GLOBAL.revisor'),
        },
        UbicacionId: {
          title: this.translate.instant('GLOBAL.ubicacion'),
          valuePrepareFunction: (value: any) => {
            return value.Nombre.toUpperCase();
          },
        },
        /*
        EstadoActaId: {
          title: this.translate.instant('GLOBAL.estado'),
          valuePrepareFunction: (value: any) => {
            return value.CodigoAbreviacion.toUpperCase();
          },
        },
        // */
        Observaciones: {
          title: this.translate.instant('GLOBAL.observaciones'),
          valuePrepareFunction: (value: any) => {
            return value.toUpperCase();
          },
        },
      },
    };
  }

  loadActas(): void {
    this.actaRecibidoHelper.getActasRecibido().subscribe(res => {
      if (Array.isArray(res) && res.length !== 0) {
        const data = <Array<ActaRecibidoUbicacion>>res;
        this.actas = data;
        this.mostrarData();
        // console.log({actas: this.actas});
      }
    });
  }

  private loadTerceros(): void {
    this.tercerosHelper.getTerceros().subscribe(terceros => {
      this.terceros = terceros;
      this.mostrarData();
      // console.log({terceros: this.terceros});
    });
  }

  private mostrarData(): void {
    if (!this.mostrar
    && this.actas && this.actas.length
    && this.terceros && this.terceros.length) {
      this.source.load(this.actas.map(acta => {
        const buscar = (tercero: Tercero) => tercero.Id === acta.RevisorId;
        let nombre = '';
        if (this.terceros.some(buscar)) {
          nombre = this.terceros.find(buscar).NombreCompleto;
        }
        acta.RevisorId = nombre;
        return acta;
      }));
      this.mostrar = true;
    }
  }

  onCustom(event) {
    this.actaRecibidoHelper.getTransaccionActa(event.data.Id).subscribe(res => {
      this.tiposDeEntradas = res[0].SoportesActa[0].SoporteActa.ProveedorId ? [
        // De acuerdo a las HU:
        'EA', 'ECM', 'ECE', 'EPPA', 'EAM', 'EIA', 'EBEMP', 'ED', 'EID',
        // Los siguientes no están en las HU
        // 'EEP', 'ET',
      ] : [
        // De acuerdo a las HU:
        'EPR', 'ESI',
        // Los siguientes no están en las HU
        // 'EEP', 'ET',
      ];
      this.actaSeleccionada = `${event.data.Id}`;
    });
  }

}
