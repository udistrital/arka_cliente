import { Component, OnInit, Input } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { Router, NavigationExtras } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from '../../../@core/data/documento.service';
import { TranslateService } from '@ngx-translate/core';
import { SoporteActaProveedor } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { TerceroCriterioJefe, TerceroCriterioPlanta } from '../../../@core/data/models/terceros_criterio';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Soporte } from '../soporteHelper';


@Component({
  selector: 'ngx-caja-menor',
  templateUrl: './caja-menor.component.html',
  styleUrls: ['./caja-menor.component.scss'],
})
export class CajaMenorComponent implements OnInit {
  soporteForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  facturaForm: FormGroup;


  Supervisores: TerceroCriterioPlanta[];
  supervisoresFiltrados: Observable<TerceroCriterioPlanta[]>;
  Ordenadores: TerceroCriterioJefe[];
  ordenadoresFiltrados: Observable<TerceroCriterioJefe[]>;

  ordenadores: Array<OrdenadorGasto>;
  solicitanteSelect: boolean;
  ordenadorId: number;
  supervisorId: number;
  validar: boolean;
  vigencia: number;
  fechaSolicitante: string;
  cargoOrdenador: string;
  fileDocumento: any;
  uidDocumento: string;
  idDocumento: number;
  soportes: Array<SoporteActaProveedor>;
  proveedor: string;
  fechaFactura: string;
  registrando: boolean;

  formatoTipoMovimiento: any;
  cargando_proveedores: boolean = true;
  cargando_supervisores: boolean = true;
  cargando_ordenadores: boolean = true;

  @Input() actaRecibidoId: number;
  @Input() entradaId: any;
  @Input() EntradaEdit: any;

  constructor(
    private router: Router,
    private entradasHelper: EntradaHelper,
    private pUpManager: PopUpManager,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private fb: FormBuilder,
    private nuxeoService: NuxeoService,
    private sanitization: DomSanitizer,
    private documentoService: DocumentoService,
    private tercerosHelper: TercerosHelper,
    private translate: TranslateService,
    private soporteHelper: Soporte) {
    this.ordenadores = new Array<OrdenadorGasto>();
    this.solicitanteSelect = false;
    this.ordenadorId = 0;
    this.supervisorId = 0;
    this.validar = false;
    this.soportes = new Array<SoporteActaProveedor>();
    this.proveedor = '';
    this.fechaFactura = '';
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
      vigenciaCtrl: ['', Validators.required],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.facturaForm = this.fb.group({
      facturaCtrl: ['', Validators.nullValidator],
    });
    this.getVigencia();
    this.loadSupervisores();
    this.loadOrdenadores();
  }

  // Métodos para validar campos requeridos en el formulario
  onSolicitanteSubmit() {
    this.soporteForm.markAsDirty();
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
  // -------------------------SUPERVISORES--------------------------------------------------------
  loadSupervisores(): void {
    this.tercerosHelper.getTercerosByCriterio('funcionarioPlanta').subscribe(res => {
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
  filtroSupervisores(nombre: string): TerceroCriterioPlanta[] {
    // if (nombre.length >= 4 ) {
    const valorFiltrado = nombre.toLowerCase();
    return this.Supervisores.filter(sup => sup.TerceroPrincipal.NombreCompleto.toLowerCase().includes(valorFiltrado));
    // } else return [];
  }

  muestraSupervisor(sup: TerceroCriterioPlanta): string {
    if (sup.TerceroPrincipal !== undefined) {
      return sup.TerceroPrincipal.NombreCompleto;
    } else {
      return '';
    }
  }

  // -------------------------------------ORDENADORES---------------------------------------------------
  loadOrdenadores(): void {
    this.tercerosHelper.getTercerosByCriterio('ordenadoresGasto').subscribe(res => {
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
  filtroOrdenadores(nombre: string): TerceroCriterioJefe[] {
    // if (nombre.length >= 4 ) {
    const valorFiltrado = nombre.toLowerCase();
    return this.Ordenadores.filter(sup => sup.TerceroPrincipal.NombreCompleto.toLowerCase().includes(valorFiltrado));
    // } else return [];
  }

  muestraOrdenador(ord: TerceroCriterioJefe): string {
    if (ord.TerceroPrincipal !== undefined) {
      return ord.TerceroPrincipal.NombreCompleto;
    } else {
      return '';
    }
  }
  // ---------------------------------FIN ORDENADORES-------------------------------------------------

  onSoporteSubmit() {
    if (this.ordenadorId !== 0) {
      this.soporteForm.markAsDirty();
    }
  }
  loadSoporte(): void {
    this.soporteHelper.cargarSoporte(this.actaRecibidoId).then(info => {
      this.fechaFactura = info.fecha,
      this.soportes = info.soportes,
      this.proveedor = info.proveedor;
    });
  }
  onObservacionSubmit() {
    this.validar = true;
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  /**
   * Método para obtener el año en curso
   */
  getVigencia() {
    this.vigencia = new Date().getFullYear();
  }

  changeSelectSoporte(event) {
    this.loadSoporte();
    const soporteId: string = event.target.options[event.target.options.selectedIndex].value;
    for (const i in this.soportes) {
      if (this.soportes[i].Id.toString() === soporteId) {
        this.proveedor = this.soportes[i].Proveedor.NomProveedor;
        const date = this.soportes[i].FechaSoporte.toString().split('T');
        this.fechaFactura = date[0];
      }
    }
  }

  /**
   * Método para enviar registro
   */
  async onSubmit() {
    if (this.validar) {
      this.registrando = true;
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        vigencia: this.ordenadorForm.value.vigenciaCtrl,
        supervisor: this.supervisorForm.value.supervisorCtrl.TerceroPrincipal.Id,
        ordenador_gasto_id: this.ordenadorForm.value.ordenadorCtrl.TerceroPrincipal.Id,
        // solicitante_id: +this.supervisorId,
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: detalle,
        FormatoTipoMovimientoId: 'ENT_CM',
        SoporteMovimientoId: this.idDocumento,
      };

      this.entradasHelper.postEntrada(transaccion).subscribe((res: any) => {
        if (res.Detalle) {
          this.registrando = false;
          const consecutivo = JSON.parse(res.Detalle).consecutivo;
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.movimientos.entradas.registroTtlOk', { CONSECUTIVO: consecutivo }),
            text: this.translate.instant('GLOBAL.movimientos.entradas.registroTxtOk', { CONSECUTIVO: consecutivo }),
          });
          this.router.navigate(['/pages/entradas']);
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.registroFail'));
        }
      });
    } else {
      this.pUpManager.showErrorAlert('No ha llenado todos los campos! No es posible hacer el registro.');
    }

  }
}
