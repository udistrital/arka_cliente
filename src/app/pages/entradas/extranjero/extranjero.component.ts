import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { Ordenador, Supervisor } from '../../../@core/data/models/terceros_criterio';
import { CommonEntradas } from '../CommonEntradas';
import { CommonContrato } from '../CommonContrato';
import { CommonFactura } from '../CommonFactura';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'ngx-extranjero',
  templateUrl: './extranjero.component.html',
  styleUrls: ['./extranjero.component.scss'],
})
export class ExtranjeroComponent implements OnInit {

  // Formularios
  contratoForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  facturaForm: FormGroup;
  observacionForm: FormGroup;
  // Soportes
  soportes: Array<SoporteActa>;
  fechaFactura: string;
  divisas: string;
  // Ordenador y Supervisor
  ordenadoresFiltrados: Observable<Ordenador[]>;
  supervisoresFiltrados: Observable<Supervisor[]>;

  @ViewChild('stepper', { static: true }) stepper: MatStepper;

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private pUpManager: PopUpManager,
    private entradasHelper: EntradaHelper,
    private fb: FormBuilder,
    private common: CommonEntradas,
    public commonContrato: CommonContrato,
    private commonFactura: CommonFactura,
  ) { }

  ngOnInit() {
    this.contratoForm = this.commonContrato.formContrato;
    this.ordenadorForm = this.commonContrato.ordenadorForm;
    this.supervisorForm = this.commonContrato.supervisorForm;
    this.observacionForm = this.common.formObservaciones;
    this.facturaForm = this.fb.group({
      facturaCtrl: ['', Validators.required],
      regImportCtrl: ['', Validators.maxLength(20)],
      divisaCtrl: ['', Validators.nullValidator],
      trmCtrl: ['', [Validators.required, Validators.max(9999999999)]],
    });
    this.ordenadoresFiltrados = this.commonContrato.loadOrdenadores(this.ordenadorForm.get('ordenadorCtrl'));
    this.supervisoresFiltrados = this.commonContrato.loadSupervisores(this.supervisorForm.get('supervisorCtrl'));
    this.loadSoportes();
    this.getDivisas();
  }

  async loadSoportes() {
    this.soportes = await this.commonFactura.loadSoportes(this.actaRecibidoId);
  }

  private getDivisas() {
    this.entradasHelper.getDivisas().subscribe(res => {
      if (res) {
        this.divisas = res.Data;
      }
    });
  }

  changeSelectSoporte() {
    this.fechaFactura = this.commonFactura.getFechaFactura(this.soportes, this.facturaForm.value.facturaCtrl);
  }

  onContratoSubmit() {
    // contrato fijo en 000, no se valida ni se consulta
  }

  muestraOrdenador = (ord: Ordenador): string => this.commonContrato.muestraOrdenador(ord);
  muestraSupervisor = (sup: Supervisor): string => this.commonContrato.muestraSupervisor(sup);

  onObservacionSubmit() {
    this.pUpManager.showAlertWithOptions(this.common.optionsSubmit)
      .then((result) => {
        if (result.value) {
          this.onSubmit();
        }
      });
  }

  onSubmit() {
    const detalle = {
      acta_recibido_id: +this.actaRecibidoId,
      contrato_id: 0,
      vigencia_contrato: String(this.commonContrato.currentVigencia),
      factura: +this.facturaForm.value.facturaCtrl,
      num_reg_importacion: this.facturaForm.value.regImportCtrl,
      divisa: this.facturaForm.value.divisaCtrl,
      TRM: this.facturaForm.value.trmCtrl,
      supervisor: this.supervisorForm.value.supervisorCtrl.Id,
      ordenador_gasto_id: this.ordenadorForm.value.ordenadorCtrl.Id,
    };

    const transaccion = this.common.crearTransaccionEntrada(
      this.observacionForm.value.observacionCtrl, detalle, 'ENT_CE', 0,
    );
    this.data.emit(transaccion);
  }
}