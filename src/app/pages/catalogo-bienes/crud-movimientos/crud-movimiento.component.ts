import { Grupo, Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChildren, AfterViewInit, OnChanges } from '@angular/core';
import { FORM_MOVIMIENTO } from './form-movimiento';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { UserService } from '../../../@core/data/users.service';
import { CuentaGrupo, CuentasFormulario } from '../../../@core/data/models/catalogo/cuentas_grupo';
import { Cuenta } from '../../../@core/data/models/catalogo/cuenta_contable';
import { TipoMovimientoKronos } from '../../../@core/data/models/movimientos';
import { RolUsuario_t as Rol } from '../../../@core/data/models/roles/rol_usuario';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import {
    NbSortDirection,
    NbTreeGridRowComponent,
  } from '@nebular/theme';
import { GlobalPositionStrategy } from '@angular/cdk/overlay';

/**
 * Mapeo entre:
 *
 * movimientos_arka / formato_tipo_movimiento / campo "CodigoAbreviacion"
 * movimientos (_kronos) / tipo_movimiento / campo "Nombre", con Acronimo:e_arka
 */
const MOVIMIENTOS_KRONOS_ARKA = [
  { arka: 'EA', kronos: 'Adquisición' },
  { arka: 'EBEMP', kronos: 'Provisional' },
  { arka: 'ECE', kronos: 'Compras extranjeras' },
  { arka: 'ECM', kronos: 'Caja menor' },
  { arka: 'ED', kronos: 'Donación' },
  { arka: 'EEP', kronos: 'Elaboración Propia' },
  { arka: 'EIA', kronos: 'Intangibles' },
  { arka: 'EID', kronos: 'Desarrollo interior' },
  { arka: 'EPPA', kronos: 'Aprovechamientos' },
  { arka: 'EPR', kronos: 'Reposición' },
  { arka: 'ESI', kronos: 'Sobrante' },
  { arka: 'ET', kronos: 'Terceros' },
  { arka: 'SOL_BAJA', kronos: 'Baja' },
  { arka: 'SOL_TRD', kronos: 'Traslado' },
  // { arka: '', kronos: '' }, // PLANTILLA
];
@Component({
  selector: 'ngx-crud-movimiento',
  templateUrl: './crud-movimiento.component.html',
  styleUrls: ['./crud-movimiento.component.scss'],
})
export class CrudMovimientoComponent implements OnInit, OnChanges {

  config: ToasterConfig;
  subgrupo_id: Subgrupo;
  movimiento_id: any;
  respuesta: CuentaGrupo;
  Subgrupo: Subgrupo;
  respuesta2: any;
  tipo_movimiento: string;
  indice: number;

  @Input('subgrupo_id')
  set name(subgrupo_id: Subgrupo) {
    this.subgrupo_id = subgrupo_id;
    // console.log(this.subgrupo_id);
    if (this.movimiento_id !== undefined) {
      this.loadCuentaGrupo();
    }
  }

  @Input('movimiento_id')
  set name2(movimiento_id: any) {
    this.movimiento_id = movimiento_id;
  }





  @Input('tipo_movimiento')
  set name3(tipo_movimiento: string) {
    this.tipo_movimiento = tipo_movimiento;
  }

  @Input('indice')
  set name4(indice: number) {
    this.indice = indice;
  }

  @Output() eventChange = new EventEmitter();
  @Output() formulario = new EventEmitter();

  @Output() columns: any;

  @ViewChildren(NbTreeGridRowComponent, { read: ElementRef }) treeNodes: ElementRef[];

  info_movimiento: CuentasFormulario;
  formMovimiento: any;
  regMovimiento: any;
  clean: boolean;
  cargando: boolean = true;

  stateHighlight: string = 'initial';
  animationCuenta: string;
  searchValue: string;
  sortDirection: NbSortDirection = NbSortDirection.NONE;
  private data: [];

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private userService: UserService,
  ) {
    const form = this.clone(FORM_MOVIMIENTO);
    if (this.userService.tieneAlgunRol([Rol.AdminContable])) {
      form.campos = form.campos.map(campo => {
        campo.deshabilitar = false;
        return campo;
      });
    }
    this.formMovimiento = form;
    this.listService.findPlanCuentasDebito();
    this.listService.findPlanCuentasCredito();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
      this.loadLists();
    });
  }

  ngOnInit() {

  }

  ngOnChanges() {
    this.construirForm();
    this.loadLists();
    this.loadCuentaGrupo();
  }

  clone(Obj) {
    let buf; // the cloned object
    if (Obj instanceof Array) {
      buf = []; // create an empty array
      let i = Obj.length;
      while (i--) {
        buf[i] = this.clone(Obj[i]); // recursively clone the elements
      }
      return buf;
    } else if (Obj instanceof Object) {
      buf = {}; // create an empty object
      for (const k in Obj) {
        if (Obj.hasOwnProperty(k)) { // filter out another array's index
          buf[k] = this.clone(Obj[k]); // recursively clone the value
        }
      }
      return buf;
    } else {
      return Obj;
    }
  }

  public loadLists() {
    this.store.select((stte) => stte).subscribe(
      (list) => {
        if (list.listPlanCuentasCredito !== undefined || list.listPlanCuentasDebito !== undefined) {
          this.formMovimiento.campos[this.getIndexForm('CuentaDebitoId')].opciones = list.listPlanCuentasDebito[0];
          this.formMovimiento.campos[this.getIndexForm('CuentaCreditoId')].opciones = list.listPlanCuentasCredito[0];
          if (this.formMovimiento.titulo === 'Salida')
             this.formMovimiento.campos[this.getIndexForm('CuentaCreditoId')].opciones = list.listPlanCuentasDebito[0];
          // console.log(list.listPlanCuentasCredito[0]);
        }
      },
    );
  }

  private codigo_movimiento_i18n(mov: TipoMovimientoKronos): string {
        if (MOVIMIENTOS_KRONOS_ARKA.some(m => mov.Nombre === m.kronos)) {
        return 'movimientos.tipo.' + MOVIMIENTOS_KRONOS_ARKA.find(m => mov.Nombre === m.kronos).arka + '.nombre';
        }
        return mov.Nombre;
  }

  construirForm() {
    if (this.movimiento_id !== undefined) {
      // this.formulario.normalform = {...this.formulario.normalform, ...{ titulo: this.translate.instant('GLOBAL.' + this.movimiento_id)}} ;
      this.formMovimiento.titulo = this.translate.instant('GLOBAL.' + this.codigo_movimiento_i18n(this.movimiento_id));
      // this.formMovimiento.btn = this.translate.instant('GLOBAL.guardar');
      for (let i = 0; i < this.formMovimiento.campos.length; i++) {
        this.formMovimiento.campos[i].label = this.translate.instant('GLOBAL.' + this.formMovimiento.campos[i].label_i18n);
        this.formMovimiento.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formMovimiento.campos[i].label_i18n);
        this.formMovimiento.campos[i].deshabilitar = (this.tipo_movimiento === 'GLOBAL.Entradas' && i === 0 &&
                        this.indice !== 0 || this.tipo_movimiento === 'GLOBAL.Salidas' && i === 1);
        this.formMovimiento.campos[i].requerido = !(this.tipo_movimiento === 'GLOBAL.Entradas' && i === 0 &&
                        this.indice !== 0 || this.tipo_movimiento === 'GLOBAL.Salidas' && i === 1);
      }
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formMovimiento.campos.length; index++) {
      const element = this.formMovimiento.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }
  public loadCuentaGrupo(): void {
    if (this.subgrupo_id.Id !== undefined && this.subgrupo_id.Id !== 0) {
      // console.log(this.movimiento_id);
      this.cargando = true;
      this.catalogoElementosService.getMovimiento(this.subgrupo_id.Id, this.movimiento_id.Id)
        .subscribe(res => {
          // console.log(res);
          if (Object.keys(res[0]).length !== 0) {
            const cuentasAsociadas = new CuentasFormulario();
            this.respuesta = <CuentaGrupo>res[0];
            const cuentaCredito = new Cuenta();
            const cuentaDebito = new Cuenta();
            cuentaCredito.Id = this.respuesta.CuentaCreditoId;
            cuentaDebito.Id = this.respuesta.CuentaDebitoId;
            cuentasAsociadas.CuentaCreditoId = cuentaCredito;
            cuentasAsociadas.CuentaDebitoId = cuentaDebito;
            this.info_movimiento = cuentasAsociadas;
          } else {
            const cuentasAsociadas = new CuentasFormulario();
            const cuentaCredito = new Cuenta();
            const cuentaDebito = new Cuenta();
            cuentaCredito.Id = null;
            cuentaDebito.Id = null;
            cuentasAsociadas.CuentaCreditoId = cuentaCredito;
            cuentasAsociadas.CuentaDebitoId = cuentaDebito;
            this.info_movimiento = cuentasAsociadas;
            // console.log(this.info_movimiento);
            this.clean = !this.clean;
            this.respuesta = undefined;
          }
          this.cargando = false;
          // console.log(this.respuesta)
          // console.log(res[0]);
        });
    } else {
      const cuentasAsociadas = new CuentasFormulario();
      const cuentaCredito = new Cuenta();
      const cuentaDebito = new Cuenta();
      cuentaCredito.Id = null;
      cuentaDebito.Id = null;
      cuentasAsociadas.CuentaCreditoId = cuentaCredito;
      cuentasAsociadas.CuentaDebitoId = cuentaDebito;
      this.info_movimiento = cuentasAsociadas;
      this.clean = !this.clean;
      this.cargando = false;
    }
  }

  validarForm(event) {
    if (event.valid) {
      if (this.respuesta !== undefined) {
        const cuentaDebito = event.data.CuentasFormulario.CuentaDebitoId;
        const cuentaCredito = event.data.CuentasFormulario.CuentaCreditoId;
        this.respuesta.CuentaCreditoId = cuentaCredito.Codigo;
        this.respuesta.CuentaDebitoId = cuentaDebito.Codigo;
        this.respuesta.Tipo_Texto = this.tipo_movimiento;
        this.respuesta.orden = this.indice;
        this.formulario.emit(this.respuesta);
      } else {
        const cuentaDebito = event.data.CuentasFormulario.CuentaDebitoId;
        const cuentaCredito = event.data.CuentasFormulario.CuentaCreditoId;
        this.respuesta2 = {};
        this.respuesta2.SubgrupoId = this.subgrupo_id;
        this.respuesta2.CuentaCreditoId = cuentaCredito.Codigo;
        this.respuesta2.CuentaDebitoId = cuentaDebito.Codigo;
        this.respuesta2.SubtipoMovimientoId = this.movimiento_id.Id;
        this.respuesta.Tipo_Texto = this.tipo_movimiento;
        this.respuesta.orden = this.indice;
        this.formulario.emit(this.respuesta2);
      }
    }

  }
}
