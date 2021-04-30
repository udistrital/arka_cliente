import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-tipos-entrada',
  templateUrl: './tipos-entrada.component.html',
  styleUrls: ['./tipos-entrada.component.scss'],
})
export class TiposEntradaComponent implements OnInit {

  mostrar: boolean;
  updating: boolean;
  settingsTiposEntrada: any;
  TiposEntrada: LocalDataSource;
  constructor(
    private translate: TranslateService,
    private entradasHelper: EntradaHelper,
    private router: Router,
  ) {
    this.TiposEntrada = new LocalDataSource;
  }

  ngOnInit() {
    this.loadTiposEntrada();
    this.loadTablasSettings();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  loadTablasSettings() {

    const f = {
      registrar: this.translate.instant('GLOBAL.Acta_Recibido.RegistroActa.Title'),
      editar: this.translate.instant('GLOBAL.Acta_Recibido.EdicionActa.Title'),
      anular: this.translate.instant('GLOBAL.Acta_Recibido.Anular'),
    };
    this.settingsTiposEntrada = {
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: false,
        edit: true,
        add: false,
      },
      edit: {
        editButtonContent: '<i class="far fa-edit" title="' + f.editar + '" aria-label="' + f.editar + '"></i>',
      },
      mode: 'external',
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.consecutivo'),
          width: '140px',
          filter: false,
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.Nombre'),
          width: '130px',
          filter: false,
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
        Activo: {
          title: this.translate.instant('GLOBAL.activo'),
          filter: false,
          valuePrepareFunction: (value: any) => {
            return value ? 'Si' : 'No';
          },
        },
      },
    };
  }

  loadTiposEntrada(): void {
    this.entradasHelper.getFormatoEntrada().subscribe(res => {
      if (Array.isArray(res) && res.length !== 0) {
        this.mostrar = true;
        this.TiposEntrada.load(res);
      }
    });
  }

  DesactivarMovimiento(event) {
    const FormatoTipoMovimiento = event.data;

    (Swal as any).fire({
      title: this.translate.instant(FormatoTipoMovimiento.Activo ?
        'GLOBAL.parametros.tiposEntradas.title_desactivacion_entrada' : 'GLOBAL.parametros.tiposEntradas.title_activacion_entrada'),
      text: this.translate.instant(FormatoTipoMovimiento.Activo ?
        'GLOBAL.parametros.tiposEntradas.confirmar_desactivacion_entrada' : 'GLOBAL.parametros.tiposEntradas.confirmar_activacion_entrada'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {

      if (result.value) {
        FormatoTipoMovimiento.Activo = !FormatoTipoMovimiento.Activo,
          this.updating = true;
        this.entradasHelper.putFormatoEntrada(FormatoTipoMovimiento).subscribe((res: any) => {
          if (res !== null) {
            (Swal as any).fire({
              type: 'success',
              title: this.translate.instant(FormatoTipoMovimiento.Activo ?
                'GLOBAL.parametros.tiposEntradas.title_success_activacion' : 'GLOBAL.parametros.tiposEntradas.title_success_desactivacion'),
              text: this.translate.instant(FormatoTipoMovimiento.Activo ?
                'GLOBAL.parametros.tiposEntradas.success_activacion' : 'GLOBAL.parametros.tiposEntradas.success_desactivacion'),
            });
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/pages/parametros/tipos-entrada']);
            });
            this.updating = false;
          } else {
            this.updating = false;
            (Swal as any).fire({
              type: 'error',
              title: this.translate.instant(FormatoTipoMovimiento.Activo ?
                'GLOBAL.parametros.tiposEntradas.title_error_activacion' : 'GLOBAL.parametros.tiposEntradas.title_error_desactivacion'),
              text: this.translate.instant(FormatoTipoMovimiento.Activo ?
                'GLOBAL.parametros.tiposEntradas.error_activacion' : 'GLOBAL.parametros.tiposEntradas.error_desactivacion'),
            });
          }
        });
      }
    });
  }
}
