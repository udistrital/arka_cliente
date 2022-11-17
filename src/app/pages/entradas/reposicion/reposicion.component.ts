import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { MatPaginator, MatStepper, MatTableDataSource } from '@angular/material';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { UtilidadesService } from '../../../@core/utils';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PopUpManager } from '../../../managers/popUpManager';
import { CommonEntradas } from '../CommonEntradas';

@Component({
  selector: 'ngx-reposicion',
  templateUrl: './reposicion.component.html',
  styleUrls: ['./reposicion.component.scss'],
})
export class ReposicionComponent implements OnInit {

  elementosForm: FormGroup;
  soporteForm: FormGroup;
  observacionForm: FormGroup;
  dataSource: MatTableDataSource<any>;
  displayedColumns: any;
  elementos: any[];

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('paginator') paginator: MatPaginator;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    private movimientos: MovimientosHelper,
    private utils: UtilidadesService,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
  ) {
    this.displayedColumns = this.common.columnsElementos;
  }

  ngOnInit() {
    this.elementosForm = this.common.formElementos;
    this.observacionForm = this.common.formObservaciones;
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
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
      switchMap((val) => this.common.loadElementos(val)),
    ).subscribe((response: any) => {
      this.elementos = response.queryOptions;
    });
  }

  onObservacionSubmit() {
    this.pUpManager.showAlertWithOptions(this.common.optionsSubmit)
      .then((result) => {
        if (result.value) {
          this.onSubmit();
        }
      });
  }

  //  Método para enviar registro
  async onSubmit() {
    const detalle = {
      acta_recibido_id: +this.actaRecibidoId,
      elementos: this.elementosForm.get('elementos').value.map(el => el.Id),
    };

    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_RP', 0);
    this.data.emit(transaccion);
  }

}
