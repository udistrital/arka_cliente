import { Component, OnInit, Input, ViewChild, ɵConsole } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { Router, NavigationExtras } from '@angular/router';
import { NbStepperComponent } from '@nebular/theme';
import Swal from 'sweetalert2';
import { isObject } from 'rxjs/internal-compatibility';

@Component({
  selector: 'ngx-adiciones-mejoras',
  templateUrl: './adiciones-mejoras.component.html',
  styleUrls: ['./adiciones-mejoras.component.scss'],
})
export class AdicionesMejorasComponent implements OnInit {

  // Formularios
  contratoForm: FormGroup;
  facturaForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  // Validadores
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

  tipoEntrada: any;
  formatoTipoMovimiento: any;

  @ViewChild('stepper') stepper: NbStepperComponent;

  @Input() actaRecibidoId: Number;

  constructor(private router: Router, private entradasHelper: EntradaHelper, private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager, private fb: FormBuilder) {
    this.tipoContratoSelect = false;
    this.vigenciaSelect = false;
    this.contratos = new Array<Contrato>();
    this.contratoEspecifico = new Contrato;
    this.soportes = new Array<SoporteActaProveedor>();
    this.proveedor = '';
    this.fechaFactura = '';
    this.validar = false;
    this.iniciarContrato();
    this.getTipoEntrada();
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
      this.proveedor = this.soportes[0].Proveedor.NomProveedor;
      const date = this.soportes[0].FechaSoporte.toString().split('T');
      this.fechaFactura = date[0];
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
          this.loadSoporte();
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
        this.proveedor = this.soportes[i].Proveedor.NomProveedor;
        const date = this.soportes[i].FechaSoporte.toString().split('T');
        this.fechaFactura = date[0];
      }
    }
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

  getTipoEntrada() {
    this.entradasHelper.getTipoEntradaByAcronimoAndNombre('e_arka', 'Adiciones y mejoras').subscribe(res => {
      if (res !== undefined) {
        this.tipoEntrada = res;
      }
    });
  }

  getFormatoEntrada() {
    this.entradasHelper.getFormatoEntradaByName('Adqusición').subscribe(res => {
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
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        consecutivo: 'P1-' + this.actaRecibidoId + '-' + new Date().getFullYear(),
        documento_contable_id: 1, // REVISAR
        contrato_id: +this.contratoEspecifico.NumeroContratoSuscrito,
        vigencia_contrato: this.contratoForm.value.vigenciaCtrl,
        tipo_contrato: this.opcionTipoContrato === '14' ? 'Orden de Servicios' :
          this.opcionTipoContrato === '15' ? 'Orden de Compra' : '',
      };
      const movimientoAdquisicion = {
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: JSON.stringify(detalle),
        Activo: true,
        FormatoTipoMovimientoId: {
          Id: this.formatoTipoMovimiento[0].Id,
        },
        EstadoMovimientoId: {
          Id: 2, // Movimiento adecuado para registrar una entrada como aprobada
        },
        SoporteMovimientoId: 0,
        IdTipoMovimiento: this.tipoEntrada.Id,
      };
      this.entradasHelper.postEntrada(movimientoAdquisicion).subscribe((res: any) => {
        if (res !== null) {
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
