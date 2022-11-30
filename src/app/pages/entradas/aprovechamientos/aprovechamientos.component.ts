import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Supervisor } from '../../../@core/data/models/terceros_criterio';
import { PopUpManager } from '../../../managers/popUpManager';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService } from '@ngx-translate/core';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CommonEntradas } from '../CommonEntradas';
import { CommonElementos } from '../CommonElementos';

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
  cargando_supervisores: boolean = true;

  private Supervisores: Supervisor[];
  supervisoresFiltrados: Observable<Supervisor[]>;

  @ViewChild('paginator', {static: true}) paginator: MatPaginator;

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    private commonElementos: CommonElementos,
    private entradasHelper: EntradaHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private translate: TranslateService,
  ) {
    this.dependenciaSupervisor = '';
  }

  ngOnInit() {
    this.displayedColumns = this.commonElementos.columnsElementos;
    this.elementosForm = this.commonElementos.formElementos;
    this.observacionForm = this.common.formObservaciones;
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
    this.loadSupervisores();
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
      acta_recibido_id: +this.actaRecibidoId,
      elementos: this.elementosForm.get('elementos').value.map(el => el.Id),
      supervisor: this.supervisorForm.value.supervisorCtrl.Id,
    };
    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_PPA', 0);
    this.data.emit(transaccion);
  }

}
