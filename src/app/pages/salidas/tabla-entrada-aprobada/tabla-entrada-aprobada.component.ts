import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { SmartTableService } from '../../../@core/data/SmartTableService';

@Component({
  selector: 'ngx-tabla-entrada-aprobada',
  templateUrl: './tabla-entrada-aprobada.component.html',
  styleUrls: ['./tabla-entrada-aprobada.component.scss'],
})
export class TablaEntradaAprobadaComponent implements OnInit {

  @Input('editar') edicion: boolean = false;
  @Input('salida_id') salida_id: number = 0;
  @Input('idEntradaParametro') idEntradaParametro: string = '';

  source: LocalDataSource;
  spinner: string;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  settings: any;
  mode: string = 'determinate';
  salida: any;

  constructor(
    private entradasHelper: EntradaHelper,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private tabla: SmartTableService) {
    this.source = new LocalDataSource();
  }

  loadTablaSettings() {
    const t = {
      accion: this.translate.instant('GLOBAL.seleccionar'),
    };
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.movimientos.entradas.noEntradasAprobadas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.detalle'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: t.accion,
            title: '<i class="fas fa-arrow-right" title="' + t.accion + '" aria-label="' + t.accion + '"></i>',
          },
        ],
      },
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        ActaRecibidoId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.una'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
          width: '70px',
          ...this.tabla.getSettingsDate(),
        },
        FormatoTipoMovimientoId: {
          title: this.translate.instant('GLOBAL.tipo_entrada'),
          valuePrepareFunction: (value: any) => {
            return value;
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
    this.spinner = 'Cargando entradas disponibles';
    this.salidasHelper.getEntradasSinSalida().subscribe(res => {
      if (res.length) {
        res.forEach(entrada => {
          entrada.Detalle = JSON.parse((entrada.Detalle));
          entrada.ActaRecibidoId = entrada.Detalle.acta_recibido_id;
          entrada.FormatoTipoMovimientoId = entrada.FormatoTipoMovimientoId.Nombre;
        });
        this.source.load(res);
      }
      this.spinner = '';
    });
  }

  loadEntradaEspecifica(): void {
    this.spinner = 'Cargando detalle de la entrada';
    this.entradasHelper.getEntrada(this.consecutivoEntrada).subscribe(res => {
      if (res.movimiento) {
        this.entradaEspecifica = res;
        const detalle = JSON.parse(res.movimiento.Detalle);
        this.entradaEspecifica.Consecutivo = res.movimiento.Consecutivo;
        this.actaRecibidoId = detalle.acta_recibido_id;
      }
      this.spinner = '';
    });
  }

  loadSalida(): void {
    this.salidasHelper.getSalida(this.salida_id).subscribe(res => {
      this.salida = res.Salida;
    });
  }

  onCustom(event) {
    this.actaRecibidoId = +`${event.data.ActaRecibidoId}`;
    this.consecutivoEntrada = `${event.data.Id}`;
    this.loadEntradaEspecifica();
  }

  onVolver() {
    this.actaRecibidoId = 0;
    this.consecutivoEntrada = '';
    this.entradaEspecifica = undefined;
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadTablaSettings();
    });

    if (!this.edicion) {
      this.loadTablaSettings();
      this.loadEntradas();
    } else if (this.idEntradaParametro && this.salida_id) {
      this.consecutivoEntrada = this.idEntradaParametro;
      this.loadSalida();
      this.loadEntradaEspecifica();
    }
  }

}
