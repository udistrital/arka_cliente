import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { UtilidadesService } from '../../../@core/utils';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';

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
  validar: boolean;
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
    private entradasHelper: EntradaHelper,
    private movimientos: MovimientosHelper,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private translate: TranslateService,
    private utils: UtilidadesService,
  ) {
    this.displayedColumns = ['acciones', 'placa', 'entrada', 'fechaEntrada', 'salida', 'fechaSalida'];
    this.tipoContratoSelect = false;
    this.vigenciaSelect = false;
    this.contratos = new Array<Contrato>();
    this.contratoEspecifico = new Contrato;
    this.soportes = new Array<SoporteActaProveedor>();
    this.fechaFactura = '';
    this.validar = false;
    this.iniciarContrato();
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
      facturaCtrl: ['', Validators.required],
    });
    this.elementosForm = this.fb.group({
      elementos: this.fb.array([], { validators: this.validateElementos() }),
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
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.getVigencia();
  }

  addElemento() {
    (this.elementosForm.get('elementos') as FormArray).push(this.elemento);
    this.dataSource.data = this.dataSource.data.concat({});
  }

  get elemento(): FormGroup {
    const disabled = true;
    const form = this.fb.group({
      Id: [0],
      Placa: [
        {
          value: '',
          disabled: false,
        },
      ],
      entrada: [
        {
          value: '',
          disabled,
        },
      ],
      fechaEntrada: [
        {
          value: '',
          disabled,
        },
      ],
      salida: [
        {
          value: '',
          disabled,
        },
      ],
      fechaSalida: [
        {
          value: '',
          disabled,
        },
      ],
    });
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

  public getDetalleElemento(index: number) {
    const actaId = this.getElementoForm(index).value.Placa.Id;
    // this.spinner = 'Consultando detalle del elemento';
    this.movimientos.getHistorialElemento(actaId, true, true).subscribe(res => {
      // this.spinner = '';
      const salidaOk = res && res.Elemento && res.Salida && res.Salida.EstadoMovimientoId.Nombre === 'Salida Aprobada';
      if (!salidaOk) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.errorPlaca'));
        return;
      }

      const noTraslado = res && (!res.Traslados || res.Traslados[0].EstadoMovimientoId.Nombre === 'Traslado Aprobado');
      const noBaja = res && !res.Baja;
      const assignable = noTraslado && noBaja;

      if (assignable) {
        const salida = JSON.parse(res.Salida.Detalle).consecutivo;
        const entrada = JSON.parse(res.Salida.MovimientoPadreId.Detalle).consecutivo;
        (this.elementosForm.get('elementos') as FormArray).at(index).patchValue({
          Id: res.Elemento.Id,
          entrada,
          fechaEntrada: this.utils.formatDate(res.Salida.MovimientoPadreId.FechaCreacion),
          salida,
          fechaSalida: this.utils.formatDate(res.Salida.FechaCreacion),
        });
      } else if (!noTraslado) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.errorTr'));
      } else if (!noBaja) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.bajas.errorBj'));
      }
    });
  }

  private getElementoForm(index: number) {
    return (this.elementosForm.get('elementos') as FormArray).at(index);
  }

  private cambiosPlaca(valueChanges: Observable<any>) {
    valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((val) => this.loadElementos(val)),
    ).subscribe((response: any) => {
      this.elementos = response.queryOptions;
    });
  }

  private loadElementos(text: any) {
    const queryOptions$ = !text.Placa && text.length > 3 ?
      this.actaRecibidoHelper.getAllElemento('sortby=Placa&order=desc&limit=-1&fields=Id,Placa&query=Placa__icontains:' + text) :
      new Observable((obs) => { obs.next([]); });
    return combineLatest([queryOptions$]).pipe(
      map(([queryOptions_$]) => ({
        queryOptions: queryOptions_$,
      })),
    );
  }

  public muestraPlaca(field): string {
    return field && field.Placa ? field.Placa : '';
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
    if (this.validar) {
      const detalle = {
        elementos: this.elementosForm.get('elementos').value.map(el => el.Id),
        factura: +this.facturaForm.value.facturaCtrl,
        acta_recibido_id: +this.actaRecibidoId,
        contrato_id: +this.contratoEspecifico.NumeroContratoSuscrito,
        vigencia_contrato: this.contratoForm.value.vigenciaCtrl,
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: detalle,
        FormatoTipoMovimientoId: 'ENT_AM',
        SoporteMovimientoId: 0,
      };
      this.data.emit(transaccion);
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }

  private validateElementos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const noFilas = !control.value.length;
      const noSeleccionado = !noFilas && !control.value.every(el => el.Placa && el.Placa.Id && el.Id);
      const duplicados = !noSeleccionado && control.value.map(el => el.Id)
        .some((element, index) => {
          return control.value.map(el => el.Id).indexOf(element) !== index;
        });

      return (noFilas || noSeleccionado) ? { errorNoElementos: true } : duplicados ? { errorDuplicados: true } : null;
    };
  }

}
