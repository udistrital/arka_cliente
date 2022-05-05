import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Router, NavigationExtras } from '@angular/router';
import Swal from 'sweetalert2';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';

@Component({
  selector: 'ngx-reposicion',
  templateUrl: './reposicion.component.html',
  styleUrls: ['./reposicion.component.scss'],
})
export class ReposicionComponent implements OnInit {

  elementoForm: FormGroup;
  soporteForm: FormGroup;
  observacionForm: FormGroup;
  facturaForm: FormGroup;
  elementos: any;
  placa: string;
  encargado: string;
  encargadoId: string;
  placas: Array<string>;
  soportes: Array<SoporteActaProveedor>;
  uidDocumento: string;
  idDocumento: number;
  fileDocumento: any;
  validar: boolean = false;
  formatoTipoMovimiento: any;
  proveedor: string;
  fechaFactura: string;
  checked: boolean;
  registrando: boolean;

   @ViewChild('file') fileInput: ElementRef;
   @Input() actaRecibidoId: Number;
  @Input() entradaId: any;
  @Input() EntradaEdit: any;

  constructor(private router: Router, private fb: FormBuilder, private  actasHelper: ActaRecibidoHelper, private  entradasHelper: EntradaHelper,
    private nuxeoService: NuxeoService, private translate: TranslateService, private documentoService: DocumentoService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer ) {
    this.elementos = [];
    this.soportes = new Array<SoporteActaProveedor>();
    this.proveedor = '';
    this.fechaFactura = '';
  }

  ngOnInit() {
    this.elementoForm = this.fb.group({
      elementoCtrl: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{13,13}$')] ],
      encargadoCtrl: [''],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.loadSoporte();
  }

  changeCheck() {
    this.checked = !this.checked;
  }

  // Métodos para validar campos requeridos en el formulario
  onElementoSubmit() {
    this.elementoForm.markAsDirty();
  }

  // MÉTODO PARA BUSCAR PLACAS EXISTENTES
  loadPlacasElementos(): void {
    if (this.placa.length > 3) {
      this.actasHelper.getElementosByPlaca(this.placa).subscribe(res => {
        if (res != null ) {
          while (this.elementos.length > 0) {
            this.elementos.pop();
          }
          this.encargado = '';
          for (const index of Object.keys(res)) {
            if (res[index].Placa != null) {
              this.elementos.push(res[index].Placa);
            }
          }
        }
      });
      if (this.placa.length === 13) {
        this.loadEncargadoElementos(this.placa);
      }
    }
  }
// MÉTODO QUE ACTUALIZA LO CAMBIOS EN EL CAMPO DE PLACAS
  changePlacaElemento(event) {
    this.placa = event.target.value;
    this.loadPlacasElementos();

  }
// MÉTODO QUE CARGA EL ELEMENTO ASOCIADOS A UNA PLACA
  loadEncargadoElementos(placa): void {
    // falta filtrar las placas por las que son de elementos dados de baja
      this.entradasHelper.getEncargadoElementoByPlaca(placa).subscribe(res => {
        if (res != null && res !== undefined) {
          this.encargado = res.NombreCompleto;
          this.encargadoId = res.Id;
        }else {
          this.encargado = '';
        }
      });
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  loadSoporte(): void {
    this.actasHelper.getSoporte(this.actaRecibidoId).subscribe(res => {
      if (res !== null) {
        for (const index in res) {
          if (res.hasOwnProperty(index)) {
            const soporte = new SoporteActaProveedor;
            soporte.Id = res[index].Id;
            soporte.Consecutivo = res[index].Consecutivo;
            soporte.Proveedor = res[index].ProveedorId;
            soporte.FechaSoporte = res[index].FechaSoporte;
            this.soportes.push(soporte);
          }
        }
      }
    });
  }

  onObservacionSubmit() {
    this.validar = true;
  }
    /**
   * Método para enviar registro
   */
  async onSubmit() {
    if (this.encargado.length !== 0 && this.validar === true) {
      this.registrando = true;
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        placa_id: this.placa,
        encargado_id: this.encargadoId,
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: detalle,
        FormatoTipoMovimientoId: 'ENT_RP',
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
    }
  }
}
