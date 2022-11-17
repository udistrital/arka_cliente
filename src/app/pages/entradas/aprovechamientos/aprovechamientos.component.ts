import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Supervisor } from '../../../@core/data/models/terceros_criterio';
import { PopUpManager } from '../../../managers/popUpManager';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService } from '@ngx-translate/core';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { UtilidadesService } from '../../../@core/utils';

@Component({
  selector: 'ngx-aprovechamientos',
  templateUrl: './aprovechamientos.component.html',
  styleUrls: ['./aprovechamientos.component.scss'],
})
export class AprovechamientosComponent implements OnInit {

  // Formularios
  elementosForm: FormGroup;
  supervisorForm: FormGroup;
  observacionForm: FormGroup;
  flag = true;
  dependenciaSupervisor: String;

  // Validadores
  dataSource: MatTableDataSource<any>;
  displayedColumns: any;
  elementos: any[];
  validar: boolean = false;
  cargando_supervisores: boolean = true;

  private Supervisores: Supervisor[];
  supervisoresFiltrados: Observable<Supervisor[]>;

  @ViewChild('paginator') paginator: MatPaginator;

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private movimientos: MovimientosHelper,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private utils: UtilidadesService,
    private entradasHelper: EntradaHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private translate: TranslateService) {
    this.displayedColumns = ['acciones', 'placa', 'entrada', 'fechaEntrada', 'salida', 'fechaSalida'];
    this.validar = false;
    this.dependenciaSupervisor = '';
  }

  ngOnInit() {
    this.elementosForm = this.fb.group({
      elementos: this.fb.array([], { validators: this.validateElementos() }),
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.loadSupervisores();
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

  private filtroSupervisores(nombre: string): Supervisor[] {
    // if (nombre.length >= 4 ) {
    const valorFiltrado = nombre.toLowerCase();
    return this.Supervisores.filter(sup => sup.Nombre.toLowerCase().includes(valorFiltrado));
    // } else return [];
  }


  private loadSupervisores(): void {
    this.entradasHelper.getSupervisores('supervisor_contrato?limit=-1').subscribe(res => {
      if (Array.isArray(res)) {
        this.Supervisores = res;
        this.supervisoresFiltrados = this.supervisorForm.get('supervisorCtrl').valueChanges
          .pipe(
            startWith(''),
            map(val => typeof val === 'string' ? val : this.muestraSupervisor(val)),
            map(nombre => this.filtroSupervisores(nombre)),
          );
        // console.log({supervisores: this.Supervisores});
        this.cargando_supervisores = false;
      }
    });
  }

  muestraSupervisor(sup: Supervisor): string {
    if (sup.Nombre !== undefined) {
      return sup.Nombre;
    } else {
      return '';
    }
  }

  datosSupervisor(param: string): string {
    const supervisorSeleccionado: Supervisor = <Supervisor>this.supervisorForm.value.supervisorCtrl;
    if (supervisorSeleccionado) {
      if (this.flag) {
        this.flag = false;
        this.entradasHelper.getDependenciaSupervisor('dependencia_SIC', supervisorSeleccionado.DependenciaSupervisor).subscribe(res => {
          if (Array.isArray(res)) {
            this.dependenciaSupervisor = res[0].ESFDEPENCARGADA;
          }
        });
      }
      switch (param) {
        case 'sede':
          return supervisorSeleccionado.SedeSupervisor;

        default:
          return '';
      }
    }
    return '';
  }

  onObservacionSubmit() {
    this.validar = true;
  }

  // Método para enviar registro
  onSubmit() {
    if (this.validar) {
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        elementos: this.elementosForm.get('elementos').value.map(el => el.Id),
        supervisor: this.supervisorForm.value.supervisorCtrl.Id,
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: detalle,
        FormatoTipoMovimientoId: 'ENT_PPA',
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
