import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { PopUpManager } from '../../../managers/popUpManager';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService } from '@ngx-translate/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ngx-sobrante',
  templateUrl: './sobrante.component.html',
  styleUrls: ['./sobrante.component.scss'],
})

export class SobranteComponent implements OnInit {

  fechaForm: FormGroup;
  soporteForm: FormGroup;
  observacionForm: FormGroup;
  fechaSolicitante: string;
  ordenadores: Array<OrdenadorGasto>;
  solicitanteSelect: boolean;
  vigencia: number;
  cargoOrdenador: string;
  ordenadorId: number;
  validar: boolean;
  fileDocumento: any;
  uidDocumento: string;
  idDocumento: number;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private sanitization: DomSanitizer,
    private translate: TranslateService) {
    this.ordenadores = new Array<OrdenadorGasto>();
    this.solicitanteSelect = false;
    this.ordenadorId = 0;
    this.validar = false;
  }

  ngOnInit() {
    this.fechaForm = this.fb.group({
      fechaCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.getVigencia();
  }

  // Métodos para validar campos requeridos en el formulario
  onFechaSubmit() {
    this.fechaForm.markAsDirty();
  }

  onObservacionSubmit() {
    this.validar = true;
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  /**
   * Método para obtener el año en curso
   */
  getVigencia() {
    this.vigencia = new Date().getFullYear();
  }

// Método para enviar registro
  async onSubmit() {
    if (this.validar) {
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        vigencia: this.fechaForm.value.fechaCtrl,
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: detalle,
        FormatoTipoMovimientoId: 'ENT_SI',
        SoporteMovimientoId: this.idDocumento,
      };

      this.data.emit(transaccion);
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }

}
