import { Component, OnInit, Input, Output, EventEmitter, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { UserService } from '../../../@core/data/users.service';
import { Grupo, Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Nivel_t } from '../../../@core/data/models/catalogo/tipo_nivel';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { TipoMovimientoKronos } from '../../../@core/data/models/movimientos';
import { Parametro } from '../../../@core/data/models/configuracion_crud';
import { BaseId } from '../../../@core/data/models/base';
import { RolUsuario_t as Rol } from '../../../@core/data/models/roles/rol_usuario';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { ListService } from '../../../@core/store/services/list.service';
import { CrudMovimientoComponent } from '../crud-movimientos/crud-movimiento.component';
import { FormControl } from '@angular/forms';
import { CuentasFormulario, CuentaGrupo } from '../../../@core/data/models/catalogo/cuentas_grupo';
import { CuentasGrupoTransaccion } from '../../../@core/data/models/catalogo/cuentas_subgrupo';
import { element } from '@angular/core/src/render3';
import { ToasterConfig, Toast, BodyOutputType, ToasterService } from 'angular2-toaster';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

class TiposMovimiento {
  tipo: string;
  data: TipoMovimientoKronos[];
  i18n: string;
  mostrar: () => boolean;
}

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
  cuentaCreditoIdEntradas: String;
  cuentaDebitoIdEntradas: String;
  movOk: boolean = true;
  catalogos: Array<Catalogo>;
  catalogoId: number;
  subgrupoHijo: Subgrupo;
  uid_1: Subgrupo;
  ModificarGrupo: boolean;
  Movimiento: number;
  TiposMovimientos: TiposMovimiento[] = [];
  selected = new FormControl(0);
  Movimientos: any[];
  config: ToasterConfig;
  all_mov: number;
  all_mov_ok: boolean;
  depreciacion_ok: boolean;
  valorizacion_ok: boolean;

  cargando_catalogos: boolean;
  estado_cargado: boolean;
  guardando: boolean = false;
  puede_editar: boolean;
  texto_sesion_contable: string;
  texto_estado: string;
  modificando_cuentas: boolean;

  private estadoAsignacionContable: Parametro;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private store: Store<IAppState>,
    private confService: ConfiguracionService,
    private listService: ListService,
    private toasterService: ToasterService,
  ) {
    this.cargando_catalogos = true;
    this.puede_editar = false;
    this.modificando_cuentas = false;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.catalogos = new Array<Catalogo>();
    this.catalogoId = 0;
    this.Movimientos = [];
    this.texto_sesion_contable = '';
    this.texto_estado = '';
  }

  ngOnInit() {
  //  console.log("Inicio")
    this.loadCatalogos();
    this.listService.findPlanCuentasDebito();
    this.listService.findPlanCuentasCredito();
    this.cargaMovimientos();
    this.cargaPermisoEdicionCuentas();
    this.cargaEstadoSesionContable();
  }

  private cargaMovimientos() {
  //  console.log("carga movimientos")
    const movimientos = [
      { buscar: 'Entrada', i18n: 'GLOBAL.Entradas', mostrar: () => true },
      { buscar: 'Salida', i18n: 'GLOBAL.Salidas', mostrar: () => true },
      { buscar: 'Depreciacion', i18n: 'GLOBAL.Depreciacion', mostrar: () => this.depreciacion_ok },
      { buscar: 'Valorizacion', i18n: 'GLOBAL.Valorizacion', mostrar: () => this.valorizacion_ok },
      { buscar: 'Baja', i18n: 'GLOBAL.movimientos.tipo.SOL_BAJA.nombre', mostrar: () => true },
      { buscar: 'Traslado', i18n: 'GLOBAL.movimientos.tipo.SOL_TRD.nombre', mostrar: () => true },
    ];

    this.catalogoElementosService.getTiposMovimientoKronos().subscribe((res: TipoMovimientoKronos[]) => {
      const desglose = res.reduce((acc: TiposMovimiento[], val): TiposMovimiento[] => {
        const tipo = movimientos.find(mov => val.Descripcion.indexOf(mov.buscar) !== -1);
        const criterio = (t: TiposMovimiento) => tipo && (t.tipo === tipo.buscar);
        if (acc.some(criterio)) {
          acc.find(criterio).data.push(val);
        } else {
          if (tipo) {
            acc.push({ tipo: tipo.buscar, data: [val], i18n: tipo.i18n, mostrar: tipo.mostrar });
          }
        }
        return acc;
      }, <TiposMovimiento[]>[]);

      this.TiposMovimientos = movimientos.map(mov => desglose.find(d => d.tipo === mov.buscar));
//      console.log("Entra aca")
      this.all_mov = res.length - 1;
    });
  }

  private cargaPermisoEdicionCuentas() {
    const accion = this.confService.getAccion('puedeAsignarCuentas');
    this.puede_editar = accion ? true : false;
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
        });
      }
    });
  }

  // Se ve si ya tiene cuentas asignadas para mostrarlas en el formulario
  ver3(event) {
  //  console.log("llega", this.Movimientos)
    this.movOk = true;
    let mov_existente: boolean;
    if (event.Id === undefined) {
    //  console.log("Indefinido")
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
    this.all_mov_ok = false;
    this.Movimientos.forEach(elemento => {
       if (elemento.CuentaCreditoId === undefined || elemento.CuentaCreditoId === null ||
           elemento.CuentaDebitoId === undefined || elemento.CuentaDebitoId === null) {
           switch (elemento.Tipo_Texto) {
            case 'GLOBAL.Salidas':
                if (elemento.CuentaDebitoId === undefined || elemento.CuentaDebitoId === null)  {
                this.movOk = false;
                }
                break;
            case 'GLOBAL.Entradas':
                if (elemento.CuentaCreditoId === undefined || elemento.CuentaCreditoId === null)  {
                this.movOk = false;
                }
                break;
            default:
                this.movOk = false;
                break;
           }


       }
    });

    if (this.movOk && this.Movimientos.length === this.all_mov) {
      this.all_mov_ok = true;
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
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
        this.cargando_catalogos = false;
      }
    });
  }

  recargarCatalogo() {
    this.eventChange.emit(true);
  }

  onChange(catalogo) {
    this.uid_1 = undefined;
    this.catalogoId = catalogo;
  }

  QuitarVista() {
    this.uid_1 = undefined;
  }
  receiveMessage(event) {

    if (event.TipoNivelId.Id === Nivel_t.Clase) {
      if (this.uid_1 === undefined || this.uid_1.Id !== event.Id) {
        this.uid_1 = event;
        const opt: any = {
          title: this.translate.instant('No hay detalle asociado'),
          text: this.translate.instant('Revisar las caracteristicas del catalogo'),
          type: 'warning',
        };
        this.catalogoElementosService.getDetalleSubgrupo(event.Id).subscribe(res2 => {
        //  console.log("entra al getDetalleSubgrupo")
          if (Object.keys(res2[0]).length !== 0) {
            this.Movimientos = [];
            this.depreciacion_ok = res2[0].Depreciacion;
            this.valorizacion_ok = res2[0].Valorizacion;
            this.Total_Movimientos();
          } else {
            this.Movimientos = [];
            this.depreciacion_ok = false;
            this.valorizacion_ok = false;
            this.Total_Movimientos();
            (Swal as any).fire(opt);
          }
        });
      }
    } else this.uid_1 = undefined;
  }

  onSubmit() {

//  console.log("Submit");


    const movimiento = this.Movimientos.filter(elemento => elemento.orden === 0 && elemento.Tipo_Texto === 'GLOBAL.Entradas');
    if (movimiento.length === 1) {

      const cuentadebito = movimiento[0].CuentaDebitoId;
      this.Movimientos.forEach(elemento => {
        if (elemento.Tipo_Texto === 'GLOBAL.Entradas')
          elemento.CuentaDebitoId = cuentadebito;
        if (elemento.Tipo_Texto === 'GLOBAL.Salidas') {
          elemento.CuentaCreditoId = cuentadebito;
        }
      });

    }
    this.updateMovimientos(this.Movimientos);
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
          this.guardando = true;
          const mov = {
            Cuentas: subgrupo.map((cuenta: CuentaGrupo) => {
              const subgrupo_id: BaseId = { Id: cuenta.SubgrupoId.Id };
              cuenta.SubgrupoId = subgrupo_id;
              cuenta.FechaCreacion = undefined;
              cuenta.FechaModificacion = undefined;
              return cuenta;
            }),
          };
          this.catalogoElementosService.putTransaccionCuentasSubgrupo(mov, this.uid_1.Id)
            .subscribe(res => {
              this.recargarCatalogo();
              this.Movimientos = [];
              this.showToast(
                'info',
                this.translate.instant('GLOBAL.Actualizado'),
                this.translate.instant('GLOBAL.Actualizado_Movimientos_placeholder'),
              );
              setTimeout(() => {
                this.QuitarVista();
                this.guardando = false;
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
    this.all_mov = this.TiposMovimientos
      .reduce((acc: number, tipoMov: TiposMovimiento) => acc + (tipoMov.mostrar() ? tipoMov.data.length : 0), 0);
  }
}
