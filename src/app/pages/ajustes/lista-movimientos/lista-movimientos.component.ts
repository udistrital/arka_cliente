import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';

@Component({
  selector: 'ngx-lista-movimientos',
  templateUrl: './lista-movimientos.component.html',
  styleUrls: ['./lista-movimientos.component.scss'],
})

export class ListaMovimientosComponent implements OnInit {

  mostrar: boolean = false;
  textoCargando: string;
  consecutivo: string;
  ajustes: LocalDataSource;
  settingsListaActas: any;
  ajuste: any;
  crear: boolean;

  constructor(
    private translate: TranslateService,
    private salidasHelper: SalidaHelper,
  ) {
    this.ajustes = new LocalDataSource();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
  }

  ngOnInit() {
    this.textoCargando = 'Cargando ajustes';
    this.loadTablasSettings();
    this.loadAjustes();
  }

  loadTablasSettings() {
    const f = {
      registrar: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Title'),
      editar: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Title'),
      anular: this.translate.instant('GLOBAL.Acta_Recibido.Anular'),
    };
    this.settingsListaActas = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_actas_entrada'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: true,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'detalle',
            title: '<i class="fa fa-location-arrow" title="Ver movimientos asociados"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="fas" title="' + f.registrar + '" aria-label="' + f.registrar + '">' +
        this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaCreacionHeader'),
          valuePrepareFunction: (value: any) => {
            return this.formatDate(value);
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
        Numero: {
          title: this.translate.instant('GLOBAL.revisor'),
        },
      },
    };

  }

  onCreate() {
    this.crear = true;
  }

  private loadAjustes(): void {
    this.salidasHelper.getAjustes().subscribe(res => {
      if (res.length) {
        res.forEach(ajuste => {
          const detalle = JSON.parse(ajuste.Detalle);
          ajuste.Consecutivo = detalle.Consecutivo;
          ajuste.Numero = detalle.Elementos.length;
        });
      }
      this.ajustes.load(res);
      this.mostrar = true;
    });
  }

  CargarMovimientosAsociados(event) {
    this.textoCargando = 'Cargando ajuste';
    this.mostrar = false;
    this.salidasHelper.getDetalleAjuste(event.data.Id).subscribe(res => {
      if (res.Elementos) {
        this.consecutivo = JSON.parse(res.Movimiento.Detalle).Consecutivo;
        this.ajuste = res;
        this.ajuste.TrContable = {
          movimientos: res.TrContable,
          rechazo: '',
        };
      }
      this.mostrar = true;
    });
  }

  onVolver() {
    this.ajuste = undefined;
    this.crear = false;
  }

  private formatDate(value) {
    const date = new Date(value);
    date.setUTCMinutes(date.getTimezoneOffset());
    return new Date(Date.parse(date.toString())).toLocaleDateString('es-CO');
  }

  get alerta() {
    return {
      type: 'warning',
      title: '',
      text: '',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

}
