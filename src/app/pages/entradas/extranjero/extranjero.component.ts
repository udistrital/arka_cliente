import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NbStepperComponent } from '@nebular/theme';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { isObject } from 'rxjs/internal-compatibility';
import { Soporte } from '../soporteHelper';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-extranjero',
  templateUrl: './extranjero.component.html',
  styleUrls: ['./extranjero.component.scss'],
})

export class ExtranjeroComponent implements OnInit {

  // Formularios
  contratoForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  facturaForm: FormGroup;
  observacionForm: FormGroup;

  // Validadores
  tipoContratoSelect: boolean;
  vigenciaSelect: boolean;

  vigencia: number; // Año Actual
  tipos: Array<any>;
  contratos: Array<Contrato>;
  contratoEspecifico: Contrato; // Contrato Seleccionado
  private contratoInput: string; // Número de Contrato
  soportes: Array<SoporteActaProveedor>; // Soportes
  proveedor: string;
  fechaFactura: string;
  divisas: string;
  validar: boolean;
  private opcionTipoContrato: string;
  private opcionvigencia: string;

  @ViewChild('stepper') stepper: NbStepperComponent;

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private pUpManager: PopUpManager,
    private entradasHelper: EntradaHelper,
    private fb: FormBuilder,
    private soporteHelper: Soporte,
  ) {
    this.tipoContratoSelect = false;
    this.vigenciaSelect = false;
    this.contratos = new Array<Contrato>();
    this.contratoEspecifico = new Contrato;
    this.soportes = new Array<SoporteActaProveedor>();
    this.proveedor = '';
    this.fechaFactura = '';
    this.validar = false;
    this.iniciarContrato();
  }

  ngOnInit() {
    this.getDivisas();
    this.contratoForm = this.fb.group({
      contratoCtrl: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{2,4}$')],
      ],
      vigenciaCtrl: ['', [Validators.required]],
    });
    this.facturaForm = this.fb.group({
      facturaCtrl: ['', Validators.nullValidator],
      regImportCtrl: ['', Validators.maxLength(20)],
      divisaCtrl: ['', Validators.nullValidator],
      trmCtrl: ['', [
        Validators.required,
        Validators.max(9999999999),
      ]],
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
  private getDivisas() {
    this.entradasHelper.getDivisas().subscribe(res => {
      if (res) {
        this.divisas = res.Data;
        // console.log(this.divisas);
      }
    });
  }

  /**
   * Método para obtener el año en curso
   */
  private getVigencia() {
    this.vigencia = new Date().getFullYear();
    this.entradasHelper.getTiposContrato().subscribe((res: any) => {
      this.tipos = res;
    });
  }

  private loadContratos(): void {
    this.contratos = [];
    if (this.opcionTipoContrato && this.opcionvigencia) {
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

  private loadContratoEspecifico(): void {
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

  // Métodos para cambiar estados de los select.

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

  private iniciarContrato() {
    const ordenadorAux = new OrdenadorGasto;
    const supervisorAux = new Supervisor;
    ordenadorAux.NombreOrdenador = '';
    ordenadorAux.RolOrdenadorGasto = '';
    supervisorAux.Nombre = '';
    this.contratoEspecifico.OrdenadorGasto = ordenadorAux;
    this.contratoEspecifico.Supervisor = supervisorAux;
  }

  // Métodos para validar campos requeridos en el formulario.

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

// Método para enviar registro
  onSubmit() {
    if (this.validar) {
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        contrato_id: +this.contratoEspecifico.NumeroContratoSuscrito,
        vigencia_contrato: this.contratoForm.value.vigenciaCtrl,
        num_reg_importacion: this.facturaForm.value.regImportCtrl,
        divisa: this.facturaForm.value.divisaCtrl,
        TRM: this.facturaForm.value.trmCtrl,
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: detalle,
        FormatoTipoMovimientoId: 'ENT_CE',
        SoporteMovimientoId: 0,
      };

      this.data.emit(transaccion);
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }

}
