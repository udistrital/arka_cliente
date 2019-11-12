import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { Grupo, GrupoTransaccion } from '../../../@core/data/models/catalogo/grupo';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { FORM_MOVIMIENTO } from './form-movimiento';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { CuentaGrupo, CuentasFormulario } from '../../../@core/data/models/catalogo/cuentas_grupo';
import { Cuenta } from '../../../@core/data/models/catalogo/cuenta_contable';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { Subgrupo } from '../../../@core/data/models/catalogo/subgrupo';
import { DinamicformComponent } from '../../../@theme/components';


@Component({
  selector: 'ngx-crud-movimiento',
  templateUrl: './crud-movimiento.component.html',
  styleUrls: ['./crud-movimiento.component.scss'],
})

export class CrudMovimientoComponent implements OnInit, OnChanges {

  config: ToasterConfig;
  subgrupo_id: Subgrupo;
  movimiento_id: number;
  respuesta: CuentaGrupo;
  Subgrupo: Subgrupo;


  @Input('subgrupo_id')
  set name(subgrupo_id: Subgrupo) {
    this.subgrupo_id = subgrupo_id;
    if (this.movimiento_id !== undefined) {
      this.loadCuentaGrupo();
    }
  }

  @Input('movimiento_id')
  set name2(movimiento_id: number) {
    this.movimiento_id = movimiento_id;
  }

  @Output() eventChange = new EventEmitter();

  info_movimiento: CuentasFormulario;
  formMovimiento: any;
  regMovimiento: any;
  clean: boolean;

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
    private store: Store<IAppState>,
    private listService: ListService,
  ) {
    const form = this.clone(FORM_MOVIMIENTO);
    this.formMovimiento = form;
    this.listService.findPlanCuentasDebito();
    this.listService.findPlanCuentasCredito();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.construirForm();
    this.loadLists();
    this.loadCuentaGrupo();
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
      while (i --) {
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
    this.store.select((state) => state).subscribe(
      (list) => {
        if (list.listPlanCuentasCredito !== undefined || list.listPlanCuentasDebito !== undefined) {
          this.formMovimiento.campos[this.getIndexForm('CuentaDebitoId')].opciones = list.listPlanCuentasDebito[0];
          this.formMovimiento.campos[this.getIndexForm('CuentaCreditoId')].opciones = list.listPlanCuentasCredito[0];
        }
      },
    );
  }

  construirForm() {
    if (this.movimiento_id !== undefined) {

      // this.formulario.normalform = {...this.formulario.normalform, ...{ titulo: this.translate.instant('GLOBAL.' + this.movimiento_id)}} ;
      this.formMovimiento.titulo = this.translate.instant('GLOBAL.' + this.movimiento_id);
      // this.formMovimiento.btn = this.translate.instant('GLOBAL.guardar');
      for (let i = 0; i < this.formMovimiento.campos.length; i++) {
        this.formMovimiento.campos[i].label = this.translate.instant('GLOBAL.' + this.formMovimiento.campos[i].label_i18n);
        this.formMovimiento.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formMovimiento.campos[i].label_i18n);
      }
    }


  }

  useLanguage(language: string) {
    this.translate.use(language);
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
      this.catalogoElementosService.getMovimiento(this.subgrupo_id.Id, this.movimiento_id)
        .subscribe(res => {
          // console.log(res[0].CuentaCreditoId);
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
            // console.log(this.info_movimiento);
          } else {
            this.info_movimiento = undefined;
            this.clean = !this.clean;
          }
        });
    } else {
      this.info_movimiento = undefined;
      this.clean = !this.clean;
    }
  }

  updateGrupo(grupo: any): void {

    const opt: any = {
      title: 'Update?',
      text: 'Update Grupo!',
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          // console.log(grupo);
          const Cuentas = <CuentasFormulario>grupo;
          this.respuesta.CuentaCreditoId = Cuentas.CuentaCreditoId.Id;
          this.respuesta.CuentaDebitoId = Cuentas.CuentaDebitoId.Id;
          this.catalogoElementosService.putMovimiento(this.respuesta, this.respuesta.Id)
            .subscribe(res => {
              this.loadCuentaGrupo();
              this.eventChange.emit(true);
              this.showToast('info', 'updated', 'Grupo updated');
            });
        }
      });
  }

  createGrupo(grupo: any): void {
    const opt: any = {
      title: 'Create?',
      text: 'Create Grupo!',
      type: 'warning',
      showCancelButton: true,
    };
    (Swal as any).fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          // console.log(grupo);
          const Cuentas = <CuentasFormulario>grupo;
          const Movimiento = new CuentaGrupo();
          Movimiento.CuentaCreditoId = Cuentas.CuentaCreditoId.Id;
          Movimiento.CuentaDebitoId = Cuentas.CuentaDebitoId.Id;
          Movimiento.Activo = true;
          Movimiento.SubgrupoId = this.subgrupo_id;
          Movimiento.SubtipoMovimientoId = this.movimiento_id;
          this.catalogoElementosService.postMovimiento(Movimiento)
            .subscribe(res => {
              const Movimiento2 = <CuentaGrupo><unknown>res;
              this.eventChange.emit(true);
              this.showToast('info', 'created', 'Grupo created');
            });
        }
      });
  }



  validarForm(event) {
    if (event.valid) {
      if (this.info_movimiento === undefined) {
        this.createGrupo(event.data.CuentasFormulario);
      } else {
        this.updateGrupo(event.data.CuentasFormulario);
      }
    }
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

}
