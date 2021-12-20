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
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { UserService } from '../../../@core/data/users.service';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-agregar-elementos',
  templateUrl: './agregar-elementos.component.html',
  styleUrls: ['./agregar-elementos.component.scss'],
})
export class AgregarElementosComponent implements OnInit {

  source: LocalDataSource;
  source2: LocalDataSource;
  entradas: Array<Entrada>;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  DatosEnviados: any;
  mostrar: boolean;
  settings2: any;

  constructor(
    private router: Router,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private bodegaConsumo: BodegaConsumoHelper,
    private userService: UserService,
  ) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
  }

  ngOnInit() {
    this.loadTablaSettings();
    this.loadEntradas();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Solicitudes.Accion'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.Solicitudes.Accion'),
            title: '<span class="fas fa-plus" title="' + this.translate.instant('GLOBAL.Solicitudes.Accion') + '"></span>',
          },
        ],
      },
      columns: {
        ElementoCatalogoId: {
          title: this.translate.instant('GLOBAL.Elemento.Uno'),
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              let elem = value.Codigo ? value.Codigo + ' - ' : '';
              elem += value.Nombre ? value.Nombre : '';
              return elem;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Descripcion.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.Descripcion'),
        },
        SaldoCantidad: {
          title: this.translate.instant('GLOBAL.Existencias'),
        },
      },
    };
  }


  loadEntradas(): void {
    this.bodegaConsumo.getExistenciasKardex().subscribe((res: any) => {
      if (res.length) {
        res.forEach(el => {
          el.Descripcion = el.ElementoCatalogoId.Descripcion;
        });
      }
      this.source.load(res);
      this.mostrar = true;
    });
  }

  onCustom(event) {
    this.DatosEnviados = event.data;
  }

  onRegister() {
    this.router.navigate(['/pages/entradas/registro']);
  }

}
