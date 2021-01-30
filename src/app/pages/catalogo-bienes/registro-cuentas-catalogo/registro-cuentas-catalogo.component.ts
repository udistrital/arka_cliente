import { Component, OnInit, Input, Output, EventEmitter, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Grupo, Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { CrudMovimientoComponent } from '../crud-movimientos/crud-movimiento.component';
import { FormControl } from '@angular/forms';
import { CuentasFormulario, CuentaGrupo } from '../../../@core/data/models/catalogo/cuentas_grupo';
import { CuentasGrupoTransaccion } from '../../../@core/data/models/catalogo/cuentas_subgrupo';
import { element } from '@angular/core/src/render3';
import { ToasterConfig, Toast, BodyOutputType, ToasterService } from 'angular2-toaster';

@Component({
  selector: 'ngx-registro-cuentas-catalogo',
  templateUrl: './registro-cuentas-catalogo.component.html',
  styleUrls: ['./registro-cuentas-catalogo.component.scss'],
})
export class RegistroCuentasCatalogoComponent implements OnInit {
  grupo_id: number;

  @Output() eventChange = new EventEmitter();
  @ViewChildren(CrudMovimientoComponent) ref: QueryList<CrudMovimientoComponent>;
  info_grupo: Grupo;
  formGrupo: any;
  regGrupo1: any;
  clean: boolean;
  catalogos: Array<Catalogo>;
  catalogoId: number;
  subgrupoHijo: Subgrupo;
  uid_1: Subgrupo;
  ModificarGrupo: boolean;
  uid_2: Subgrupo;
  uid_3: Subgrupo;
  uid_4: Subgrupo;
  Movimiento: number;
  Movimientos_Entradas;
  Movimientos_Salidas;
  Movimientos_Depreciacion;
  Movimientos_Valorizacion;
  selected = new FormControl(0);
  Movimientos: any[];
  config: ToasterConfig;
  all_mov: number;
  all_mov_ok: boolean;
  depreciacion_ok: boolean;
  valorizacion_ok: boolean;

  cargando_catalogos: boolean = true;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private toasterService: ToasterService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.catalogos = new Array<Catalogo>();
    this.catalogoId = 0;
    this.Movimientos = [];
  }

  ngOnInit() {
    this.loadCatalogos();
    this.listService.findPlanCuentasDebito();
    this.listService.findPlanCuentasCredito();
    this.catalogoElementosService.getTiposMovimientoKronos().subscribe((res: any[]) => {
      this.Movimientos_Entradas = res.filter((x: any) => x.Descripcion.indexOf('Entrada') !== -1);
      this.Movimientos_Salidas = res.filter((x: any) => x.Descripcion.indexOf('Salida') !== -1);
      this.Movimientos_Depreciacion = res.filter((x: any) => x.Descripcion.indexOf('Depreciacion') !== -1);
      this.Movimientos_Valorizacion = res.filter((x: any) => x.Descripcion.indexOf('Valorizacion') !== -1);
      this.all_mov = res.length - 1;
    });
  }

  // Se ve si ya tiene cuentas asignadas para mostrarlas en el formulario
  ver3(event) {
    // console.log(event); REVISAR AQUI
    let mov_existente: boolean;
    if (event.Id === undefined) {
      this.Movimientos.forEach((element1: CuentaGrupo) => {
        if (element1.SubtipoMovimientoId === event.SubtipoMovimientoId) {
          mov_existente = true;
          element1.CuentaCreditoId = event.CuentaCreditoId;
          element1.CuentaDebitoId = event.CuentaDebitoId;
        }
      });
      if (mov_existente !== true) {
        this.Movimientos.push(<CuentaGrupo>event);
      }

    } else {
      this.Movimientos.forEach((element2: CuentaGrupo) => {
        // console.log(element2)
        if (element2.Id === event.Id) {
          element2.CuentaCreditoId = event.CuentaCreditoId;
          element2.CuentaDebitoId = event.CuentaDebitoId;
          mov_existente = true;
        }
      });
      if (mov_existente !== true) {
        this.Movimientos.push(<CuentaGrupo>event);
      }
    }
    if (this.Movimientos.length === this.all_mov) {
      this.all_mov_ok = true;
    }
    // console.log(this.Movimientos);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadCatalogos() {
    this.catalogoElementosService.getCatalogo().subscribe((res) => {
      if (res !== null) {
        // console.log(res);
        const data = <Array<Catalogo>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos)) {
            this.catalogos.push(data[datos]);
          }
        }
        this.cargando_catalogos = false;
      }
    });
  }

  recargarCatalogo() {
    this.eventChange.emit(true);
  }

  onChange(catalogo) {
    this.catalogoId = catalogo;
  }

  QuitarVista() {
    this.uid_1 = undefined;
    this.uid_2 = undefined;
  }
  receiveMessage(event) {
    if (event.TipoNivelId.Id === Nivel_t.Clase) {
    const opt: any = {
      title: this.translate.instant('No hay detalle asociado'),
      text: this.translate.instant('Revisar las caracteristicas del catalogo'),
      type: 'warning',
    };
    this.catalogoElementosService.getSubgrupoById(event.Id).subscribe(
      res => {

          // console.log(event.TipoNivelId.Id);
          if (Object.keys(res[0]).length !== 0) {
            this.catalogoElementosService.getDetalleSubgrupo(event.Id).subscribe(res2 => {
              if (Object.keys(res2[0]).length !== 0) {
                this.Movimientos = [];
                this.depreciacion_ok = res2[0].Depreciacion;
                this.valorizacion_ok = res2[0].Valorizacion;
                this.Total_Movimientos();
                // console.log(this.all_mov);
                this.uid_1 = event;
                this.uid_2 = undefined;
              } else {
                this.Movimientos = [];
                this.depreciacion_ok = false;
                this.valorizacion_ok = false;
                this.Total_Movimientos();
                this.uid_1 = event;
                this.uid_2 = undefined;
                (Swal as any).fire(opt);
              }
            });
          } else {
            this.Movimientos = [];
            this.depreciacion_ok = false;
            this.valorizacion_ok = false;
            this.Total_Movimientos();
            this.uid_1 = undefined;
            this.uid_2 = event;
            (Swal as any).fire(opt);
          }
      });
    // console.log(event);
    } else this.uid_1 = undefined;
  }
  onSubmit() {
    let mov_existente: boolean;
    this.Movimientos.forEach((element3: CuentaGrupo) => {
      // console.log(element3)
      if (element3.Id !== null && element3.Id !== undefined) {
        mov_existente = true;
      }
    });

    if (mov_existente !== true) {
      this.createMovimientos(this.Movimientos);
    } else {
      this.updateMovimientos(this.Movimientos);
    }
  }
  updateMovimientos(subgrupo: any): void {

    const opt: any = {
      title: this.translate.instant('GLOBAL.Actualizar'),
      text: this.translate.instant('GLOBAL.Actualizar_Movimientos_placeholder'),
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          const mov: any = {};
          mov['Cuentas'] = subgrupo;
          // console.log(mov)
          // console.log(this.uid_1.Id);
          this.catalogoElementosService.putTransaccionCuentasSubgrupo(mov, this.uid_1.Id)
            .subscribe(res => {
              // console.log(res);
              this.recargarCatalogo();
              this.Movimientos = [];
              this.showToast(
                'info',
                this.translate.instant('GLOBAL.Actualizado'),
                this.translate.instant('GLOBAL.Actualizado_Movimientos_placeholder'),
              );
              setTimeout(() => {
                this.QuitarVista();
              }, 2000);
            });
        }
      });
  }

  createMovimientos(subgrupo: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.Crear'),
      text: this.translate.instant('GLOBAL.Crear_Movimientos_placeholder'),
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          const mov: any = {};
          mov['Cuentas'] = subgrupo;
          // console.log(mov['Cuentas'])
          this.catalogoElementosService.postTransaccionCuentasSubgrupo(mov)
            .subscribe(res => {
              // console.log(res);
              this.recargarCatalogo();
              this.Movimientos = [];
              this.showToast('info', this.translate.instant('GLOBAL.Creado'), this.translate.instant('GLOBAL.Creado_Movimientos_placeholder'));
              setTimeout(() => {
                this.QuitarVista();
              }, 2000);
            });
        }
      });
  }
  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }
  Bool2Number(bool: boolean, num: number) {
    if (bool === true) {
      return num;
    } else {
      return 0;
    }
  }

  Total_Movimientos() {
    this.all_mov = this.Movimientos_Entradas.length + this.Movimientos_Salidas.length +
      this.Bool2Number(this.valorizacion_ok, this.Movimientos_Valorizacion.length) +
      this.Bool2Number(this.depreciacion_ok, this.Movimientos_Depreciacion.length);
  }
}
