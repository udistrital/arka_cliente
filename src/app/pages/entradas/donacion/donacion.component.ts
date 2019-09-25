import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'ngx-donacion',
  templateUrl: './donacion.component.html',
  styleUrls: ['./donacion.component.scss'],
})
export class DonacionComponent implements OnInit {

  // Formularios
  contratoForm: FormGroup;
  facturaForm: FormGroup;
  observacionForm: FormGroup;
  solicitanteForm: FormGroup;
  // Validadores
  tipoContratoSelect: boolean;
  vigenciaSelect: boolean;
  solicitanteSelect: boolean;
  // Año Actual
  vigencia: number;
  // Contratos
  contratos: Array<Contrato>;
  // Contrato Seleccionado
  contratoEspecifico: Contrato;
  // Número de Contrato
  contratoInput: string;
  // Soportes
  soportes: Array<SoporteActa>;
  proveedor: string;
  fechaFactura: string;
  observaciones: string;
  validar: boolean;
  ordenadorId: number;
  cargoOrdenador: string;
  // Selects
  opcionTipoContrato: string;
  opcionvigencia: string;
  opcionSolicitante: string;
  fechaSolicitante: string;
  ordenadores: Array<OrdenadorGasto>;

  @Input() actaRecibidoId: string;

  constructor(private router: Router, private entradasHelper: EntradaHelper, private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager, private fb: FormBuilder) {
    this.tipoContratoSelect = false;
    this.vigenciaSelect = false;
    this.solicitanteSelect = false;
    this.contratos = new Array<Contrato>();
    this.contratoEspecifico = new Contrato;
    this.soportes = new Array<SoporteActa>();
    this.ordenadores = new Array<OrdenadorGasto>();
    this.proveedor = '';
    this.fechaFactura = '';
    this.validar = false;
    this.ordenadorId = 0;
    this.iniciarContrato();
  }

  ngOnInit() {
    this.contratoForm = this.fb.group({
      contratoCtrl: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{2,4}$')],
      ],
    });
    this.facturaForm = this.fb.group({
      facturaCtrl: ['', Validators.nullValidator],
    });
    this.solicitanteForm = this.fb.group({
      solicitanteCtrl: ['', Validators.required],
      fechaCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.solicitanteForm = this.fb.group({
      solicitanteCtrl: ['', Validators.nullValidator],
    });
    this.getVigencia();
  }

  /**
   * Métodos para cargar los contratos.
   */
  loadContratos(): void {
    if (this.opcionTipoContrato !== '' && this.opcionvigencia) {
      this.entradasHelper.getContratos(this.opcionTipoContrato, this.opcionvigencia).subscribe(res => {
        if (res !== null) {
          while (this.contratos.length > 0) {
            this.contratos.pop();
          }
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
            const soporte = new SoporteActa;
            soporte.Id = res[index].Id;
            soporte.Consecutivo = res[index].Consecutivo;
            soporte.ProveedorId = res[index].ProveedorId;
            soporte.FechaSoporte = res[index].FechaSoporte;
            this.soportes.push(soporte);
          }
        }
      }
    });
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

  /**
   * Métodos para validar campos requeridos en el formulario.
   */
  onContratoSubmit() {
    if (this.contratos.length > 0) {
      const aux = this.contratoForm.value.contratoCtrl;
      let existe = false;
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
          this.iniciarContrato();
          this.pUpManager.showErrorAlert('El contrato seleccionado no existe!');
        }
      }
    }
    this.contratoForm.markAsDirty();
  }

  onSolicitanteSubmit() {
    if (this.ordenadorId !== 0) {
      this.validar = true;
    }
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
        this.proveedor = this.soportes[i].ProveedorId.toString();
        this.fechaFactura = this.soportes[i].FechaSoporte.toString();
      }
    }
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
    this.ordenadorId =  0;
    for (const i in this.ordenadores) {
      if (this.ordenadores[i].NombreOrdenador === this.solicitanteForm.value.solicitanteCtrl) {
        this.ordenadorId = this.ordenadores[i].Id;
        this.cargoOrdenador = this.ordenadores[i].RolOrdenadorGasto;
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
      const entradaData = new Entrada;
      const tipoEntrada = new TipoEntrada;

      // CAMPOS OBLIGATORIOS
      entradaData.ActaRecibidoId = +this.actaRecibidoId;
      entradaData.Activo = true;
      entradaData.Consecutivo = 'P8-4-2019'; // REVISAR
      entradaData.DocumentoContableId = 1; // REVISAR
      tipoEntrada.Id = 4;
      entradaData.TipoEntradaId = tipoEntrada;
      entradaData.Vigencia = this.vigencia.toString(); // REVISAR
      entradaData.Observacion = this.observacionForm.value.observacionCtrl;
      // CAMPOS REQUERIDOS PARA ADQUISICIÓN
      entradaData.ContratoId = +this.contratoEspecifico.NumeroContratoSuscrito;
      entradaData.Solicitante = +this.ordenadorId;
      // // ENVIA LA ENTRADA AL MID
      this.entradasHelper.postEntrada(entradaData).subscribe(res => {
        if (res !== null) {
          this.pUpManager.showSuccesToast('Registro Exitoso');
          this.pUpManager.showSuccessAlert('Entrada registrada satisfactoriamente!' +
            '\n ENTRADA N°: ' + entradaData.Consecutivo);

          const navigationExtras: NavigationExtras = { state: { consecutivo: entradaData.Consecutivo } };
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
