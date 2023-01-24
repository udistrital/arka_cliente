import { Component, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { SmartTableService } from '../../../@core/data/SmartTableService';

@Component({
  selector: 'ngx-tipos-bien',
  templateUrl: './tipos-bien.component.html',
  styleUrls: ['./tipos-bien.component.scss'],
})
export class TiposBienComponent implements OnInit {
  mostrar: boolean = false;
  spinner: boolean = false;
  updating: boolean;
  settings: any;
  source: LocalDataSource = new LocalDataSource();
  tipo_bien: TipoBien;

  constructor(
    private translate: TranslateService,
    private catalogoHelper: CatalogoElementosHelper,
    private pupmanager: PopUpManager,
    private tabla: SmartTableService,
  ) { }

  ngOnInit() {
    this.loadTiposBien();
    this.loadTablasSettings();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  private loadTiposBien(): void {
    const query = 'limit=-1&sortby=Activo,TipoBienPadreId__Nombre,LimiteInferior&order=desc,desc,asc';
    this.catalogoHelper.getAllTiposBien(query).subscribe(res => {
      this.spinner = true;
      if (res && res.length !== 0) {
        this.source.load(res);
      }
    });
  }

  public handleForm(event) {
    const basei18n = 'GLOBAL.parametros.tiposBien.';
    if (event.Id) {
      this.catalogoHelper.putTipoBien(event).toPromise()
        .then((res: any) => {
          if (res) {
            this.succesOp(basei18n + 'actualizacion_succes');
          }
        });
    } else {
      this.catalogoHelper.postTipoBien(event).toPromise()
        .then((res: any) => {
          if (res) {
            this.succesOp(basei18n + 'registro_succes');
          }
        });
    }
  }

  loadTablasSettings() {
    const f = {
      registrar: this.translate.instant('GLOBAL.parametros.tiposBien.crear'),
      editar: this.translate.instant('GLOBAL.parametros.tiposBien.editar'),
    };

    this.settings = {
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: false,
        edit: true,
        add: true,
      },
      edit: {
        editButtonContent: '<i class="far fa-edit" title="' + f.editar + '" aria-label="' + f.editar + '"></i>',
      },
      add: {
        addButtonContent: '<i class="fas" title="' + f.registrar + '" aria-label="' + f.registrar + '">'
          + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.Nombre'),
          width: '170px',
          valuePrepareFunction: this.tabla.toUpperCase,
        },
        TipoBienPadreId: {
          title: this.translate.instant('GLOBAL.parametros.tiposBien.tipoBienPadre'),
          width: '170px',
          ...this.tabla.getSettingsObject('Nombre'),
        },
        FechaModificacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaModificacionHeader'),
          width: '110px',
          ...this.tabla.getSettingsDate(),
        },
        NecesitaPlaca: {
          width: '80px',
          title: this.translate.instant('GLOBAL.parametros.tiposBien.necesita_placa'),
          ...this.tabla.getSettingsBool(),
        },
        NecesitaPoliza: {
          width: '80px',
          title: this.translate.instant('GLOBAL.parametros.tiposBien.necesita_poliza'),
          ...this.tabla.getSettingsBool(),
        },
        BodegaConsumo: {
          width: '80px',
          title: this.translate.instant('GLOBAL.parametros.tiposBien.bodegaConsumo'),
          ...this.tabla.getSettingsBool(),
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.Descripcion'),
          valuePrepareFunction: this.tabla.toUpperCase,
        },
        LimiteInferior: {
          title: this.translate.instant('GLOBAL.parametros.tiposBien.umbralInferior'),
        },
        LimiteSuperior: {
          title: this.translate.instant('GLOBAL.parametros.tiposBien.umbralSuperior'),
        },
        Activo: {
          width: '100px',
          title: this.translate.instant('GLOBAL.activo'),
          ...this.tabla.getSettingsBool(),
        },
      },
    };
  }

  ActualizarTipoBien(event) {
    this.tipo_bien = event.data;
    this.mostrar = true;
    // console.log(event)
  }

  onRegister() {
    this.tipo_bien = new TipoBien();
    this.mostrar = true;
  }

  private recargarlista() {
    this.source.empty();
    this.loadTiposBien();
  }

  private succesOp(text) {
    this.pupmanager.showSuccessAlert(this.translate.instant(text));
    this.recargarlista();
    this.mostrar = false;
  }

  volver() {
    this.tipo_bien = undefined;
    this.mostrar = false;
  }
}
