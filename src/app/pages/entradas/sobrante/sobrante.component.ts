import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { PopUpManager } from '../../../managers/popUpManager';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TranslateService } from '@ngx-translate/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import Swal from 'sweetalert2';

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
  registrando: boolean;

  formatoTipoMovimiento: any;

  @Input() actaRecibidoId: Number;
  @Input() entradaId: any;
  @Input() EntradaEdit: any;

  constructor(private router: Router, private entradasHelper: EntradaHelper, private pUpManager: PopUpManager, private fb: FormBuilder,
    private nuxeoService: NuxeoService, private sanitization: DomSanitizer, private documentoService: DocumentoService,
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

  /**
   * Método para enviar registro
   */
  async onSubmit() {
    if (this.validar) {
      this.registrando = true;
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

      this.entradasHelper.postEntrada(transaccion).subscribe((res: any) => {
        if (res.Detalle) {
          this.registrando = false;
          const consecutivo = JSON.parse(res.Detalle).consecutivo;
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.movimientos.entradas.registroTtlOk', { CONSECUTIVO: consecutivo }),
            text: this.translate.instant('GLOBAL.movimientos.entradas.registroTxtOk', { CONSECUTIVO: consecutivo }),
          });
          this.router.navigate(['/pages/entradas']);
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.registroFail'));
        }
      });
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }

}
