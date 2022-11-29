import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { MatPaginator, MatStepper, MatTableDataSource } from '@angular/material';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PopUpManager } from '../../../managers/popUpManager';
import { CommonEntradas } from '../CommonEntradas';
import { CommonElementos } from '../CommonElementos';

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

  @ViewChild('stepper', {static: true}) stepper: MatStepper;
  @ViewChild('paginator', {static: true}) paginator: MatPaginator;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    private pUpManager: PopUpManager,
    private commonElementos: CommonElementos,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.displayedColumns = this.commonElementos.columnsElementos;
    this.elementosForm = this.commonElementos.formElementos;
    this.observacionForm = this.common.formObservaciones;
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
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
