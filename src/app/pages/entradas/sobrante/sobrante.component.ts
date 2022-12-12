import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService } from '@ngx-translate/core';
import { CommonEntradas } from '../CommonEntradas';

@Component({
  selector: 'ngx-sobrante',
  templateUrl: './sobrante.component.html',
  styleUrls: ['./sobrante.component.scss'],
})

export class SobranteComponent implements OnInit {

  observacionForm: FormGroup;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private pUpManager: PopUpManager,
    private common: CommonEntradas,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.observacionForm = this.common.formObservaciones;
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
  private onSubmit() {
    const detalle = {
      acta_recibido_id: +this.actaRecibidoId,
    };

    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_SI', 0);
    this.data.emit(transaccion);
  }

}
