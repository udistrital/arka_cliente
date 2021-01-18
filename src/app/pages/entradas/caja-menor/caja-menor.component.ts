import { Component, OnInit, Input } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { Router, NavigationExtras } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from '../../../@core/data/documento.service';
import { TranslateService } from '@ngx-translate/core';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';

@Component({
  selector: 'ngx-caja-menor',
  templateUrl: './caja-menor.component.html',
  styleUrls: ['./caja-menor.component.scss'],
})
export class CajaMenorComponent implements OnInit {
  soporteForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  facturaForm: FormGroup;

  ordenadores: Array<OrdenadorGasto>;
  solicitanteSelect: boolean;
  ordenadorId: number;
  supervisorId: number;
  validar: boolean;
  vigencia: number;
  fechaSolicitante: string;
  cargoOrdenador: string;
  fileDocumento: any;
  uidDocumento: string;
  idDocumento: number;
  soportes: Array<SoporteActaProveedor>;
  proveedor: string;
  fechaFactura: string;

  tipoEntrada: any;
  formatoTipoMovimiento: any;

  @Input() actaRecibidoId: string;

  constructor(private router: Router, private entradasHelper: EntradaHelper, private pUpManager: PopUpManager,
    private actaRecibidoHelper: ActaRecibidoHelper, private fb: FormBuilder,
    private nuxeoService: NuxeoService, private sanitization: DomSanitizer, private documentoService: DocumentoService,
    private translate: TranslateService) {
    this.ordenadores = new Array<OrdenadorGasto>();
    this.solicitanteSelect = false;
    this.ordenadorId = 0;
    this.supervisorId = 0;
    this.validar = false;
    this.soportes = new Array<SoporteActaProveedor>();
    this.proveedor = '';
    this.fechaFactura = '';
  }


  ngOnInit() {
    this.soporteForm = this.fb.group({
      soporteCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.ordenadorForm = this.fb.group({
      ordenadorCtrl: ['', Validators.required],
      fechaCtrl: ['', Validators.required],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.facturaForm = this.fb.group({
      facturaCtrl: ['', Validators.nullValidator],
    });
    this.getVigencia();
    this.getTipoEntrada();
    this.getFormatoEntrada();
    this.loadSoporte();
  }

  // Métodos para validar campos requeridos en el formulario
  onSolicitanteSubmit() {
    this.soporteForm.markAsDirty();
  }

loadSolicitantes(): void {
  this.entradasHelper.getSolicitantes(this.fechaSolicitante).subscribe(res => {
    while (this.ordenadores.length > 0) {
      this.ordenadores.pop();
    }
    if (res !== null) {
      for (const index of Object.keys(res.ListaOrdenadores.Ordenadores)) {
        const ordenador = new OrdenadorGasto;
        ordenador.NombreOrdenador = res.ListaOrdenadores.Ordenadores[index].NombreOrdenador;
        ordenador.Id = res.ListaOrdenadores.Ordenadores[index].IdOrdenador;
        ordenador.RolOrdenadorGasto = res.ListaOrdenadores.Ordenadores[index].CargoOrdenador;
        this.ordenadores.push(ordenador);
      }
    }
  });
}

changeSolicitante(event) {
  if (!this.solicitanteSelect) {
    this.solicitanteSelect = !this.solicitanteSelect;
  }
  const date: Date = event;
  const mes = parseInt(date.getUTCMonth().toString(), 10) + 1;
  if (mes < 10) {
    this.fechaSolicitante = date.getFullYear() + '-0' + mes + '-' + date.getDate();
  } else {
    this.fechaSolicitante = date.getFullYear() + '-' + mes + '-' + date.getDate();
  }
  this.loadSolicitantes();
}

  changeOrdenador() {
    this.cargoOrdenador = '';
    for (const i in this.ordenadores) {
      if (this.ordenadores[i].NombreOrdenador === this.ordenadorForm.value.ordenadorCtrl) {
        this.ordenadorId = this.ordenadores[i].Id;
        this.cargoOrdenador = this.ordenadores[i].RolOrdenadorGasto;
      }
    }
  }

  changeSupervisor() {
    for (const i in this.ordenadores) {
      if (this.ordenadores[i].NombreOrdenador === this.ordenadorForm.value.ordenadorCtrl) {
        this.supervisorId = this.ordenadores[i].Id;
      }
    }
  }

  onSoporteSubmit() {
    if (this.ordenadorId !== 0) {
      this.soporteForm.markAsDirty();
    }
  }
  loadSoporte(): void {
    this.actaRecibidoHelper.getSoporte(this.actaRecibidoId).subscribe(res => {
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


  // MÉTODOS PARA CARGAR SOPORTES
  getSoporte(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
        file.url = this.cleanURL(file.urlTemp);
        file.IdDocumento = 12; // tipo de documento (API documentos_crud)
        file.file = event.target.files[0];
        this.fileDocumento = file;
      } else {
        this.pUpManager.showToast('error', this.translate.instant('GLOBAL.error'), this.translate.instant('ERROR.formato_documento_pdf'));
      }
    }
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  postSoporteNuxeo(files) {
    return new Promise((resolve, reject) => {
      files.forEach((file) => {
        file.Id = file.nombre;
        file.nombre = 'soporte_' + file.IdDocumento + '_entradas';
        // file.key = file.Id;
        file.key = 'soporte_' + file.IdDocumento;
      });
      this.nuxeoService.getDocumentos$(files, this.documentoService)
        .subscribe(response => {
          if (Object.keys(response).length === files.length) {
            // console.log("response", response);
            files.forEach((file) => {
              this.uidDocumento = file.uid;
              this.idDocumento = response[file.key].Id;
            });
            resolve(true);
          }
        }, error => {
          reject(error);
        });
    });
  }

  /**
   * Método para obtener el año en curso
   */
  getVigencia() {
    this.vigencia = new Date().getFullYear();
  }

  getTipoEntrada() {
    this.entradasHelper.getTipoEntradaByAcronimo('e_arka').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos) && data[datos].Nombre !== undefined && data[datos].Nombre === 'Caja menor') {
            this.tipoEntrada = data[datos];
          }
        }
      }
    });
  }

  getFormatoEntrada() {
    this.entradasHelper.getFormatoEntradaByName('Elaboración Propia').subscribe(res => {
      if (res !== null) {
        this.formatoTipoMovimiento = res;
      }
    });
  }
  changeSelectSoporte(event) {
    this.loadSoporte();
    const soporteId: string = event.target.options[event.target.options.selectedIndex].value;
    for (const i in this.soportes) {
      if (this.soportes[i].Id.toString() === soporteId) {
        this.proveedor = this.soportes[i].Proveedor.NomProveedor;
        const date = this.soportes[i].FechaSoporte.toString().split('T');
        this.fechaFactura = date[0];
      }
    }
  }

  /**
   * Método para enviar registro
   */
  async onSubmit() {
    if (this.validar) {
      await this.postSoporteNuxeo([this.fileDocumento]);

      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        consecutivo: 'P8-2-2019', // REVISAR
        documento_contable_id: 1, // REVISAR
        vigencia_ordenador: this.fechaSolicitante,
        ordenador_gasto_id: +this.ordenadorId,
        solicitante_id: +this.supervisorId,
      };
      const movimientoAdquisicion = {
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: JSON.stringify(detalle),
        Activo: true,
        FormatoTipoMovimientoId: {
          Id: this.formatoTipoMovimiento[0].Id,
        },
        EstadoMovimientoId: {
          Id: 2, // REVISAR
        },
        SoporteMovimientoId: this.idDocumento,
        IdTipoMovimiento: this.tipoEntrada.Id,
      };

      this.entradasHelper.postEntrada(movimientoAdquisicion).subscribe((res: any) => {
        if (res !== null) {
          this.pUpManager.showSuccesToast('Registro Exitoso');
          this.pUpManager.showSuccessAlert('Entrada registrada satisfactoriamente!' +
            '\n ENTRADA N°: P8-2-2019'); // SE DEBE MOSTRAR EL CONSECUTIVO REAL

          const navigationExtras: NavigationExtras = { state: { consecutivo: res.Id } }; // REVISAR POR QUÉ RES LLEGA 0
          this.router.navigate(['/pages/reportes/registro-entradas'], navigationExtras);
        } else {
          this.pUpManager.showErrorAlert('No es posible hacer el registro.');
        }
      });
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }
}
