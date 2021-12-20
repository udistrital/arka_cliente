import { Component, OnInit, Input, ViewChild, ɵConsole } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { EstadoMovimiento, TrMovimiento } from '../../../@core/data/models/entrada/entrada';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { Router, NavigationExtras } from '@angular/router';
import { NbStepperComponent } from '@nebular/theme';
import Swal from 'sweetalert2';
import { isObject } from 'rxjs/internal-compatibility';
import { Soporte } from '../soporteHelper';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-intangibles-adquiridos',
  templateUrl: './intangibles-adquiridos.component.html',
  styleUrls: ['./intangibles-adquiridos.component.scss'],
})
export class IntangiblesAdquiridosComponent implements OnInit {

  // Formularios
  contratoForm: FormGroup;
  facturaForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  // Validadores
  checked: boolean;
  tipoContratoSelect: boolean;
  vigenciaSelect: boolean;
  // Año Actual
  vigencia: number;
  // Contratos
  contratos: Array<Contrato>;
  // Contrato Seleccionado
  contratoEspecifico: Contrato;
  // Número de Contrato
  contratoInput: string;
  // Soportes
  soportes: Array<SoporteActaProveedor>;
  proveedor: string;
  fechaFactura: string;
  observaciones: string;
  validar: boolean;
  // Selects
  opcionTipoContrato: string;
  opcionvigencia: string;

  formatoTipoMovimiento: any;
  registrando: boolean;

  @ViewChild('stepper') stepper: NbStepperComponent;

  @Input() actaRecibidoId: number;
  @Input() entradaId: any;
  @Input() EntradaEdit: any;

  constructor(private router: Router, private entradasHelper: EntradaHelper, private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager, private fb: FormBuilder, private soporteHelper: Soporte, private translate: TranslateService) {
    this.checked = false;
    this.tipoContratoSelect = false;
    this.vigenciaSelect = false;
    this.contratos = new Array<Contrato>();
    this.contratoEspecifico = new Contrato;
    this.soportes = new Array<SoporteActaProveedor>();
    this.proveedor = '';
    this.fechaFactura = '';
    this.validar = false;
    this.iniciarContrato();
    this.getFormatoEntrada();
  }

  ngOnInit() {
    this.contratoForm = this.fb.group({
      contratoCtrl: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{2,4}$')],
      ],
      vigenciaCtrl: ['', [Validators.required]],
    });
    this.facturaForm = this.fb.group({
      facturaCtrl: ['', Validators.nullValidator],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.ordenadorForm = this.fb.group({
      ordenadorCtrl: ['', Validators.nullValidator],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.nullValidator],
    });
    this.getVigencia();
  }

  /**
   * Métodos para cargar los contratos.
   */
  loadContratos(): void {
    this.contratos = [];
    if (this.opcionTipoContrato !== '' && this.opcionvigencia) {
      this.entradasHelper.getContratos(this.opcionTipoContrato, this.opcionvigencia).subscribe(res => {
        if (res !== null) {
          if (isObject(res.contratos_suscritos.contrato_suscritos))
          for (const index of Object.keys(res.contratos_suscritos.contrato_suscritos)) {
            const contratoAux = new Contrato;
            contratoAux.NumeroContratoSuscrito = res.contratos_suscritos.contrato_suscritos[index].numero_contrato;
            this.contratos.push(contratoAux);
          }
        }
      });
    }
  }

  loadContratoEspecifico(): void {
    this.entradasHelper.getContrato(this.contratoInput, this.opcionvigencia).subscribe(res => {
      if (res !== null) {
        const ordenadorAux = new OrdenadorGasto;
        const supervisorAux = new Supervisor;
        ordenadorAux.Id = res.contrato.ordenador_gasto.id;
        ordenadorAux.NombreOrdenador = res.contrato.ordenador_gasto.nombre_ordenador;
        ordenadorAux.RolOrdenadorGasto = res.contrato.ordenador_gasto.rol_ordenador;
        supervisorAux.Id = res.contrato.supervisor.id;
        supervisorAux.Nombre = res.contrato.supervisor.nombre;
        supervisorAux.Cargo = res.contrato.supervisor.cargo;
        supervisorAux.Dependencia = res.contrato.supervisor.dependencia_supervisor;
        supervisorAux.Sede = res.contrato.supervisor.sede_supervisor;
        supervisorAux.DocumentoIdentificacion = res.contrato.supervisor.documento_identificacion;
        this.contratoEspecifico.OrdenadorGasto = ordenadorAux;
        this.contratoEspecifico.NumeroContratoSuscrito = res.contrato.numero_contrato_suscrito;
        this.contratoEspecifico.TipoContrato = res.contrato.tipo_contrato;
        this.contratoEspecifico.FechaSuscripcion = res.contrato.fecha_suscripcion;
        this.contratoEspecifico.Supervisor = supervisorAux;
      }
    });
  }

  /**
   * Métodos para validar campos requeridos en el formulario.
   */
  onContratoSubmit() {
    let existe = false;
    if (this.contratos.length > 0) {
      const aux = this.contratoForm.value.contratoCtrl;
      if (aux !== '') {
        for (const i in this.contratos) {
          if (this.contratos[i].NumeroContratoSuscrito.toString() === aux) {
            this.contratoInput = aux;
            existe = true;
          }
        }
        if (existe) {
          this.loadContratoEspecifico();
          this.soporteHelper.cargarSoporte(this.actaRecibidoId).then(info => {
            this.fechaFactura = info.fecha,
            this.soportes = info.soportes,
            this.proveedor = info.proveedor;
          });
        } else {
          this.stepper.previous();
          this.iniciarContrato();
          this.pUpManager.showErrorAlert('El contrato seleccionado no existe!');
        }
      }
    }
  }

  onObservacionSubmit() {
    this.validar = true;
  }

  /**
   * Métodos para cambiar estados de los select.
   */
  changeSelectTipoContrato(event) {
    if (!this.tipoContratoSelect) {
      this.tipoContratoSelect = !this.tipoContratoSelect;
    }
    this.opcionTipoContrato = event.target.options[event.target.options.selectedIndex].value;
    this.loadContratos();
  }

  changeSelectVigencia(event) {
    if (!this.vigenciaSelect) {
      this.vigenciaSelect = !this.vigenciaSelect;
    }
    this.opcionvigencia = event.target.options[event.target.options.selectedIndex].value;
    this.loadContratos();
  }

  changeSelectSoporte(event) {
    const soporteId: string = event.target.options[event.target.options.selectedIndex].value;
    for (const i in this.soportes) {
      if (this.soportes[i].Id.toString() === soporteId) {
        const date = this.soportes[i].FechaSoporte.toString().split('T');
        this.fechaFactura = date[0];
      }
    }
  }

  changeCheck() {
    this.checked = !this.checked;
  }

  iniciarContrato() {
    const ordenadorAux = new OrdenadorGasto;
    const supervisorAux = new Supervisor;
    ordenadorAux.NombreOrdenador = '';
    ordenadorAux.RolOrdenadorGasto = '';
    supervisorAux.Nombre = '';
    this.contratoEspecifico.OrdenadorGasto = ordenadorAux;
    this.contratoEspecifico.Supervisor = supervisorAux;
  }

  getFormatoEntrada() {
    this.entradasHelper.getFormatoEntradaByName('Intangibles adquiridos').subscribe(res => {
      if (res !== null) {
        this.formatoTipoMovimiento = res;
      }
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
  onSubmit() {
    if (this.validar) {
      this.registrando = true;
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        consecutivo: 'P8',
        contrato_id: +this.contratoEspecifico.NumeroContratoSuscrito,
        vigencia_contrato: this.contratoForm.value.vigenciaCtrl,
        amortizacion: 0, // REVISAR PENDIENTE A APROBACION ALMACEN
        vida_util: 0, // REVISAR PENDIENTE A APROBACION ALMACEN
        tipo_contrato: this.opcionTipoContrato === '14' ? 'Orden de Servicios' :
        this.opcionTipoContrato === '15' ? 'Orden de Compra' : '',
      };
      const movimientoAdquisicion = <TrMovimiento>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: JSON.stringify(detalle),
        Activo: true,
        FormatoTipoMovimientoId: {
          Id: this.formatoTipoMovimiento[0].Id,
        },
        SoporteMovimientoId: 0,
        EstadoMovimientoId: new EstadoMovimiento,
      };
      this.entradasHelper.postEntrada(movimientoAdquisicion).subscribe((res: any) => {
        if (res !== null) {
          this.registrando = false;
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.movimientos.entradas.registroTtlOk', { CONSECUTIVO: res.Consecutivo }),
            text: this.translate.instant('GLOBAL.movimientos.entradas.registroTxtOk', { CONSECUTIVO: res.Consecutivo }),
            showConfirmButton: false,
            timer: 2000,
          });
          const navigationExtras: NavigationExtras = { state: { consecutivo: res.Consecutivo } };
        //  this.router.navigate(['/pages/reportes/registro-entradas'], navigationExtras);
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
