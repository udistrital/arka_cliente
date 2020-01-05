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
   // elementos
  elementos: any;
  placa: string;
  encargado: string;
  placas: Array<string>;
  soportes: Array<SoporteActaProveedor>;
  uidDocumento: string;
  idDocumento: number;
  fileDocumento: any;
  validar: boolean;
  formatoTipoMovimiento: any;
  tipoEntrada: any;
  proveedor: string;
  fechaFactura: string;

   @ViewChild('file') fileInput: ElementRef;
   @Input() actaRecibidoId: string;

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

    this.soporteForm = this.fb.group({
      soporteCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.facturaForm = this.fb.group({});
    this.getFormatoEntrada();
    this.getTipoEntrada();
    this.loadSoporte();
  }

  // Métodos para validar campos requeridos en el formulario
  onElementoSubmit() {
    this.elementoForm.markAsDirty();
  }

  onSoporteSubmit() {
    this.soporteForm.markAsDirty();
  }

  // MÉTODO PARA BUSCAR PLACAS EXISTENTES
  loadPlacasElementos(): void {
    if (this.placa.length > 3) {
      this.actasHelper.getElementos(this.placa).subscribe(res => {
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
          this.encargado = res.funcionario;
        }else {
          this.encargado = '';
        }
      });
  }
  // MÉTODOS PARA CARGAR SOPORTES
  getSoporte(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const [_, extension] = event.target.files[0].name;
      if (file.type === 'application/pdf' ) {
        this.validar = true;
        file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
        file.url = this.cleanURL(file.urlTemp);
        file.IdDocumento = 12; // tipo de documento (API documentos_crud)
        file.file = event.target.files[0];
        this.fileDocumento = file;
      } else {
        this.fileInput.nativeElement.value = null;
        this.validar = true;
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

  getTipoEntrada() {
    this.entradasHelper.getTipoEntradaByAcronimo('e_arka').subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos) && data[datos].Nombre !== undefined && data[datos].Nombre === 'Reposición') {
            this.tipoEntrada = data[datos];
          }
        }
      }
    });
  }

  getFormatoEntrada() {
    this.entradasHelper.getFormatoEntradaByName('Reposición').subscribe(res => {
      if (res !== null) {
        this.formatoTipoMovimiento = res;
      }
    });
  }

  changeSelectSoporte(event) {
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
    if (this.validar && this.fileDocumento !== null ) {
      if (this.encargado.length !== 0) {
        await this.postSoporteNuxeo([this.fileDocumento]);
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        consecutivo: 'P8-2-2019', // REVISAR
        documento_contable_id: 1, // REVISAR
        placa_id: this.placa,
        encargado_id: this.encargado,
      };
      const movimientoReposicion = {
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

      this.entradasHelper.postEntrada(movimientoReposicion).subscribe((res: any) => {
        if (res !== null) {
          this.pUpManager.showSuccesToast('Registro Exitoso');
          this.pUpManager.showSuccessAlert('Entrada registrada satisfactoriamente!' +
            '\n ENTRADA N°: P8-1-2019'); // SE DEBE MOSTRAR EL CONSECUTIVO REAL
          const navigationExtras: NavigationExtras = { state: { consecutivo: res.Id } };
          this.router.navigate(['/pages/reportes/registro-entradas'], navigationExtras);
        } else {
          this.pUpManager.showErrorAlert('No es posible hacer el registro.');
        }
      });
      }else {
        this.pUpManager.showErrorAlert('Placa invalida o encargado no encontrado');
      }
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }
  }

}


