import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-relacion-catalogo',
  templateUrl: './relacion-catalogo.component.html',
  styleUrls: ['./relacion-catalogo.component.scss'],
})
export class RelacionCatalogoComponent implements OnInit {

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

  @Output() DatosEnviados = new EventEmitter();
  @Output() DatosTotales = new EventEmitter();
  subgrupo_id: any;

  @Input('Subgrupo_Id')
  set name(subgrupo_id: any) {
    this.subgrupo_id = subgrupo_id;
    // console.log(this.subgrupo_id);
    if (this.subgrupo_id !== undefined) {
      this.ElementosSinAsignar(this.subgrupo_id);
    }
  }

  constructor(private router: Router,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private userService: UserService,
    private catalogoHelper: CatalogoElementosHelper,
  ) {
    this.source = new LocalDataSource();
    this.entradas = new Array<Entrada>();
    this.detalle = false;
    this.loadTablaSettings();
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
          title: 'Nombre',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Descripcion: {
          title: 'Descripcion',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        FechaInicio: {
          title: 'Fecha de Inicio',
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
        FechaFin: {
          title: 'Fecha de Finalizacion',
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
      },
    };
  }


  ElementosSinAsignar(subgrupo_id): void {
    // console.log(subgrupo_id);
    this.catalogoHelper.getElementosSubgrupo(subgrupo_id).subscribe((res: any) => {
      // console.log(res[0]);
      if (Object.keys(res[0]).length !== 0) {
        this.source.load(res);
      }

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
