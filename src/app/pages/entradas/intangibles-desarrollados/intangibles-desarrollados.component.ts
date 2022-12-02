import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { Ordenador, Supervisor } from '../../../@core/data/models/terceros_criterio';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { CommonEntradas } from '../CommonEntradas';

@Component({
  selector: 'ngx-intangibles-desarrollados',
  templateUrl: './intangibles-desarrollados.component.html',
  styleUrls: ['./intangibles-desarrollados.component.scss'],
})

export class IntangiblesDesarrolladosComponent implements OnInit {

  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  flag = true;

  Supervisores: Supervisor[];
  supervisoresFiltrados: Observable<Supervisor[]>;
  Ordenadores: Ordenador[];
  ordenadoresFiltrados: Observable<Ordenador[]>;
  dependenciaSupervisor: String = '';
  cargando_supervisores: boolean = true;
  cargando_ordenadores: boolean = true;
  cargoOrdenador: string;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private common: CommonEntradas,
    private entradasHelper: EntradaHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.observacionForm = this.common.formObservaciones;
    this.ordenadorForm = this.fb.group({
      ordenadorCtrl: ['', Validators.required],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.loadSupervisores();
    this.loadOrdenadores();
  }

  // -------------------------SUPERVISORES--------------------------------------------------------
  loadSupervisores(): void {
    this.entradasHelper.getSupervisores('supervisor_contrato?limit=-1').subscribe(res => {
      if (Array.isArray(res)) {
        this.Supervisores = res;
        this.supervisoresFiltrados = this.supervisorForm.get('supervisorCtrl').valueChanges
          .pipe(
            startWith(''),
            map((val: any) => typeof val === 'string' ? val : this.muestraSupervisor(val)),
            map((nombre: string) => this.filtroSupervisores(nombre)),
          );
        // console.log({supervisores: this.Supervisores});
        this.cargando_supervisores = false;
      }
    });
  }
  datosSupervisor(param: string): string {
    const supervisorSeleccionado: Supervisor = <Supervisor>this.supervisorForm.value.supervisorCtrl;
    // console.log({supervisorSeleccionado});
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
  filtroSupervisores(nombre: string): Supervisor[] {
    // if (nombre.length >= 4 ) {
    const valorFiltrado = nombre.toLowerCase();
    return this.Supervisores.filter(sup => sup.Nombre.toLowerCase().includes(valorFiltrado));
    // } else return [];
  }

  muestraSupervisor(sup: Supervisor): string {
    if (sup.Nombre !== undefined) {
      return sup.Nombre;
    } else {
      return '';
    }
  }

  // -------------------------------------ORDENADORES---------------------------------------------------
  loadOrdenadores(): void {
    this.entradasHelper.getOrdenadores('ordenadores').subscribe(res => {
      if (Array.isArray(res)) {
        this.Ordenadores = res;
        this.ordenadoresFiltrados = this.ordenadorForm.get('ordenadorCtrl').valueChanges
          .pipe(
            startWith(''),
            map((val: any) => typeof val === 'string' ? val : this.muestraOrdenador(val)),
            map((nombre: string) => this.filtroOrdenadores(nombre)),
          );
        // console.log({supervisores: this.Supervisores});
        this.cargando_ordenadores = false;
      }
    });
  }
  filtroOrdenadores(nombre: string): Ordenador[] {
    // if (nombre.length >= 4 ) {
    const valorFiltrado = nombre.toLowerCase();
    return this.Ordenadores.filter(sup => sup.NombreOrdenador.toLowerCase().includes(valorFiltrado));
    // } else return [];
  }

  muestraOrdenador(ord: Ordenador): string {
    if (ord.NombreOrdenador !== undefined) {
      return ord.NombreOrdenador;
    } else {
      return '';
    }
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
  async onSubmit() {
    const detalle = {
      acta_recibido_id: +this.actaRecibidoId,
      supervisor: this.supervisorForm.value.supervisorCtrl.Id,
      ordenador_gasto_id: this.ordenadorForm.value.ordenadorCtrl.Id,
    };

    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_ID', 0);
    this.data.emit(transaccion);
  }
}
