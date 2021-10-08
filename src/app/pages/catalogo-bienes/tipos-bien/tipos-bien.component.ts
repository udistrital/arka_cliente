import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ngx-smart-table';
import Swal from 'sweetalert2';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-tipos-bien',
  templateUrl: './tipos-bien.component.html',
  styleUrls: ['./tipos-bien.component.scss'],
})
export class TiposBienComponent implements OnInit {
  mostrar: boolean;
  updating: boolean;
  settings: any;
  TiposBien: LocalDataSource;
  source: LocalDataSource;
  registrar: boolean= false;
  editar: boolean= false;

  @Output() eventChange = new EventEmitter();
  constructor(
    private translate: TranslateService,
    private catalogoHelper: CatalogoElementosHelper,
    private router: Router,
  ) {

    this.source = new LocalDataSource();
    this.TiposBien = new LocalDataSource();
    this.loadTiposBien();
  }

  ngOnInit() {
    this.loadTiposBien();
    this.loadTablasSettings();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  loadTiposBien(): void {
    this.catalogoHelper.getAllTiposBien().subscribe(res => {
      if (Array.isArray(res) && res.length !== 0) {
        this.mostrar = true;
        this.TiposBien.load(res);
        this.source.load(res);
        // console.log(res);
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
          width: '100px',
          filter: false,
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.Nombre'),
          width: '170px',
          filter: false,
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaCreacionHeader'),
          width: '110px',
          filter: false,
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
        },
        FechaModificacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaModificacionHeader'),
          width: '110px',
          filter: false,
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.observaciones'),
          filter: false,
          valuePrepareFunction: (value: any) => {
            return value.toUpperCase();
          },
        },
        Orden: {
          title: this.translate.instant('GLOBAL.parametros.tiposBien.asignable_kardex'),
          width: '170px',
          filter: false,
          valuePrepareFunction: (value: any) => {
            return value === 1 ? 'Si' : 'No';
          },
        },
        Activo: {
          width: '100px',
          title: this.translate.instant('GLOBAL.activo'),
          filter: false,
          valuePrepareFunction: (value: any) => {
            return value ? 'Si' : 'No';
          },
        },
      },
    };
  }

  ActualizarTipoBien(event) {
    const TipoBien = event.data;

    (Swal as any).fire({
      title: this.translate.instant(TipoBien.Activo ?
        'GLOBAL.parametros.tiposBien.title_desactivacion_entrada' : 'GLOBAL.parametros.tiposBien.title_activacion_entrada'),
      text: this.translate.instant(TipoBien.Activo ?
        'GLOBAL.parametros.tiposBien.confirmar_desactivacion_entrada' : 'GLOBAL.parametros.tiposBien.confirmar_activacion_entrada'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {

      if (result.value) {
        TipoBien.Activo = !TipoBien.Activo,
        this.updating = true;
        this.catalogoHelper.putTipoBien(TipoBien).subscribe((res: any) => {
          if (res !== null) {
            (Swal as any).fire({
              type: 'success',
              title: this.translate.instant(TipoBien.Activo ?
                'GLOBAL.parametros.tiposBien.title_success_activacion' : 'GLOBAL.parametros.tiposBien.title_success_desactivacion'),
              text: this.translate.instant(TipoBien.Activo ?
                'GLOBAL.parametros.tiposBien.success_activacion' : 'GLOBAL.parametros.tiposBien.success_desactivacion'),
            });
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/pages/parametros/tipos-bien']);
            });
            this.updating = false;
          } else {
            this.updating = false;
            (Swal as any).fire({
              type: 'error',
              title: this.translate.instant(TipoBien.Activo ?
                'GLOBAL.parametros.tiposBien.title_error_activacion' : 'GLOBAL.parametros.tiposBien.title_error_desactivacion'),
              text: this.translate.instant(TipoBien.Activo ?
                'GLOBAL.parametros.tiposBien.error_activacion' : 'GLOBAL.parametros.tiposBien.error_desactivacion'),
            });
          }
        });
      }
    });
  }
  onRegister() {
    this.registrar = true;
  }
  recargarlista(event)
  {
    if(event.registrado){
      this.router.navigateByUrl('/RefrshComponent', {skipLocationChange: true}).then(
        ()=> this.router.navigate(['/pages/catalogo_bienes/tipos_bien']));
    }
  }
}
