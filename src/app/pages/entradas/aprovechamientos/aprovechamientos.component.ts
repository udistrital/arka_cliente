import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbStepperComponent } from '@nebular/theme';
import { Supervisor, TerceroCriterioPlanta } from '../../../@core/data/models/terceros_criterio';
import { PopUpManager } from '../../../managers/popUpManager';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TranslateService } from '@ngx-translate/core';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';

@Component({
  selector: 'ngx-aprovechamientos',
  templateUrl: './aprovechamientos.component.html',
  styleUrls: ['./aprovechamientos.component.scss'],
})
export class AprovechamientosComponent implements OnInit {

  // Formularios
  fechaForm: FormGroup;
  supervisorForm: FormGroup;
  observacionForm: FormGroup;
  flag = true;
  dependenciaSupervisor: String;

  // Validadores

  validar: boolean = false;
  cargando_supervisores: boolean = true;

  private Supervisores: Supervisor[];
  supervisoresFiltrados: Observable<Supervisor[]>;

  @ViewChild('stepper') stepper: NbStepperComponent;

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private entradasHelper: EntradaHelper,
    private tercerosHelper: TercerosHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private translate: TranslateService) {
    this.validar = false;
    this.dependenciaSupervisor = '';
  }

  ngOnInit() {
    this.fechaForm = this.fb.group({
      fechaCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.loadSupervisores();
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
    if (supervisorSeleccionado ) {
      if (this.flag) {
        this.flag = false
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

}
