import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { ArkaMidInmuebles } from '../../../helpers/arka_mid/inmuebles';
import { ListService } from '../../../@core/store/services/list.service';
import { IAppState } from '../../../@core/store/app.state';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Validadores } from '../../../@core/data/validadores';
import { OikosHelper } from '../../../helpers/oikos/oikosHelper';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-form-inmueble',
  templateUrl: './form-inmueble.component.html',
  styleUrls: ['./form-inmueble.component.scss'],
})
export class FormInmuebleComponent implements OnInit {

  @Input() inmuebleId: number;
  @Input() modo: string = 'create' || 'read' || 'update';
  @Output() volver = new EventEmitter();
  form: FormGroup;
  cuentas: any[];
  sedes: any;
  cuentasFiltradas: any[];
  clases: any[];
  espacios: any[];
  button: string = 'crear';

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private listService: ListService,
    private store: Store<IAppState>,
    private inmueblesMid: ArkaMidInmuebles,
    public catalogoHelper: CatalogoElementosHelper,
    public oikosHelper: OikosHelper,
  ) { }

  ngOnInit() {
    this.FormulariosConfig();
    this.loadData();
    this.setButton();
    this.loadLists();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  private setButton() {
    if (this.modo === 'update') {
      this.button = 'actualizar';
    }
  }

  private loadLists() {
    if (this.modo === 'read') {
      return;
    }

    this.listService.findPlanCuentasDebito();
    this.listService.findPlanCuentasCredito();
    this.listService.findSedes();
    this.store.select((stte) => stte).subscribe(
      (list) => {
        if (list.listPlanCuentasCredito.length && list.listPlanCuentasDebito.length &&
          list.listPlanCuentasCredito[0].length && list.listPlanCuentasDebito[0].length &&
          list.listSedes.length && list.listSedes[0]) {
          const credito = list.listPlanCuentasCredito[0];
          const debito = list.listPlanCuentasDebito[0];
          this.cuentas = debito.concat(credito);
          this.sedes = list.listSedes[0];
        }
      },
    );
  }

  loadData() {
    if (!this.inmuebleId) {
      return;
    }

    this.inmueblesMid.getOneInmueble(this.inmuebleId).
      subscribe(res => {
        const datosGenerales = {
          Id: res.Elemento.Id,
          Nombre: res.Elemento.Nombre,
          SubgrupoId: { SubgrupoId: res.SubgrupoId },
          EspacioFisico: res.EspacioFisico,
          TipoEspacioFisico: res.EspacioFisico.TipoEspacioFisicoId ? res.EspacioFisico.TipoEspacioFisicoId.Nombre : '',
          Sede: res.Sede.Nombre,
        };

        const valores = {
          ValorTotal: res.ElementoMovimiento.ValorTotal,
          ValorResidual: res.ElementoMovimiento.ValorResidual,
          VidaUtil: res.ElementoMovimiento.VidaUtil,
          FechaCorte: res.ElementoMovimiento.MovimientoId.FechaCorte,
        };

        const cuentas = {
          CuentaDebitoId: res.Cuentas.CuentaDebitoId,
          CuentaCreditoId: res.Cuentas.CuentaCreditoId,
        };

        this.form.patchValue({
          datosGenerales,
          valores,
          cuentas,
        });

        if (res.CuentasMediciones.CuentaDebitoId && res.CuentasMediciones.CuentaDebitoId.Id) {
          const cuentasMediciones = {
            CuentaMedicionesDebitoId: res.CuentasMediciones.CuentaDebitoId,
            CuentaMedicionesCreditoId: res.CuentasMediciones.CuentaCreditoId,
          };

          this.form.patchValue({
            cuentasMediciones,
          });
        }

      });
  }

  FormulariosConfig() {
    this.form = this.fb.group({
      datosGenerales: this.datosGeneralesForm,
      valores: this.valoresForm,
      cuentas: this.cuentasForm,
      // datosAdicionales: this.datosAdicionalesForm,
    });
  }

  public confirmSubmit() {
    if (this.modo === 'read' || !this.form.valid) {
      return;
    }

    this.pUpManager.showAlertWithOptions(this.optionsConfirm)
      .then((result) => {
        if (result.value) {
          this.onSubmit();
        }
      });
  }

  private onSubmit() {
    const Elemento = Validadores.getValue(this.form, 'datosGenerales');

    const ElementoMovimiento = {
      ValorTotal: Validadores.getValue(this.form, 'valores.ValorTotal'),
      ValorResidual: Validadores.getValue(this.form, 'valores.ValorResidual'),
      MovimientoId: { FechaCorte: Validadores.getValue(this.form, 'valores.FechaCorte') },
      VidaUtil: Validadores.getValue(this.form, 'valores.VidaUtil'),
    };

    const CuentaDebitoId = Validadores.getValue(this.form, 'cuentas.CuentaDebitoId');
    const CuentaCreditoId = Validadores.getValue(this.form, 'cuentas.CuentaCreditoId');
    const Cuentas = {
      CuentaCreditoId: { Id: CuentaCreditoId.Id },
      CuentaDebitoId: { Id: CuentaDebitoId.Id },
    };

    const CuentaMedicionesDebitoId = Validadores.getValue(this.form, 'cuentas.CuentaMedicionesDebitoId');
    const CuentaMedicionesCreditoId = Validadores.getValue(this.form, 'cuentas.CuentaMedicionesCreditoId');
    const CuentasMediciones = {
      CuentaCreditoId: { Id: CuentaMedicionesCreditoId.Id },
      CuentaDebitoId: { Id: CuentaMedicionesDebitoId.Id },
    };

    const data = {
      Cuentas,
      CuentasMediciones,
      Elemento,
      ElementoMovimiento,
      EspacioFisico: Elemento.EspacioFisico,
      SubgrupoId: Elemento.SubgrupoId.SubgrupoId,
    };


    if (this.inmuebleId) {
      this.inmueblesMid.putInmueble(data, this.inmuebleId).subscribe(res => {
        if (res.Error) {
          this.pUpManager.showErrorAlert(res.Error);
        } else {
          this.pUpManager.showAlertWithOptions(this.optionsSuccess);
        }
      });
    } else {
      this.inmueblesMid.postInmueble(data).subscribe(res => {
        if (res.Error) {
          this.pUpManager.showErrorAlert(res.Error);
        } else {
          this.pUpManager.showAlertWithOptions(this.optionsSuccess);
        }
      });
    }

  }

  public onVolver() {
    this.volver.emit();
  }

  public getDetalleEspacio() {

    const ctrl = this.form.get('datosGenerales.EspacioFisico');
    if (!ctrl.valid || !ctrl.value || !ctrl.value.TipoEspacioFisicoId) {
      return;
    }

    this.form.get('datosGenerales.TipoEspacioFisico').patchValue(ctrl.value.TipoEspacioFisicoId.Nombre);

    const sede = this.oikosHelper.getSedeEspacioFisico(ctrl.value.CodigoAbreviacion, this.sedes);
    if (!sede) {
      return;
    }

    this.form.get('datosGenerales.Sede').patchValue(sede.Nombre);
  }

  get datosGeneralesForm(): FormGroup {
    const disabled = this.modo === 'read';
    const form = this.fb.group({
      Id: [0],
      Nombre: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      SubgrupoId: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, Validadores.validateObjectCompleter('SubgrupoId', 4)],
        },
      ],
      EspacioFisico: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, Validadores.validateObjectCompleter('Id', 4)],
        },
      ],
      TipoEspacioFisico: [
        {
          value: '',
          disabled: true,
        },
      ],
      Sede: [
        {
          value: '',
          disabled: true,
        },
      ],
    });

    this.catalogoHelper.cambiosClase(form.get('SubgrupoId').valueChanges)
      .subscribe((response: any) => {
        this.clases = response.queryOptions;
      });

    this.oikosHelper.cambiosEspacios(form.get('EspacioFisico').valueChanges)
      .subscribe((response: any) => {
        this.espacios = response.queryOptions;
      });

    return form;
  }

  get valoresForm(): FormGroup {
    const disabled = this.modo !== 'create';
    const form = this.fb.group({
      Id: [0],
      ValorTotal: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      ValorResidual: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      VidaUtil: [
        {
          value: 0,
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
      FechaCorte: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required],
        },
      ],
    });

    return form;
  }

  get cuentasForm(): FormGroup {
    const disabled = this.modo === 'read';
    const form = this.fb.group({
      CuentaDebitoId: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, Validadores.validateObjectCompleter('Id', 4)],
        },
      ],
      CuentaCreditoId: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validators.required, Validadores.validateObjectCompleter('Id', 4)],
        },
      ],
      CuentaMedicionesDebitoId: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validadores.validateObjectCompleter('Id', 4)],
        },
      ],
      CuentaMedicionesCreditoId: [
        {
          value: '',
          disabled,
        },
        {
          validators: [Validadores.validateObjectCompleter('Id', 4)],
        },
      ],
    });

    this.cambiosCuenta(form.get('CuentaDebitoId'));
    this.cambiosCuenta(form.get('CuentaCreditoId'));
    this.cambiosCuenta(form.get('CuentaMedicionesDebitoId'));
    this.cambiosCuenta(form.get('CuentaMedicionesCreditoId'));
    return form;
  }

  private cambiosCuenta(control: AbstractControl) {
    control.valueChanges
      .pipe(
        startWith(''),
        debounceTime(250),
        distinctUntilChanged(),
        map(val => typeof val === 'string' ? val : this.muestraCuenta(val)),
      ).subscribe((response: any) => {
        this.cuentasFiltradas = this.filtroCuentas(response);
      });
  }

  public muestraCuenta(contr): string {
    return contr.Codigo ? contr.Codigo + ' - ' + contr.Nombre : '';
  }

  private filtroCuentas(nombre): any[] {
    if (this.cuentas && nombre.length > 3) {
      return this.cuentas.filter(contr => this.muestraCuenta(contr).toLowerCase().includes(nombre.toLowerCase()));
    } else {
      return [];
    }
  }

  get datosAdicionalesForm(): FormGroup {
    const form = this.fb.group({});

    return form;
  }

  get optionsConfirm() {
    return {
      title: this.translate.instant('GLOBAL.inmuebles.' + this.modo + '.confrmTtl'),
      text: this.translate.instant('GLOBAL.inmuebles.' + this.modo + '.confrmTxt'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };
  }

  get optionsSuccess() {
    return {
      type: 'success',
      title: this.translate.instant('GLOBAL.inmuebles.' + this.modo + '.successTtl'),
      text: this.translate.instant('GLOBAL.inmuebles.' + this.modo + '.successTxt'),
      showConfirmButton: true,
    };
  }

}
