import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { ActaRecibidoCrud } from '../../../helpers/acta_recibido_crud/acta_recibido_crud';

@Component({
  selector: 'ngx-consulta-inmuebles',
  templateUrl: './consulta-inmuebles.component.html',
  styleUrls: ['./consulta-inmuebles.component.scss'],
})
export class ConsultaInmueblesComponent implements OnInit {

  spinner: string = '';
  source: LocalDataSource;
  bienSeleccionado: number = 0;
  settings: any;
  crear: boolean = false;
  modo: string; // 'create' || 'read' || 'update'

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
    const t = {
      registrar: this.translate.instant('GLOBAL.bajas.consulta.nuevo'),
      delete: this.translate.instant('GLOBAL.verDetalle'),
      edit: this.translate.instant('GLOBAL.bajas.revisar.accionEdit'),
    };

    this.settings = {
      hideSubHeader: false,
      mode: 'external',
      noDataMessage: this.translate.instant('GLOBAL.inmuebles.noData'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: true,
        edit: true,
        delete: true,
      },
      add: {
        addButtonContent: '<em class="fas" title="' + t.registrar + '" aria-label="' + t.registrar + '">'
          + this.translate.instant('GLOBAL.crear_nuevo') + '</em>',
      },
      edit: {
        editButtonContent: '<em class="fas fa-edit" title="' + t.edit + '" aria-label="' + t.edit + '"></em>',
      },
      delete: {
        deleteButtonContent: '<em class="fas fa-eye" title="' + t.delete + '" aria-label="' + t.delete + '"></em>',
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
    this.modo = 'create';
  }

  onCustom(event) {
    this.bienSeleccionado = event.data.Id;
    this.modo = 'read';
  }

  onEdit(event) {
    this.bienSeleccionado = event.data.Id;
    this.modo = 'update';
  }

  onVolver() {
    this.bienSeleccionado = 0;
    this.modo = '';
  }

}
