import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import Swal from 'sweetalert2';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { checkAndUpdateBinding } from '@angular/core/src/view/util';
import { flattenStyles } from '@angular/platform-browser/src/dom/dom_renderer';
import { isObject } from 'util';

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
  TiposBien: LocalDataSource;
  source: LocalDataSource;
  registrar: boolean= false;
  nuevo: boolean= false;
  tipo_bien: TipoBien;
  @Output() eventChange = new EventEmitter();
  constructor(
    private translate: TranslateService,
    private catalogoHelper: CatalogoElementosHelper,
    private router: Router,
    private pupmanager: PopUpManager,
  ) {

    this.source = new LocalDataSource();
    this.TiposBien = new LocalDataSource();
    this.loadTiposBien();
  }

  ngOnInit() {
    this.loadTiposBien();
    this.loadTablasSettings();
    this.mostrar = false;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  loadTiposBien(): void {
    this.catalogoHelper.getAllTiposBien().subscribe(res => {
      if (Array.isArray(res) && res.length !== 0) {
        this.spinner = true;
        this.TiposBien.load(res);
        this.source.load(res);
        this.source.setSort([{ field: 'Orden', direction: 'desc' }]);
      }
    });
  }

  loadTablasSettings() {
    // console.log(this.source);
    const f = {
      registrar: this.translate.instant('GLOBAL.registrar_nueva_salida'),
      editar: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Title'),
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
        addButtonContent: '<i class="fas fa-plus" title="' + f.registrar + '" aria-label="' + f.registrar + '"></i>',
      },
      mode: 'external',
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '40px',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.Nombre'),
          width: '170px',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Tipo_bien_padre: {
          title: this.translate.instant('GLOBAL.parametros.tiposBien.bien_padre'),
          width: '170px',
          valuePrepareFunction: (value: any) => {
            return value ? value.Nombre : this.translate.instant('GLOBAL.n/a');
          },
        },
        NecesitaPlaca: {
          width: '100px',
          title: this.translate.instant('GLOBAL.parametros.tiposBien.necesita_placa'),
          valuePrepareFunction: (value: any) => {
            return value ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');
          },
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaCreacionHeader'),
          width: '110px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
        },
        FechaModificacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaModificacionHeader'),
          width: '110px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.observaciones'),
          valuePrepareFunction: (value: any) => {
            return value.toUpperCase();
          },
        },
        Orden: {
          title: this.translate.instant('GLOBAL.parametros.tiposBien.numeroOrden'),
          width: '170px',
        },
        Activo: {
          width: '100px',
          title: this.translate.instant('GLOBAL.activo'),
          valuePrepareFunction: (value: any) => {
            return value ? this.translate.instant('GLOBAL.si') : this.translate.instant('GLOBAL.no');
          },
        },
      },
    };
  }

  ActualizarTipoBien(event) {
    this.nuevo = false;
    this.tipo_bien  = event.data;
    this.mostrar = true;
  }
  onRegister() {
    this.nuevo = true;
    this.tipo_bien = new TipoBien();
    this.mostrar = true;
  }
  Registrar() {
    const mensajeconf = {
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    };
    let mensaje;
    if (this.nuevo) {
      mensaje = {
        ...mensajeconf,
        title: this.translate.instant('GLOBAL.parametros.tiposBien.registro_title'),
        text: this.translate.instant('GLOBAL.parametros.tiposBien.registro_text'),
      };
    } else {
      mensaje = {
        ...mensajeconf,
        title: this.translate.instant('GLOBAL.parametros.tiposBien.actualizacion_title'),
        text: this.translate.instant('GLOBAL.parametros.tiposBien.actualizacion_text'),
      };
    }
    (Swal as any).fire(mensaje).then((willDelete) => {
      if (willDelete.value) {
        let text;
        // console.log(this.tipo_bien);
        if (this.nuevo) {
          text = this.translate.instant('GLOBAL.parametros.tiposBien.registro_succes');
          this.catalogoHelper.postTipoBien(this.tipo_bien).toPromise()
          .then((res: any) => {
            if (res) {
              this.succesOp(text);
            }
          });
        } else {
          text = this.translate.instant('GLOBAL.parametros.tiposBien.actualizacion_succes');
          this.tipo_bien.Tipo_bien_padre = this.tipo_bien.Tipo_bien_padre ? this.tipo_bien.Tipo_bien_padre : null;
          this.catalogoHelper.putTipoBien(this.tipo_bien).toPromise()
          .then((res: any) => {
            if (res) {
              this.succesOp(text);
            }
          });
        }


      }
    });
  }
  private recargarlista() {
    this.router.navigateByUrl('/RefrshComponent', {skipLocationChange: true}).then(
      () => this.router.navigate(['/pages/catalogo_bienes/tipos_bien']));
  }
  private succesOp(text) {
    this.pupmanager.showSuccessAlert(text);
    this.recargarlista();
    this.mostrar = false;
  }

  volver() {
    this.tipo_bien = undefined;
    this.mostrar = false;
  }
}
