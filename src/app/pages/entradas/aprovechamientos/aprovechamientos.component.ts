import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { NbStepperComponent } from '@nebular/theme';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { TerceroCriterioPlanta } from '../../../@core/data/models/terceros_criterio';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-aprovechamientos',
  templateUrl: './aprovechamientos.component.html',
  styleUrls: ['./aprovechamientos.component.scss'],
})
export class AprovechamientosComponent implements OnInit {

  // Formularios
  contratoForm: FormGroup;
  supervisorForm: FormGroup;
  facturaForm: FormGroup;
  observacionForm: FormGroup;

  // Validadores
  tipoContratoSelect: boolean;
  vigenciaSelect: boolean;

  vigencia: number; // Año Actual
  soportes: Array<SoporteActaProveedor>; // Soportes
  proveedor: string;
  fechaFactura: string;
  validar: boolean;
  cargando_proveedores: boolean = true;
  cargando_supervisores: boolean = true;

  private tipoEntrada: any;
  private formatoTipoMovimiento: any;
  private Proveedores: Proveedor[];
  proveedoresFiltrados: Observable<Proveedor[]>;
  private Supervisores: TerceroCriterioPlanta[];
  supervisoresFiltrados: Observable<TerceroCriterioPlanta[]>;

  @ViewChild('stepper') stepper: NbStepperComponent;

  @Input() actaRecibidoId: string;

  constructor(
    private router: Router,
    private entradasHelper: EntradaHelper,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private tercerosHelper: TercerosHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private listService: ListService,
    private store: Store<IAppState>,
  ) {
    this.vigenciaSelect = false;
    this.soportes = new Array<SoporteActaProveedor>();
    this.proveedor = '';
    this.fechaFactura = '';
    this.validar = false;
  }

  ngOnInit() {
    this.getTipoEntrada();
    this.getFormatoEntrada();
    this.contratoForm = this.fb.group({
      vigenciaCtrl: ['', [Validators.required]],
    });
    this.facturaForm = this.fb.group({
      facturaCtrl: ['', Validators.nullValidator],
      proveedorCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.getVigencia();
    this.listService.findProveedores();
    this.loadLists();
    this.loadSupervisores();
  }

  private filtroProveedores(nombre: string): Proveedor[] {
    if (nombre.length >= 4 ) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Proveedores.filter(prov => prov.compuesto.toLowerCase().includes(valorFiltrado));
    } else return [];
  }

  private filtroSupervisores(nombre: string): TerceroCriterioPlanta[] {
    // if (nombre.length >= 4 ) {
      const valorFiltrado = nombre.toLowerCase();
      return this.Supervisores.filter(sup => sup.TerceroPrincipal.NombreCompleto.toLowerCase().includes(valorFiltrado));
    // } else return [];
  }

  private loadLists() {
    this.store.select(state => state.listProveedores).subscribe(
      (res) => {
        if (res.length) {
          this.Proveedores = <Proveedor[]><any>res[0];
          this.proveedoresFiltrados = this.facturaForm.get('proveedorCtrl').valueChanges
            .pipe(
              startWith(''),
              map(val => typeof val === 'string' ? val : val.compuesto),
              map(nombre => this.filtroProveedores(nombre)),
            );
          this.cargando_proveedores = false;
          // console.log({proveedores: this.Proveedores});
        }
      },
    );
  }

  private loadSupervisores(): void {
    this.tercerosHelper.getTercerosByCriterio('funcionarioPlanta').subscribe( res => {
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

  muestraProveedor(prov: Proveedor): string {
    return prov.compuesto;
  }

  muestraSupervisor(sup: TerceroCriterioPlanta): string {
    if (sup.TerceroPrincipal != undefined) {
      return sup.TerceroPrincipal.NombreCompleto;
    }else {
      return '';
    }
  }

  datosSupervisor(param: string): string {
    const supervisorSeleccionado: TerceroCriterioPlanta = <TerceroCriterioPlanta>this.supervisorForm.value.supervisorCtrl;
    // console.log({supervisorSeleccionado});
    if (supervisorSeleccionado) {
      switch (param) {
        case 'sede':
          return supervisorSeleccionado.Sede.Nombre;

        case 'dependencia':
          return supervisorSeleccionado.Dependencia.Nombre;

        default:
          return '';
      }
    }
    return '';
  }

  private getTipoEntrada() {
    this.entradasHelper.getTipoEntradaByAcronimoAndNombre('e_arka', 'Aprovechamientos').subscribe(res => {
      if (res !== undefined) {
        this.tipoEntrada = res;
      }
    });
  }

  private getFormatoEntrada() {
    this.entradasHelper.getFormatoEntradaByName('Partes por Aprovechamientos').subscribe(res => {
      if (res !== null) {
        this.formatoTipoMovimiento = res;
      }
    });
  }

  /**
   * Método para obtener el año en curso
   */
  getVigencia() {
    this.vigencia = new Date().getFullYear();
  }

  onObservacionSubmit() {
    this.validar = true;
  }

  /**
   * Método para enviar registro
   */
  onSubmit() {
    if (this.validar) {
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        consecutivo: 'P1-' + this.actaRecibidoId + '-' + new Date().getFullYear(),
        documento_contable_id: 1, // REVISAR
        vigencia: this.contratoForm.value.vigenciaCtrl,
        supervisor: this.supervisorForm.value.supervisorCtrl.TerceroPrincipal.Id,
        proveedor: this.facturaForm.value.proveedorCtrl.compuesto,
      };
      const movimientoAdquisicion = {
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: JSON.stringify(detalle),
        Activo: true,
        FormatoTipoMovimientoId: {
          Id: this.formatoTipoMovimiento[0].Id,
        },
        EstadoMovimientoId: {
          Id: 2, // Movimiento adecuado para registrar una entrada como aprobada
        },
        SoporteMovimientoId: 0,
        IdTipoMovimiento: this.tipoEntrada.Id,
      };
      // console.log({movimientoAdquisicion});
      this.entradasHelper.postEntrada(movimientoAdquisicion).subscribe((res: any) => {
        if (res !== null) {
          (Swal as any).fire({
            type: 'success',
            title: 'Entrada N° ' + `${detalle.consecutivo}` + ' Registrada',
            text: 'La Entrada N° ' + `${detalle.consecutivo}` + ' ha sido registrada de forma exitosa',
          });
          const navigationExtras: NavigationExtras = { state: { consecutivo: detalle.consecutivo } };
          this.router.navigate(['/pages/reportes/registro-entradas'], navigationExtras);
        } else {
          this.pUpManager.showErrorAlert('No es posible hacer el registro.');
        }
      });
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }

}
