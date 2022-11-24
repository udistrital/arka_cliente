import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { CommonEntradas } from '../CommonEntradas';
import { CommonContrato } from '../CommonContrato';
import { CommonFactura } from '../CommonFactura';
import { MatStepper } from '@angular/material';

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

  vigencia: number;
  tipos: Array<any>;
  contratos: Array<Contrato>;
  contratoEspecifico: Contrato;
  soportes: Array<SoporteActa>;
  fechaFactura: string;
  divisas: string;

  @ViewChild('stepper') stepper: MatStepper;

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private pUpManager: PopUpManager,
    private entradasHelper: EntradaHelper,
    private fb: FormBuilder,
    private common: CommonEntradas,
    private commonContrato: CommonContrato,
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
    this.loadContratoInfo();
    this.getDivisas();
  }

  async loadContratoInfo() {
    this.contratoEspecifico = new Contrato;
    this.vigencia = this.commonContrato.currentVigencia;
    this.tipos = await this.commonContrato.loadTipoContratos();
    this.soportes = await this.commonFactura.loadSoportes(this.actaRecibidoId);
  }

  private getDivisas() {
    this.entradasHelper.getDivisas().subscribe(res => {
      if (res) {
        this.divisas = res.Data;
      }
    });
  }

  async getContratos() {
    this.contratos = await this.commonContrato.loadContratos(this.contratoForm.value.tipoCtrl, this.contratoForm.value.vigenciaCtrl);
  }

  changeSelectSoporte() {
    this.fechaFactura = this.commonFactura.getFechaFactura(this.soportes, this.facturaForm.value.facturaCtrl);
  }

  async onContratoSubmit() {
    const existe = this.commonContrato.checkContrato(this.contratos, this.contratoForm.value.contratoCtrl);
    if (!existe) {
      this.stepper.previous();
      this.contratoEspecifico = new Contrato;
      this.pUpManager.showErrorAlert('El contrato seleccionado no existe!');
      return;
    }

    this.contratoEspecifico = await this.commonContrato.loadContrato(this.contratoForm.value.contratoCtrl, this.contratoForm.value.vigenciaCtrl);
  }

  onObservacionSubmit() {
    this.pUpManager.showAlertWithOptions(this.common.optionsSubmit)
      .then((result) => {
        if (result.value) {
          this.onSubmit();
        }
      });
  }

  // Método para enviar registro
  onSubmit() {
    const detalle = {
      acta_recibido_id: +this.actaRecibidoId,
      contrato_id: +this.contratoEspecifico.NumeroContratoSuscrito,
      vigencia_contrato: this.contratoForm.value.vigenciaCtrl,
      factura: +this.facturaForm.value.facturaCtrl,
      num_reg_importacion: this.facturaForm.value.regImportCtrl,
      divisa: this.facturaForm.value.divisaCtrl,
      TRM: this.facturaForm.value.trmCtrl,
    };

    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_CE', 0);
    this.data.emit(transaccion);
  }

}
