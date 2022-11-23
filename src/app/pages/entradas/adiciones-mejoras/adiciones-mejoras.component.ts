import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { PopUpManager } from '../../../managers/popUpManager';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator, MatStepper, MatTableDataSource } from '@angular/material';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommonEntradas } from '../CommonEntradas';
import { CommonContrato } from '../CommonContrato';
import { CommonElementos } from '../CommonElementos';
import { CommonFactura } from '../CommonFactura';

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
  // Contratos
  vigencia: number;
  tipos: Array<any>;
  contratos: Contrato[];
  // Contrato Seleccionado
  contratoEspecifico: Contrato;
  // Soportes
  soportes: Array<SoporteActa>;
  fechaFactura: string;
  // Elementos
  dataSource: MatTableDataSource<any>;
  displayedColumns: any;
  elementos: any[];

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('paginator') paginator: MatPaginator;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    private commonContrato: CommonContrato,
    private commonElementos: CommonElementos,
    private commonFactura: CommonFactura,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    this.displayedColumns = this.commonElementos.columnsElementos;
    this.fechaFactura = '';
  }

  ngOnInit() {
    this.loadContratoInfo();
    this.elementosForm = this.commonElementos.formElementos;
    this.contratoForm = this.commonContrato.formContrato;
    this.ordenadorForm = this.commonContrato.ordenadorForm;
    this.supervisorForm = this.commonContrato.supervisorForm;
    this.facturaForm = this.commonFactura.formFactura;
    this.observacionForm = this.common.formObservaciones;
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
  }

  async loadContratoInfo() {
    this.contratoEspecifico = new Contrato;
    this.vigencia = this.commonContrato.currentVigencia;
    this.tipos = await this.commonContrato.loadTipoContratos();
    this.soportes = await this.commonFactura.loadSoportes(this.actaRecibidoId);
  }

  addElemento() {
    const form = this.commonElementos.elemento;
    (this.elementosForm.get('elementos') as FormArray).push(form);
    this.dataSource.data = this.dataSource.data.concat({});
    this.cambiosPlaca(form.get('Placa').valueChanges);
  }

  private cambiosPlaca(valueChanges: Observable<any>) {
    valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((val) => this.commonElementos.loadElementos(val)),
    ).subscribe((response: any) => {
      this.elementos = response.queryOptions;
    });
  }

  async onContratoSubmit() {
    const existe = this.commonContrato.checkContrato(this.contratos, this.contratoForm.value.contratoCtrl);
    if (!existe) {
      this.stepper.previous();
      this.contratoEspecifico = new Contrato;
      this.pUpManager.showErrorAlert('El contrato seleccionado no existe!');
      return;
    }

    this.contratoEspecifico = await this.commonContrato.loadContrato(this.contratoForm.value.contratoCtrl, this.contratoForm.value.vigenciaCtrl);
  }

  async getContratos() {
    this.contratos = await this.commonContrato.loadContratos(this.contratoForm.value.tipoCtrl, this.contratoForm.value.vigenciaCtrl);
  }

  changeSelectSoporte() {
    this.fechaFactura = this.commonFactura.getFechaFactura(this.soportes, this.facturaForm.value.facturaCtrl);
  }

  onObservacionSubmit() {
    this.pUpManager.showAlertWithOptions(this.common.optionsSubmit)
      .then((result) => {
        if (result.value) {
          this.onSubmit();
        }
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
