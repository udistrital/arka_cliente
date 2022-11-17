import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TranslateService } from '@ngx-translate/core';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { MatPaginator, MatStepper, MatTableDataSource } from '@angular/material';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { UtilidadesService } from '../../../@core/utils';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-reposicion',
  templateUrl: './reposicion.component.html',
  styleUrls: ['./reposicion.component.scss'],
})
export class ReposicionComponent implements OnInit {

  elementosForm: FormGroup;
  soporteForm: FormGroup;
  observacionForm: FormGroup;
  validar: boolean = false;
  dataSource: MatTableDataSource<any>;
  displayedColumns: any;
  elementos: any[];

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('paginator') paginator: MatPaginator;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private fb: FormBuilder,
    private movimientos: MovimientosHelper,
    private utils: UtilidadesService,
    private pUpManager: PopUpManager,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private translate: TranslateService,
  ) {
    this.displayedColumns = ['acciones', 'placa', 'entrada', 'fechaEntrada', 'salida', 'fechaSalida'];
  }

  ngOnInit() {
    this.elementosForm = this.fb.group({
      elementos: this.fb.array([], { validators: this.validateElementos() }),
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
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

      const baja = res && res.Baja && res.Baja.EstadoMovimientoId.Nombre === 'Baja Aprobada';
      const assignable = baja;

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
      } else if (!baja) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.errores.elementoSinBaja'));
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


  onObservacionSubmit() {
    this.validar = true;
  }

  //  Método para enviar registro
  async onSubmit() {
    if (this.validar === true) {
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        elementos: this.elementosForm.get('elementos').value.map(el => el.Id),
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: detalle,
        FormatoTipoMovimientoId: 'ENT_RP',
      };

      this.data.emit(transaccion);
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
