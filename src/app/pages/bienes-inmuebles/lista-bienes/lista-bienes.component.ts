import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { ActaRecibidoCrud } from '../../../helpers/acta_recibido_crud/acta_recibido_crud';

@Component({
  selector: 'ngx-lista-bienes',
  templateUrl: './lista-bienes.component.html',
  styleUrls: ['./lista-bienes.component.scss'],
})
export class ListaBienesComponent implements OnInit {

  spinner: string = '';
  source: LocalDataSource;
  bienSeleccionado: number = 0;
  settings: any;
  crear: boolean = false;

  constructor(
    private pUpManager: PopUpManager,
    private translate: TranslateService,
    private tabla: SmartTableService,
    private actaRecibidoCrud: ActaRecibidoCrud,
  ) {
    this.source = new LocalDataSource();
  }

  ngOnInit() {
    this.loadTablaSettings();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    this.cargarInmuebles();
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      mode: 'external',
      noDataMessage: this.translate.instant('GLOBAL.inmuebles.noData'),
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
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          ...this.tabla.getSettingsDate(),
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
        },
      },
    };
  }

  private cargarInmuebles(): void {
    this.spinner = 'Cargando bienes inmuebles';
    const payload = 'limit=-1&query=Activo:true,ActaRecibidoId__TipoActaId__CodigoAbreviacion:INM';
    this.actaRecibidoCrud.getAllElemento(payload).
      subscribe(res => {
        this.spinner = '';
        this.source.load(res);
      });
  }

  onCreate() {
  }

  onCustom(event) {
    this.bienSeleccionado = event.data.Id;
  }

  onVolver() {
    this.bienSeleccionado = 0;
  }

}
