import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { ArkaMidInmuebles } from '../../../helpers/arka_mid/inmuebles';

@Component({
  selector: 'ngx-form-inmueble',
  templateUrl: './form-inmueble.component.html',
  styleUrls: ['./form-inmueble.component.scss'],
})
export class FormInmuebleComponent implements OnInit {

  @Input() inmuebleId: Number;
  @Output() volver = new EventEmitter();
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private inmueblesMid: ArkaMidInmuebles,
  ) { }

  ngOnInit() {
    this.FormulariosConfig();
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  loadData() {
    this.inmueblesMid.getOneInmueble(this.inmuebleId).
      subscribe(res => {
        const datosGenerales = {
          Nombre: res.Elemento.Nombre,
          EspacioFisico: res.EspacioFisico.Nombre,
          TipoEspacioFisico: res.EspacioFisico.TipoEspacioFisicoId,
          Sede: res.Sede.Nombre,
        };

        const valores = {
          ValorInicial: res.ElementoMovimiento.ValorTotal,
          ValorResidual: res.ElementoMovimiento.ValorResidual,
          VidaUtil: res.ElementoMovimiento.VidaUtil,
          FechaReferencia: res.ElementoMovimiento.MovimientoId.FechaCorte,
        };

        const cuentas = {
          CuentaDebitoId: res.Cuentas.CuentaDebitoId.Nombre,
          CuentaCreditoId: res.Cuentas.CuentaCreditoId.Nombre,
          CuentaMedicionesDebitoId: res.CuentasMediciones.CuentaDebitoId.Nombre,
          CuentaMedicionesCreditoId: res.CuentasMediciones.CuentaCreditoId.Nombre,
        };

        this.form.patchValue({
          datosGenerales,
          valores,
          cuentas,
        });
      });
  }

  FormulariosConfig() {
    this.form = this.fb.group({
      datosGenerales: this.datosGeneralesForm,
      valores: this.valoresForm,
      cuentas: this.cuentasForm,
      datosAdicionales: this.datosAdicionalesForm,
    });
    this.form.disable();
  }

  public onVolver() {
    this.volver.emit();
  }

  get datosGeneralesForm(): FormGroup {
    const form = this.fb.group({
      Nombre: ['', Validators.required],
      EspacioFisico: ['', Validators.required],
      TipoEspacioFisico: ['', Validators.required],
      Sede: ['', Validators.required],
    });

    return form;
  }

  get valoresForm(): FormGroup {
    const form = this.fb.group({
      ValorInicial: ['', Validators.required],
      ValorResidual: ['', Validators.required],
      VidaUtil: ['', Validators.required],
      FechaReferencia: ['', Validators.required],
    });

    return form;
  }

  get cuentasForm(): FormGroup {
    const form = this.fb.group({
      CuentaDebitoId: ['', Validators.required],
      CuentaCreditoId: ['', Validators.required],
      CuentaMedicionesDebitoId: ['', Validators.required],
      CuentaMedicionesCreditoId: ['', Validators.required],
    });

    return form;
  }

  get datosAdicionalesForm(): FormGroup {
    const form = this.fb.group({});

    return form;
  }

}
