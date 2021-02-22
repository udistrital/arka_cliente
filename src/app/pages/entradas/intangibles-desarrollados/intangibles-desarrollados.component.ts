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
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-intangibles-desarrollados',
  templateUrl: './intangibles-desarrollados.component.html',
  styleUrls: ['./intangibles-desarrollados.component.scss'],
})
export class IntangiblesDesarrolladosComponent implements OnInit {
  soporteForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;

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


  tipoEntrada: any;
  formatoTipoMovimiento: any;

  @Input() actaRecibidoId: Number;
  @Input() movimientoId: Number;

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

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  /**
   * Método para obtener el año en curso
   */
  getVigencia() {
    this.vigencia = new Date().getFullYear();
  }

  getTipoEntrada() {
    this.entradasHelper.getTipoEntradaByAcronimoAndNombre('e_arka', 'Desarrollo interior').subscribe(res => {
      if (res !== undefined) {
        this.tipoEntrada = res;
      }
    });
  }

  getFormatoEntrada() {
    this.entradasHelper.getFormatoEntradaByName('Intangibles desarrollados').subscribe(res => {
      if (res !== null) {
        this.formatoTipoMovimiento = res;
      }
    });
  }
  /**
   * Método para enviar registro
   */
  async onSubmit() {
    if (this.validar) {
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        consecutivo: 'P8',
        documento_contable_id: 1, // REVISAR
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
        Id: this.movimientoId ? this.movimientoId : 0,
        SoporteMovimientoId: this.idDocumento,
        IdTipoMovimiento: this.tipoEntrada.Id,
      };

      this.entradasHelper.postEntrada(movimientoAdquisicion).subscribe((res: any) => {
        if (res !== null) {
          const elstring = JSON.stringify(res.Detalle);
          const posini = elstring.indexOf('consecutivo') + 16;
          if (posini !== -1) {
              const posfin = elstring.indexOf('\"', posini);
              const elresultado = elstring.substr(posini, posfin - posini - 1);
              detalle.consecutivo = detalle.consecutivo + elresultado;
          }
          (Swal as any).fire({
            type: 'success',
            title: 'Entrada N° ' + `${detalle.consecutivo}` + ' Registrada',
            text: 'La Entrada N° ' + `${detalle.consecutivo}` + ' ha sido registrada de forma exitosa',
          });
          const navigationExtras: NavigationExtras = { state: { consecutivo: detalle.consecutivo } };
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
