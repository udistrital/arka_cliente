import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { PopUpManager } from '../../../managers/popUpManager';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Ordenador, Supervisor } from '../../../@core/data/models/terceros_criterio';
import { TranslateService } from '@ngx-translate/core';
import { CommonContrato } from '../CommonContrato';
import { CommonEntradas } from '../CommonEntradas';
import { CommonFactura } from '../CommonFactura';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'ngx-adquisicion',
  templateUrl: './adquisicion.component.html',
  styleUrls: ['./adquisicion.component.scss'],
})
export class AdquisicionComponent implements OnInit {

  // Formularios
  contratoForm: FormGroup;
  facturaForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  // Soportes
  soportes: Array<SoporteActa>;
  fechaFactura: string;
  // Ordenador y Supervisor
  ordenadoresFiltrados: Observable<Ordenador[]>;
  supervisoresFiltrados: Observable<Supervisor[]>;

  @ViewChild('stepper', { static: true }) stepper: MatStepper;

  @Input() actaRecibidoId: number;
  @Input() idexud: boolean;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    public commonContrato: CommonContrato,
    private commonFactura: CommonFactura,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.contratoForm = this.commonContrato.formContrato;
    this.ordenadorForm = this.commonContrato.ordenadorForm;
    this.supervisorForm = this.commonContrato.supervisorForm;
    this.facturaForm = this.commonFactura.formFactura;
    this.observacionForm = this.common.formObservaciones;
    this.ordenadoresFiltrados = this.commonContrato.loadOrdenadores(this.ordenadorForm.get('ordenadorCtrl'));
    this.supervisoresFiltrados = this.commonContrato.loadSupervisores(this.supervisorForm.get('supervisorCtrl'));
    this.loadSoportes();
  }

  async loadSoportes() {
    this.soportes = await this.commonFactura.loadSoportes(this.actaRecibidoId);
  }

  onContratoSubmit() {
    // contrato fijo en 000, no se valida ni se consulta
  }

  changeSelectSoporte() {
    this.fechaFactura = this.commonFactura.getFechaFactura(this.soportes, this.facturaForm.value.facturaCtrl);
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
      supervisor: this.supervisorForm.value.supervisorCtrl.Id,
      ordenador_gasto_id: this.ordenadorForm.value.ordenadorCtrl.Id,
    };

    const transaccion = this.common.crearTransaccionEntrada(
      this.observacionForm.value.observacionCtrl, detalle, 'ENT_ADQ', 0,
    );
    this.data.emit(transaccion);
  }
}
