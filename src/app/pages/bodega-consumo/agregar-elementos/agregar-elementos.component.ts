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
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  DatosEnviados: any;
  mostrar: boolean;
  settings2: any;

  constructor(private router: Router,
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
    this.detalle = false;
    this.loadTablaSettings();
    this.loadEntradas();
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
        },
        ElementoCatalogoId: {
          title: 'Descripcion',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Descripcion;
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
        SaldoCantidad: {
          title: 'Existencias',
        },
      },
    };
  }


  loadEntradas(): void {
    this.bodegaConsumo.getExistenciasKardex().subscribe((res: any) => {
      if (Object.keys(res).length !== 0) {
        this.mostrar = true;
        // console.log(res);
        this.source.load(res);
        // res.forEach(element => {
        //   this.actaRecibidoHelper.getElemento(element.ElementoActaId).subscribe((res2: any) => {
        //     // console.log(res2);
        //     const descripcion = res2.Nombre + ' ' + res2.Marca + ' ' + res2.Serie;
        //     element.Descripcion = descripcion;
        //     this.source.append(element);
        //   });
        // });
      }
    });
  }

  onCustom(event) {

    this.DatosEnviados = event.data;
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
