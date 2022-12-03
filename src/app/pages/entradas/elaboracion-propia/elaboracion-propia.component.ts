import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { Ordenador, Supervisor } from '../../../@core/data/models/terceros_criterio';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GestorDocumentalService } from '../../../helpers/gestor_documental/gestorDocumentalHelper';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { CommonEntradas } from '../CommonEntradas';

@Component({
  selector: 'ngx-elaboracion-propia',
  templateUrl: './elaboracion-propia.component.html',
  styleUrls: ['./elaboracion-propia.component.scss'],
})
export class ElaboracionPropiaComponent implements OnInit {

  soporteForm: FormGroup;
  observacionForm: FormGroup;
  ordenadorForm: FormGroup;
  supervisorForm: FormGroup;
  flag = true;

  Supervisores: Supervisor[];
  supervisoresFiltrados: Observable<Supervisor[]>;
  Ordenadores: Ordenador[];
  ordenadoresFiltrados: Observable<Ordenador[]>;
  cargando_supervisores: boolean = true;
  cargando_ordenadores: boolean = true;

  ordenadorId: number;
  supervisorId: number;
  cargoOrdenador: string;
  dependenciaSupervisor: String;
  fileDocumento: any;

  @Input() actaRecibidoId: Number;
  @Output() data: EventEmitter<TransaccionEntrada> = new EventEmitter<TransaccionEntrada>();

  constructor(
    private entradasHelper: EntradaHelper,
    private common: CommonEntradas,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private documento: GestorDocumentalService,
    private autenticationService: ImplicitAutenticationService,
    private sanitization: DomSanitizer,
    private translate: TranslateService,
  ) {
    this.ordenadorId = 0;
    this.supervisorId = 0;
    this.dependenciaSupervisor = '';
  }

  ngOnInit() {
    this.soporteForm = this.fb.group({
      soporteCtrl: ['', Validators.required],
    });
    this.ordenadorForm = this.fb.group({
      ordenadorCtrl: ['', Validators.required],
    });
    this.supervisorForm = this.fb.group({
      supervisorCtrl: ['', Validators.required],
    });
    this.observacionForm = this.common.formObservaciones;
    this.loadSupervisores();
    this.loadOrdenadores();
  }

  changeOrdenador() {
    this.cargoOrdenador = this.ordenadorForm.value.ordenadorCtrl.RolOrdenador;
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
  // ---------------------------------FIN ORDENADORES-------------------------------------------------

  // MÉTODOS PARA CARGAR SOPORTES
  getSoporte(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
        file.url = this.cleanURL(file.urlTemp);
        file.IdDocumento = 12; // tipo de documento (API documentos_crud)
        file.file = event.target.files[0];
        this.fileDocumento = file;
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.error'));
      }
    }
  }

  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  async postFile(file: any) {
    const files = [];
    const nombre = await this.autenticationService.getMail();
    files.push({
      nombre,
      key: 'Documento',
      file,
      IdDocumento: 53,
    });

    const rolePromise = new Promise<number>((resolve, reject) => {
      this.documento.uploadFiles(files).subscribe((data: any) => {
        resolve(+data[0].res.Id);
      });
    });
    return rolePromise;
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
    const documento = await this.postFile(this.fileDocumento);
    const detalle = {
      acta_recibido_id: +this.actaRecibidoId,
      supervisor: this.supervisorForm.value.supervisorCtrl.Id,
      ordenador_gasto_id: this.ordenadorForm.value.ordenadorCtrl.Id,
    };

    const transaccion = <TransaccionEntrada>{
      Observacion: this.observacionForm.value.observacionCtrl,
      Detalle: detalle,
      FormatoTipoMovimientoId: 'ENT_EP',
      SoporteMovimientoId: documento,
    };

    this.data.emit(transaccion);
  }
}
