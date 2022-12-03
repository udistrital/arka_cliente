import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService } from '@ngx-translate/core';
import { CommonEntradas } from '../CommonEntradas';
import { CommonFactura } from '../CommonFactura';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-donacion',
  templateUrl: './donacion.component.html',
  styleUrls: ['./donacion.component.scss'],
})
export class DonacionComponent implements OnInit {

  // Formularios
  facturaForm: FormGroup;
  observacionForm: FormGroup;
  // Soporte
  soportes: Array<SoporteActa>;
  fechaFactura: string = '';

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    private commonFactura: CommonFactura,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.facturaForm = this.commonFactura.formFactura;
    this.observacionForm = this.common.formObservaciones;
    this.loadSoportes();
  }

  async loadSoportes() {
    this.soportes = await this.commonFactura.loadSoportes(this.actaRecibidoId);
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
      factura: +this.facturaForm.value.facturaCtrl,
    };

    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_DN', 0);
    this.data.emit(transaccion);
  }

}
