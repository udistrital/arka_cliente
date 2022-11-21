import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator, MatStepper, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { CommonEntradas } from '../CommonEntradas';

@Component({
  selector: 'ngx-adiciones-mejoras',
  templateUrl: './adiciones-mejoras.component.html',
  styleUrls: ['./adiciones-mejoras.component.scss'],
})

export class AdicionesMejorasComponent implements OnInit {

  // Formularios
  elementosForm: FormGroup;
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
  tipos: Array<any>;
  contratos: Array<Contrato>;
  // Contrato Seleccionado
  contratoEspecifico: Contrato;
  // Soportes
  soportes: Array<SoporteActaProveedor>;
  fechaFactura: string;
  dataSource: MatTableDataSource<any>;
  displayedColumns: any;
  elementos: any[];
  // Selects
  opcionTipoContrato: string;
  opcionvigencia: string;

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('paginator') paginator: MatPaginator;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    private entradasHelper: EntradaHelper,
    private movimientos: MovimientosHelper,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private translate: TranslateService,
  ) {
    this.displayedColumns = this.common.columnsElementos;
    this.tipoContratoSelect = false;
    this.vigenciaSelect = false;
    this.contratos = new Array<Contrato>();
    this.contratoEspecifico = new Contrato;
    this.soportes = new Array<SoporteActaProveedor>();
    this.fechaFactura = '';
    this.iniciarContrato();
  }

  ngOnInit() {
    this.contratoForm = this.fb.group({
      contratoCtrl: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{1,4}$')],
      ],
      vigenciaCtrl: ['', [Validators.required]],
    });
    this.facturaForm = this.fb.group({
      facturaCtrl: ['', Validators.required],
    });
    this.elementosForm = this.common.formElementos;
    this.observacionForm = this.common.formObservaciones;
    this.ordenadorForm = this.fb.group({
      ordenadorCtrl: ['', Validators.nullValidator],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.nullValidator],
    });
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.getVigencia();
  }

  addElemento() {
    (this.elementosForm.get('elementos') as FormArray).push(this.elemento);
    this.dataSource.data = this.dataSource.data.concat({});
  }

  get elemento(): FormGroup {
    const form = this.common.elemento;
    this.cambiosPlaca(form.get('Placa').valueChanges);
    return form;
  }

  getActualIndex(index: number) {
    return index + this.paginator.pageSize * this.paginator.pageIndex;
  }

  removeElemento(index: number) {
    index = this.paginator.pageIndex > 0 ? index + (this.paginator.pageIndex * this.paginator.pageSize) : index;
    (this.elementosForm.get('elementos') as FormArray).removeAt(index);
    const data = this.dataSource.data;
    data.splice(index, 1);
    this.dataSource.data = data;
  }

  private cambiosPlaca(valueChanges: Observable<any>) {
    valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((val) => this.common.loadElementos(val)),
    ).subscribe((response: any) => {
      this.elementos = response.queryOptions;
    });
  }

  /**
   * Métodos para cargar los contratos.
   */
  loadContratos(): void {
    this.contratos = [];
    if (this.opcionTipoContrato !== '' && this.opcionvigencia) {
      this.entradasHelper.getContratos(this.opcionTipoContrato, this.opcionvigencia).subscribe(res => {
        if (res.contratos_suscritos && res.contratos_suscritos.contrato_suscritos && res.contratos_suscritos.contrato_suscritos.length) {
          this.contratos = res.contratos_suscritos.contrato_suscritos.map(c => ({
            NumeroContratoSuscrito: c.numero_contrato,
          }));
        }
      });
    }
  }

  loadContratoEspecifico(): void {
    this.entradasHelper.getContrato(this.contratoForm.value.contratoCtrl, this.opcionvigencia).subscribe(res => {
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
      this.soportes = res;
    });
  }

  // Métodos para validar campos requeridos en el formulario.
  onContratoSubmit() {
    let existe = false;
    if (this.contratos.length && this.contratoForm.value.contratoCtrl) {
      existe = !!this.contratos.find(c => c.NumeroContratoSuscrito === this.contratoForm.value.contratoCtrl);
      if (existe) {
        this.loadContratoEspecifico();
        this.loadSoporte();
        return;
      }
    }

    this.stepper.previous();
    this.iniciarContrato();
    this.pUpManager.showErrorAlert('El contrato seleccionado no existe!');
    return;
  }

  onObservacionSubmit() {
    this.pUpManager.showAlertWithOptions(this.common.optionsSubmit)
      .then((result) => {
        if (result.value) {
          this.onSubmit();
        }
      });
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
    this.fechaFactura = soporteId ? this.soportes.find(s => s.Id === +soporteId).FechaSoporte.toString() : '';
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
    this.entradasHelper.getTiposContrato().subscribe((res: any) => {
      this.tipos = res;
    });
  }

  // Método para enviar registro
  onSubmit() {
    const detalle = {
      elementos: this.elementosForm.get('elementos').value.map(el => el.Id),
      factura: +this.facturaForm.value.facturaCtrl,
      acta_recibido_id: +this.actaRecibidoId,
      contrato_id: +this.contratoEspecifico.NumeroContratoSuscrito,
      vigencia_contrato: this.contratoForm.value.vigenciaCtrl,
    };

    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_AM', 0);
    this.data.emit(transaccion);
  }

}
