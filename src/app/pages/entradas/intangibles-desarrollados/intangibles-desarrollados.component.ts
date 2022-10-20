import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Ordenador, Supervisor, TerceroCriterioJefe, TerceroCriterioPlanta } from '../../../@core/data/models/terceros_criterio';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';

@Component({
  selector: 'ngx-intangibles-desarrollados',
  templateUrl: './intangibles-desarrollados.component.html',
  styleUrls: ['./intangibles-desarrollados.component.scss'],
})

export class IntangiblesDesarrolladosComponent implements OnInit {
  soporteForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  flag = true;
  dependenciaSupervisor: String;

  Supervisores: Supervisor[];
  supervisoresFiltrados: Observable<Supervisor[]>;
  Ordenadores: Ordenador[];
  ordenadoresFiltrados: Observable<Ordenador[]>;

  ordenadores: Array<OrdenadorGasto>;
  solicitanteSelect: boolean;
  ordenadorId: number;
  supervisorId: number;
  validar: boolean;
  fechaSolicitante: string;
  cargoOrdenador: string;
  fileDocumento: any;
  uidDocumento: string;
  idDocumento: number;
  soportes: Array<SoporteActaProveedor>;
  proveedor: string;

  cargando_proveedores: boolean = true;
  cargando_supervisores: boolean = true;
  cargando_ordenadores: boolean = true;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private entradasHelper: EntradaHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private sanitization: DomSanitizer,
    private tercerosHelper: TercerosHelper,
    private translate: TranslateService) {
    this.ordenadores = new Array<OrdenadorGasto>();
    this.solicitanteSelect = false;
    this.ordenadorId = 0;
    this.supervisorId = 0;
    this.validar = false;
    this.soportes = new Array<SoporteActaProveedor>();
    this.proveedor = '';
    
  }


  ngOnInit() {
    this.soporteForm = this.fb.group({
      soporteCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.ordenadorForm = this.fb.group({
      ordenadorCtrl: ['', Validators.required],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.loadSupervisores();
    this.loadOrdenadores();
  }

  // Métodos para validar campos requeridos en el formulario
  onSolicitanteSubmit() {
    this.soporteForm.markAsDirty();
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
filtroSupervisores(nombre: string): Supervisor[] {
  // if (nombre.length >= 4 ) {
    const valorFiltrado = nombre.toLowerCase();
    return this.Supervisores.filter(sup => sup.Nombre.toLowerCase().includes(valorFiltrado));
  // } else return [];
}

muestraSupervisor(sup: Supervisor): string {
  if (sup.Nombre !== undefined) {
    return sup.Nombre;
  }else {
    return '';
  }
}

// -------------------------------------ORDENADORES---------------------------------------------------
loadOrdenadores(): void {
  this.entradasHelper.getOrdenadores('ordenadores').subscribe( res => {
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
  }else {
    return '';
  }
}

loadSolicitantes(): void {
  this.entradasHelper.getSolicitantes(this.fechaSolicitante).subscribe(res => {
    while (this.ordenadores.length > 0) {
      this.ordenadores.pop();
    }
    if (res !== null) {
      for (const index of Object.keys(res.ListaOrdenadores.Ordenadores)) {
        const ordenador = new OrdenadorGasto;
        ordenador.NombreOrdenador = res.ListaOrdenadores.Ordenadores[index].NombreOrdenador;
        ordenador.Id = res.ListaOrdenadores.Ordenadores[index].IdOrdenador;
        ordenador.RolOrdenadorGasto = res.ListaOrdenadores.Ordenadores[index].CargoOrdenador;
        this.ordenadores.push(ordenador);
      }
    }
  });
}

changeSolicitante(event) {
  if (!this.solicitanteSelect) {
    this.solicitanteSelect = !this.solicitanteSelect;
  }
  const date: Date = event;
  const mes = parseInt(date.getUTCMonth().toString(), 10) + 1;
  if (mes < 10) {
    this.fechaSolicitante = date.getFullYear() + '-0' + mes + '-' + date.getDate();
  } else {
    this.fechaSolicitante = date.getFullYear() + '-' + mes + '-' + date.getDate();
  }
  this.loadSolicitantes();
}

  onSoporteSubmit() {
    if (this.ordenadorId !== 0) {
      this.soporteForm.markAsDirty();
    }
  }
  onObservacionSubmit() {
    this.validar = true;
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

// Método para enviar registro
  async onSubmit() {
    if (this.validar) {
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        supervisor: this.supervisorForm.value.supervisorCtrl.Id,
        ordenador_gasto_id: this.ordenadorForm.value.ordenadorCtrl.Id,
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: detalle,
        FormatoTipoMovimientoId: 'ENT_ID',
        SoporteMovimientoId: this.idDocumento,
      };

      this.data.emit(transaccion);
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }
}
