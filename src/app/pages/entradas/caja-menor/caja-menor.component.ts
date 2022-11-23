import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { SoporteActa } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { Ordenador, Supervisor } from '../../../@core/data/models/terceros_criterio';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonFactura } from '../CommonFactura';
import { CommonEntradas } from '../CommonEntradas';

@Component({
  selector: 'ngx-caja-menor',
  templateUrl: './caja-menor.component.html',
  styleUrls: ['./caja-menor.component.scss'],
})
export class CajaMenorComponent implements OnInit {

  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  facturaForm: FormGroup;
  flag = true;
  dependenciaSupervisor: String;

  Supervisores: Supervisor[];
  supervisoresFiltrados: Observable<Supervisor[]>;
  Ordenadores: Ordenador[];
  ordenadoresFiltrados: Observable<Ordenador[]>;

  ordenadores: Array<OrdenadorGasto>;
  soportes: Array<SoporteActa>;
  fechaFactura: string;

  cargando_supervisores: boolean = true;
  cargando_ordenadores: boolean = true;

  @Input() actaRecibidoId: number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private entradasHelper: EntradaHelper,
    private common: CommonEntradas,
    private pUpManager: PopUpManager,
    private commonFactura: CommonFactura,
    private fb: FormBuilder,
    private translate: TranslateService,
  ) {
    this.ordenadores = new Array<OrdenadorGasto>();
    this.soportes = new Array<SoporteActa>();
    this.fechaFactura = '';
    this.dependenciaSupervisor = '';
  }

  ngOnInit() {
    this.observacionForm = this.common.formObservaciones;
    this.ordenadorForm = this.fb.group({
      ordenadorCtrl: ['', Validators.required],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.facturaForm = this.commonFactura.formFactura;
    this.loadSupervisores();
    this.loadOrdenadores();
    this.loadSoportes();
  }

  // -------------------------SUPERVISORES--------------------------------------------------------
  loadSupervisores(): void {
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
            map(val => typeof val === 'string' ? val : this.muestraOrdenador(val)),
            map(nombre => this.filtroOrdenadores(nombre)),
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
  // ---------------------------------FIN ORDENADORES-------------------------------------------------

  async loadSoportes(): Promise<void> {
    this.soportes = await this.commonFactura.loadSoportes(this.actaRecibidoId);
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
      acta_recibido_id: +this.actaRecibidoId,
      supervisor: this.supervisorForm.value.supervisorCtrl.Id,
      ordenador_gasto_id: this.ordenadorForm.value.ordenadorCtrl.Id,
      factura: +this.facturaForm.value.facturaCtrl,
    };

    const transaccion = this.common.crearTransaccionEntrada(this.observacionForm.value.observacionCtrl, detalle, 'ENT_CM', 0);
    this.data.emit(transaccion);

  }
}
