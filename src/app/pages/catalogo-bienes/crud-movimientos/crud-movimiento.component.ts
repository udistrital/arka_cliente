import { Grupo, Subgrupo } from '../../../@core/data/models/catalogo/jerarquia';
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChildren, AfterViewInit, OnChanges } from '@angular/core';
import { FORM_MOVIMIENTO } from './form-movimiento';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { CuentaGrupo, CuentasFormulario } from '../../../@core/data/models/catalogo/cuentas_grupo';
import { CuentasGrupoTransaccion } from '../../../@core/data/models/catalogo/cuentas_subgrupo';
import { Cuenta } from '../../../@core/data/models/catalogo/cuenta_contable';
import { TipoMovimientoKronos } from '../../../@core/data/models/movimientos';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import {
  NbSortDirection,
  NbTreeGridRowComponent,
} from '@nebular/theme';

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
  { arka: 'EAMA', kronos: 'Entrada Anulada' },
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
  deshabilitar: boolean;
  cuentaGlobal: any;


  @Input('trSubgrupoCuentas') transaccion: CuentasGrupoTransaccion;
  @Input('subgrupo_id')
  set name(subgrupo_id: Subgrupo) {
    this.subgrupo_id = subgrupo_id;
    if (this.movimiento_id !== undefined) {
      this.loadCuentaGrupo();
    }
  }

  @Input('movimiento_id')
  set name2(movimiento_id: any) {
    this.movimiento_id = movimiento_id;
  }

  @Input() escritura: boolean;

  @Input('tipo_movimiento')
  set name3(tipo_movimiento: string) {
    this.tipo_movimiento = tipo_movimiento;
  }

  @Input('indice')
  set name4(indice: number) {
    this.indice = indice;
  }
  @Input('cuentaEntradas')
  set name5(cuenta: any) {
    this.cuentaGlobal = cuenta;
  }

  @Output() eventChange = new EventEmitter();
  @Output() formulario = new EventEmitter();
  @Output() setCuentasEntradas = new EventEmitter();

  @Output() columns: any;

  @ViewChildren(NbTreeGridRowComponent, { read: ElementRef }) treeNodes: ElementRef[];

  info_movimiento: CuentasFormulario;
  formMovimiento: any;
  regMovimiento: any;
  clean: boolean;
  cargando: boolean = true;
  init: boolean;

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
  ) {
    this.escritura = false;
  }

  ngOnInit() {
    this.init = true;
  //  console.log("entra al init 1")
    this.listService.findPlanCuentasDebito();
    this.listService.findPlanCuentasCredito();
  //  console.log("entra al init")
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
      this.loadLists();
    });
  }

  ngOnChanges() {
    if (!this.init) {
      this.construirForm();
      this.loadLists();
      this.loadCuentaGrupo();
    } else if (this.cuentaGlobal) {
      const cuentaAsociada = new CuentasFormulario();
      const cuenta = new Cuenta;
      cuenta.Id = this.cuentaGlobal.substring(0, this.cuentaGlobal.indexOf(' '));
      if (this.movimiento_id.Acronimo === 'e_arka') {
       cuentaAsociada.CuentaDebitoId = cuenta;
       this.info_movimiento = cuentaAsociada;
      } else if (this.movimiento_id.Acronimo === 's_arka') {
        cuentaAsociada.CuentaCreditoId = cuenta;
        this.info_movimiento = cuentaAsociada;
      }
    }
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
        let arreglo;
        const arreglo2 = new Array();
        const arreglo3 = new Array();
        arreglo = list.listPlanCuentasCredito[0];
        arreglo.forEach((elemento) => {
           const found = arreglo.find(element => elemento.Codigo !== element.Codigo && element.Codigo.indexOf(elemento.Codigo) === 0);
           if (!found) {
              arreglo2.push(elemento);
           }
        });
      //  console.log("El resultado final", arreglo2)
        const a = arreglo2.map(x => ({Codigo: x.Codigo + ' ' + x.Nombre,
        Nombre: x.Nombre, DetalleCuentaID: x.DetalleCuentaID, Naturaleza: x.Naturaleza}));
        let arreglo1;
        arreglo1 = list.listPlanCuentasDebito[0];
        arreglo1.forEach((elemento) => {
           const found = arreglo1.find(element => elemento.Codigo !== element.Codigo &&
            element.Codigo.indexOf(elemento.Codigo) === 0);
           if (!found) {
              arreglo3.push(elemento);
           }
        });
        const b = arreglo3.map(x => ({Codigo: x.Codigo + ' ' + x.Nombre,
        Nombre: x.Nombre, DetalleCuentaID: x.DetalleCuentaID, Naturaleza: x.Naturaleza}));
          this.formMovimiento.campos[this.getIndexForm('CuentaDebitoId')].opciones = b;
          this.formMovimiento.campos[this.getIndexForm('CuentaCreditoId')].opciones = a;
          if (this.formMovimiento.titulo === 'Salida')
            this.formMovimiento.campos[this.getIndexForm('CuentaCreditoId')].opciones = b;
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
    const form = this.clone(FORM_MOVIMIENTO);
    if (this.escritura) {
      form.campos = form.campos.map(campo => {
        campo.deshabilitar = false;
        return campo;
      });
    }
    this.formMovimiento = form;
    this.deshabilitar = !this.escritura;

    if (this.movimiento_id !== undefined) {
      // this.formulario.normalform = {...this.formulario.normalform, ...{ titulo: this.translate.instant('GLOBAL.' + this.movimiento_id)}} ;
      this.formMovimiento.titulo = this.translate.instant('GLOBAL.' + this.codigo_movimiento_i18n(this.movimiento_id));
      // this.formMovimiento.btn = this.translate.instant('GLOBAL.guardar');
      for (let i = 0; i < this.formMovimiento.campos.length; i++) {
        this.formMovimiento.campos[i].label = this.translate.instant('GLOBAL.' + this.formMovimiento.campos[i].label_i18n);
        this.formMovimiento.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formMovimiento.campos[i].label_i18n);
        this.formMovimiento.campos[i].deshabilitar = this.deshabilitar || ( this.tipo_movimiento === 'GLOBAL.Salidas' && i === 1);
/*        this.formMovimiento.campos[i].requerido = !(this.tipo_movimiento === 'GLOBAL.Entradas' && i === 0 &&
          this.indice !== 0 || this.tipo_movimiento === 'GLOBAL.Salidas' && i === 1);*/
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
      this.cargando = true;


      this.catalogoElementosService.getMovimiento(this.subgrupo_id.Id, this.movimiento_id.Id)
        .subscribe(res => {
       //   console.log("La respuesta ",res)
          if (Object.keys(res[0]).length !== 0) {
//            console.log("entra 1")
            const cuentasAsociadas = new CuentasFormulario();
            this.respuesta = <CuentaGrupo>res[0];
            const cuentaCredito = new Cuenta();
            const cuentaDebito = new Cuenta();
            cuentaCredito.Id = this.respuesta.CuentaCreditoId;
            cuentaDebito.Id = this.respuesta.CuentaDebitoId;
            cuentasAsociadas.CuentaCreditoId = cuentaCredito;
            cuentasAsociadas.CuentaDebitoId = cuentaDebito;
            this.info_movimiento = cuentasAsociadas;
            this.formulario.emit(this.respuesta);

          } else {
            const cuentasAsociadas = new CuentasFormulario();
            const cuentaCredito = new Cuenta();
            const cuentaDebito = new Cuenta();
            cuentaCredito.Id = null;
            cuentaDebito.Id = null;
            cuentasAsociadas.CuentaCreditoId = cuentaCredito;
            cuentasAsociadas.CuentaDebitoId = cuentaDebito;
            this.info_movimiento = cuentasAsociadas;
            this.respuesta = undefined;
            this.respuesta2 = {};
            this.respuesta2.SubgrupoId = this.subgrupo_id;
            this.respuesta2.CuentaCreditoId = null;
            this.respuesta2.CuentaDebitoId = null;
            this.respuesta2.SubtipoMovimientoId = this.movimiento_id.Id;
            this.respuesta2.Tipo_Texto = this.tipo_movimiento;
            this.respuesta2.orden = this.indice;
          //  console.log("entra 2", this.respuesta2)
            this.formulario.emit(this.respuesta2);
          }
          this.cargando = false;
        });
    } else {
         //   console.log("entra 3")
      const cuentasAsociadas = new CuentasFormulario();
      const cuentaCredito = new Cuenta();
      const cuentaDebito = new Cuenta();
      cuentaCredito.Id = null;
      cuentaDebito.Id = null;
      cuentasAsociadas.CuentaCreditoId = cuentaCredito;
      cuentasAsociadas.CuentaDebitoId = cuentaDebito;
      this.info_movimiento = cuentasAsociadas;
//      this.clean = !this.clean;
      this.cargando = false;
    }
  }

  validarForm(event) {
    if (event.CuentaDebitoId) {
      this.movimiento_id.Acronimo === 'e_arka' ? this.setCuentasEntradas.emit(event) : null;
    } else {
      let vdebito = event.data.CuentasFormulario.CuentaDebitoId;
      let vcredito = event.data.CuentasFormulario.CuentaCreditoId;
      if (vdebito !== undefined && vdebito !== '') {
         vdebito = vdebito.substring(0, vdebito.indexOf(' '));
      }
      if (vcredito !== undefined && vcredito !== '') {
         vcredito = vcredito.substring(0, vcredito.indexOf(' '));
      }
      if (event.valid && vcredito && vdebito) {
        if (this.respuesta !== undefined) {
          this.respuesta.CuentaCreditoId = vcredito;
          this.respuesta.CuentaDebitoId = vdebito;
          this.respuesta.Tipo_Texto = this.tipo_movimiento;
          this.respuesta.orden = this.indice;
          this.formulario.emit(this.respuesta);
        } else {
          vdebito.Codigo = vdebito;
          vcredito.Codigo = vcredito;
          this.respuesta2 = {};
          this.respuesta2.SubgrupoId = this.subgrupo_id;
          this.respuesta2.CuentaCreditoId = vcredito;
          this.respuesta2.CuentaDebitoId = vdebito;
          this.respuesta2.SubtipoMovimientoId = this.movimiento_id.Id;
          this.respuesta2.Tipo_Texto = this.tipo_movimiento;
          this.respuesta2.orden = this.indice;
          this.formulario.emit(this.respuesta2);
        }
      }
    }

  }
}
