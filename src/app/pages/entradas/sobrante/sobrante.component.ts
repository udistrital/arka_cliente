import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { PopUpManager } from '../../../managers/popUpManager';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TranslateService } from '@ngx-translate/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';

@Component({
  selector: 'ngx-sobrante',
  templateUrl: './sobrante.component.html',
  styleUrls: ['./sobrante.component.scss'],
})
export class SobranteComponent implements OnInit {

  solicitanteForm: FormGroup;
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

  @Input() actaRecibidoId: string;

  constructor(private router: Router, private entradasHelper: EntradaHelper, private pUpManager: PopUpManager, private fb: FormBuilder,
    private nuxeoService: NuxeoService, private sanitization: DomSanitizer, private documentoService: DocumentoService,
    private translate: TranslateService, ) {
    this.ordenadores = new Array<OrdenadorGasto>();
    this.solicitanteSelect = false;
    this.ordenadorId = 0;
    this.validar = false;
  }

  ngOnInit() {
    this.solicitanteForm = this.fb.group({
      solicitanteCtrl: ['', Validators.required],
      fechaCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.soporteForm = this.fb.group({
      soporteCtrl: ['', Validators.required],
    });
    this.getVigencia();
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
      if (this.ordenadores[i].NombreOrdenador === this.solicitanteForm.value.solicitanteCtrl) {
        this.ordenadorId = this.ordenadores[i].Id;
        this.cargoOrdenador = this.ordenadores[i].RolOrdenadorGasto;
      }
    }
  }

  // Métodos para validar campos requeridos en el formulario
  onSolicitanteSubmit() {
    this.soporteForm.markAsDirty();
  }

  onSoporteSubmit() {
    if (this.ordenadorId !== 0) {
      this.validar = true;
      this.soporteForm.markAsDirty();
    }
  } number

  // MÉTODOS PARA CARGAR SOPORTES
  getSoporte(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
        file.url = this.cleanURL(file.urlTemp);
        file.IdDocumento = 11;
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

  /**
   * Método para enviar registro
   */
  async onSubmit() {
    if (this.validar) {
      const entradaData = new Entrada;
      const tipoEntrada = new TipoEntrada;

      // CAMPOS OBLIGATORIOS
      entradaData.ActaRecibidoId = +this.actaRecibidoId;
      entradaData.Activo = true;
      entradaData.Consecutivo = 'P8-6-2019'; // REVISAR
      entradaData.DocumentoContableId = 1; // REVISAR
      tipoEntrada.Id = 1;
      entradaData.TipoEntradaId = tipoEntrada;
      entradaData.Vigencia = this.vigencia.toString(); // REVISAR
      entradaData.Observacion = this.observacionForm.value.observacionCtrl;

      // CAMPOS REQUERIDOS PARA ADQUISICIÓN
      entradaData.Solicitante = +this.ordenadorId;

      await this.postSoporteNuxeo([this.fileDocumento]);

      var soporte = {
        DocumentoId: this.idDocumento,
        Activo: true,
        EntradaElementoId: {
          Id: 0
        }
      }

      // ENVIA LA ENTRADA AL MID
      this.entradasHelper.postEntrada(entradaData).subscribe((res: any) => {
        if (res !== null) {
          // CONSULTA ACTAS (DEBE IRSE)
          this.entradasHelper.getEntradas().subscribe(resEntrada => {
            if (resEntrada !== null) {
              const data = <Array<any>>resEntrada;
              soporte.EntradaElementoId.Id = data[0].Id;

              // POST SOPORTE (DEBE IRSE)
              this.entradasHelper.postSoporteEntrada(soporte).subscribe(resSoporte => {
                if (resSoporte !== null) {
                  this.pUpManager.showSuccesToast('Registro Exitoso');
                  this.pUpManager.showSuccessAlert('Entrada registrada satisfactoriamente!' +
                    '\n ENTRADA N°: ' + entradaData.Consecutivo);

                  const navigationExtras: NavigationExtras = { state: { consecutivo: entradaData.Consecutivo } };
                  this.router.navigate(['/pages/reportes/registro-entradas'], navigationExtras);
                } else {
                  this.pUpManager.showErrorAlert('No es posible subir el soporte.');
                }
              });
            }
          });

          // this.pUpManager.showSuccesToast('Registro Exitoso');
          // this.pUpManager.showSuccessAlert('Entrada registrada satisfactoriamente!' +
          //  '\n ENTRADA N°: ' + entradaData.Consecutivo);

          // const navigationExtras: NavigationExtras = { state: { consecutivo: entradaData.Consecutivo } };
          // this.router.navigate(['/pages/reportes/registro-entradas'], navigationExtras);
        } else {
          this.pUpManager.showErrorAlert('No es posible hacer el registro.');
        }
      });

    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }

}
