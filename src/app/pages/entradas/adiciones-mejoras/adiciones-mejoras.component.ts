import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PopUpManager } from '../../../managers/popUpManager';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { Ordenador, Supervisor } from '../../../@core/data/models/terceros_criterio';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatStepper } from '@angular/material/stepper';
import { MatPaginator } from '@angular/material/paginator';
import { CommonEntradas } from '../CommonEntradas';
import { CommonContrato } from '../CommonContrato';
import { CommonElementos } from '../CommonElementos';
import * as moment from 'moment';

@Component({
  selector: 'ngx-adiciones-mejoras',
  templateUrl: './adiciones-mejoras.component.html',
  styleUrls: ['./adiciones-mejoras.component.scss'],
})
export class AdicionesMejorasComponent implements OnInit {

  // Formularios
  elementosForm: FormGroup;
  contratoForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  // Elementos
  dataSource: MatTableDataSource<any>;
  displayedColumns: any;
  elementos: any[];
  // Ordenador y Supervisor
  ordenadoresFiltrados: Observable<Ordenador[]>;
  supervisoresFiltrados: Observable<Supervisor[]>;

  @ViewChild('stepper', { static: true }) stepper: MatStepper;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;

  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    public commonContrato: CommonContrato,
    private commonElementos: CommonElementos,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    this.displayedColumns = this.commonElementos.columnsAcciones.concat(
      this.commonElementos.columnsMejorados.concat(
        this.commonElementos.columnsElementos));
  }

  ngOnInit() {
    this.elementosForm = this.commonElementos.formElementos;
    this.contratoForm = this.commonContrato.formContrato;
    this.ordenadorForm = this.commonContrato.ordenadorForm;
    this.supervisorForm = this.commonContrato.supervisorForm;
    this.observacionForm = this.common.formObservaciones;
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.ordenadoresFiltrados = this.commonContrato.loadOrdenadores(this.ordenadorForm.get('ordenadorCtrl'));
    this.supervisoresFiltrados = this.commonContrato.loadSupervisores(this.supervisorForm.get('supervisorCtrl'));
  }

  addElemento() {
    const form = this.commonElementos.formElementos_('ENT_AM');
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

  onContratoSubmit() {
    // contrato fijo en 000, no se valida ni se consulta
  }

  muestraOrdenador = (ord: Ordenador): string => this.commonContrato.muestraOrdenador(ord);
  muestraSupervisor = (sup: Supervisor): string => this.commonContrato.muestraSupervisor(sup);

  onObservacionSubmit() {
    this.pUpManager.showAlertWithOptions(this.common.optionsSubmit)
      .then((result) => {
        if (result.value) {
          this.onSubmit();
        }
      });
  }

  onSubmit() {
    const detalle = {
      elementos: this.elementosForm.get('elementos').value.map(el => ({
        Id: el.Id,
        ValorLibros: el.valorLibros,
        ValorResidual: el.valorResidual,
        VidaUtil: el.vidaUtil,
      })),
      FechaCorte: moment().format('YYYY-MM-DD'),
      contrato_id: 0,
      vigencia_contrato: String(this.commonContrato.currentVigencia),
      supervisor: this.supervisorForm.value.supervisorCtrl.Id,
      ordenador_gasto_id: this.ordenadorForm.value.ordenadorCtrl.Id,
    };

    const transaccion = this.common.crearTransaccionEntrada(
      this.observacionForm.value.observacionCtrl, detalle, 'ENT_AM', 0,
    );
    this.data.emit(transaccion);
  }
}