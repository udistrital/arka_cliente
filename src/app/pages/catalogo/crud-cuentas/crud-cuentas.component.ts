import { Component, OnInit } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { Parametro } from '../../../@core/data/models/configuracion_crud';
import Swal from 'sweetalert2';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-crud-cuentas',
  templateUrl: './crud-cuentas.component.html',
  styleUrls: ['./crud-cuentas.component.scss'],
})
export class CrudCuentasComponent implements OnInit {
  catalogos: Array<Catalogo>;
  catalogoId: number;
  uid_1: Subgrupo;
  infoCuentas: any[];

  cargando: boolean;
  valid: boolean;
  estado_cargado: boolean;
  cuentasNuevas: any[];
  cuentasPendientes: any[];
  puede_editar: boolean;
  texto_sesion_contable: string;
  texto_estado: string;
  modificando_cuentas: boolean;
  claseOk: boolean;

  private estadoAsignacionContable: Parametro;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private confService: ConfiguracionService,
    private pUpManager: PopUpManager,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.cargando = true;
    this.puede_editar = false;
    this.modificando_cuentas = false;
    this.catalogos = new Array<Catalogo>();
    this.catalogoId = 0;
    this.texto_sesion_contable = '';
    this.texto_estado = '';
  }

  ngOnInit() {
    this.loadCatalogos();
    this.cargaPermisoEdicionCuentas();
    this.cargaEstadoSesionContable();
  }

  private cargaPermisoEdicionCuentas() {
    this.puede_editar = !!this.confService.getAccion('puedeAsignarCuentas');
  }

  private cargaEstadoSesionContable() {
    if (this.estado_cargado === undefined) {
      this.estado_cargado = false;
      this.confService.getParametro('modificandoCuentas').subscribe((p: Parametro) => {
        this.refrescaEstadoSesionContable(p);
      });
    }
  }
  private refrescaEstadoSesionContable(p: Parametro) {
    this.estadoAsignacionContable = p;
    this.modificando_cuentas = p.Valor === 'true';
    this.texto_sesion_contable = this.translate.instant('GLOBAL.cuentas.' + (this.modificando_cuentas ? 'terminar' : 'iniciar') + '_edicion_boton');
    this.texto_estado = this.translate.instant('GLOBAL.cuentas.estado_' + (this.modificando_cuentas ? 'modificando' : 'lectura'));
    this.estado_cargado = true;
  }

  preguntaSesionAsignacionContable() {
    const cambioModo = this.modificando_cuentas ? 'terminar' : 'iniciar';
    const title = this.translate.instant('GLOBAL.cuentas.' + cambioModo + '_edicion_titulo');
    const text = this.translate.instant('GLOBAL.cuentas.' + cambioModo + '_edicion_texto');
    const type = 'warning';
    (Swal as any).fire({ title, text, type, showCancelButton: true }).then(res => {
      if (res.value) {
        if (this.modificando_cuentas) {
          this.estadoAsignacionContable.Valor = 'false';
        } else {
          this.estadoAsignacionContable.Valor = 'true';
        }
        this.estado_cargado = false;
        this.confService.setParametro(this.estadoAsignacionContable).subscribe(res2 => {
          this.refrescaEstadoSesionContable(<Parametro><any>res2);
          this.estado_cargado = true;
          (Swal as any).fire({
            title: this.translate.instant('GLOBAL.Actualizado'),
            html: this.estadoAsignacionContable.Valor === 'true' ?
              this.translate.instant('GLOBAL.cuentas.iniciar_edicion_aviso') :
              this.translate.instant('GLOBAL.cuentas.terminar_edicion_aviso'),
            timer: 2000,
            timerProgressBar: true,
          }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
            }
          });
        });
      }
    });
  }

  loadCatalogos() {
    this.catalogoElementosService.getCatalogo().subscribe((res) => {
      if (res !== null) {
        const data = <Array<Catalogo>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos)) {
            this.catalogos.push(data[datos]);
          }
        }
        this.cargando = false;
      }
    });
  }

  public onChange(catalogo: any = null) {
    if (catalogo) {
      this.catalogoId = catalogo;
    }
    this.claseOk = false;
    this.uid_1 = undefined;
    this.infoCuentas = undefined;
    this.cuentasNuevas = undefined;
    this.cuentasPendientes = undefined;
  }

  receiveMessage(event) {
    if (event.TipoNivelId.Id === Nivel_t.Clase) {
      if (this.uid_1 === undefined || this.uid_1.Id !== event.Id) {
        this.uid_1 = event;
        this.cargando = true;
        this.catalogoElementosService.getCuentasContables(event.Id).subscribe(res => {
          this.cargando = false;
          if (res.length) {
            this.infoCuentas = res;
            this.cuentasNuevas = [];
            this.cuentasPendientes = [];
            this.claseOk = true;
          } else {
            this.claseOk = false;
            const opt = {
              title: this.translate.instant('GLOBAL.catalogo.errorDetalleTtl'),
              text: this.translate.instant('GLOBAL.catalogo.errorDetalleTxt'),
              type: 'warning',
            };
            this.pUpManager.showAlertWithOptions(opt);
          }
        });
      }
    } else {
      this.onChange();
    }
  }

  public onSubmit() {
    if (this.cuentasPendientes.length) {
      this.updateMovimientos();
    }
  }

  private updateMovimientos(): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.Actualizar'),
      text: this.translate.instant('GLOBAL.Actualizar_Movimientos_placeholder'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };

    this.pUpManager.showAlertWithOptions(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.cargando = true;
          this.catalogoElementosService.putTransaccionCuentasSubgrupo(this.cuentasPendientes, this.uid_1.Id)
            .subscribe((res: any) => {
              if (res.length) {
                this.cargando = false;
                this.cuentasNuevas = res;
                const opt_: any = {
                  title: this.translate.instant('GLOBAL.Actualizado'),
                  text: this.translate.instant('GLOBAL.Actualizado_Movimientos_placeholder'),
                  type: 'success',
                };
                this.pUpManager.showAlertWithOptions(opt_);
              }
            });
        }
      });
  }

  public setValidness(event) {
    this.valid = event;
  }

  public setPendientes(event) {
    this.cuentasPendientes = event;
  }

}

