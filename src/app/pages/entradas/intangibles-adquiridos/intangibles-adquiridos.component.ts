import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { MatStepper } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonEntradas } from '../CommonEntradas';
import { CommonContrato } from '../CommonContrato';
import { CommonFactura } from '../CommonFactura';

@Component({
  selector: 'ngx-intangibles-adquiridos',
  templateUrl: './intangibles-adquiridos.component.html',
  styleUrls: ['./intangibles-adquiridos.component.scss'],
})
export class IntangiblesAdquiridosComponent implements OnInit {

  // Formularios
  contratoForm: FormGroup;
  facturaForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  // Contratos
  vigencia: number;
  tipos: Array<any>;
  contratos: Array<Contrato>;
  contratoEspecifico: Contrato;
  // Soportes
  soportes: Array<SoporteActa>;
  fechaFactura: string;

  @ViewChild('stepper', { static: true }) stepper: MatStepper;

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    private commonContrato: CommonContrato,
    private commonFactura: CommonFactura,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    this.contratoEspecifico = new Contrato;
  }

  ngOnInit() {
    this.loadContratoInfo();
    this.contratoForm = this.commonContrato.formContrato;
    this.ordenadorForm = this.commonContrato.ordenadorForm;
    this.supervisorForm = this.commonContrato.supervisorForm;
    this.facturaForm = this.commonFactura.formFactura;
    this.observacionForm = this.common.formObservaciones;
  }

  async loadContratoInfo() {
    this.contratoEspecifico = new Contrato;
    this.vigencia = this.commonContrato.currentVigencia;
    this.tipos = await this.commonContrato.loadTipoContratos();
    this.soportes = await this.commonFactura.loadSoportes(this.actaRecibidoId);
  }

  async getContratos() {
    this.contratos = await this.commonContrato.loadContratos(this.contratoForm.value.tipoCtrl, this.contratoForm.value.vigenciaCtrl);
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

  changeSelectSoporte() {
    this.fechaFactura = this.commonFactura.getFechaFactura(this.soportes, this.facturaForm.value.facturaCtrl);
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
    };

    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_IA', 0);
    this.data.emit(transaccion);
  }
}
