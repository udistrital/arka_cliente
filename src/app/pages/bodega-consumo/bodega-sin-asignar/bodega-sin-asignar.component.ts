import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
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
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { UserService } from '../../../@core/data/users.service';


@Component({
  selector: 'ngx-bodega-sin-asignar',
  templateUrl: './bodega-sin-asignar.component.html',
  styleUrls: ['./bodega-sin-asignar.component.scss']
})
export class BodegaSinAsignarComponent implements OnInit {

  source: LocalDataSource;
  source2: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  settings2: any;

  @Input() DatosRecibidos: any;
  @Output() DatosEnviados = new EventEmitter();
  @Output() DatosTotales = new EventEmitter();

  constructor(private router: Router,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private userService: UserService,
  ) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.detalle = false;
    this.loadTablaSettings();
    this.ElementosSinAsignar();
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: 'Solicitar',
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'Solicitar',
            title: '<i class="fas fa-pencil-alt" title="Ver"></i>',
          },
        ],
      },
      columns: {
        Nombre: {
          title: 'Elemento',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Marca: {
          title: 'Marca',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Serie: {
          title: 'Serie',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        SubgrupoCatalogoId: {
          title: 'Subgrupo',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        SaldoCantidad: {
          title: 'Saldo',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
      },
    };
  }


  ElementosSinAsignar(): void {
    this.salidasHelper.getElementos2().subscribe((res: any) => {
      console.log(res);
      this.source.load(res);
    });
  }

  onCustom(event) {

    this.DatosEnviados.emit(event.data);
    this.detalle = true;
  }

  onVolver() {
    this.detalle = !this.detalle;
    this.iniciarParametros();
  }

  iniciarParametros() {

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
