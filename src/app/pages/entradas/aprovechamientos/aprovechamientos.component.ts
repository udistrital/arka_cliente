import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbStepperComponent } from '@nebular/theme';
import { TerceroCriterioPlanta } from '../../../@core/data/models/terceros_criterio';
import { PopUpManager } from '../../../managers/popUpManager';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


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

  // Validadores
  vigenciaSelect: boolean;

  validar: boolean = false;
  cargando_supervisores: boolean = true;
  registrando: boolean;

  private Supervisores: TerceroCriterioPlanta[];
  supervisoresFiltrados: Observable<TerceroCriterioPlanta[]>;

  @ViewChild('stepper') stepper: NbStepperComponent;

  @Input() actaRecibidoId: number;
  @Input() entradaId: any;
  @Input() EntradaEdit: any;

  constructor(
    private router: Router,
    private tercerosHelper: TercerosHelper,
    private pUpManager: PopUpManager,
    private fb: FormBuilder,
    private entradasHelper: EntradaHelper,
    private translate: TranslateService,
  ) {
    this.vigenciaSelect = false;
    this.validar = false;
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

  private filtroSupervisores(nombre: string): TerceroCriterioPlanta[] {
    // if (nombre.length >= 4 ) {
    const valorFiltrado = nombre.toLowerCase();
    return this.Supervisores.filter(sup => sup.TerceroPrincipal.NombreCompleto.toLowerCase().includes(valorFiltrado));
    // } else return [];
  }


  private loadSupervisores(): void {
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

  muestraSupervisor(sup: TerceroCriterioPlanta): string {
    if (sup.TerceroPrincipal !== undefined) {
      return sup.TerceroPrincipal.NombreCompleto;
    } else {
      return '';
    }
  }

  datosSupervisor(param: string): string {
    const supervisorSeleccionado: TerceroCriterioPlanta = <TerceroCriterioPlanta>this.supervisorForm.value.supervisorCtrl;
    // console.log({supervisorSeleccionado});
    if (supervisorSeleccionado && supervisorSeleccionado.Sede) {
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

  onObservacionSubmit() {
    this.validar = true;
  }

  /**
   * Método para enviar registro
   */
  onSubmit() {
    if (this.validar) {
      this.registrando = true;
      const detalle = {
        acta_recibido_id: +this.actaRecibidoId,
        vigencia: this.fechaForm.value.fechaCtrl,
        supervisor: this.supervisorForm.value.supervisorCtrl.TerceroPrincipal.Id,
      };

      const transaccion = <TransaccionEntrada>{
        Observacion: this.observacionForm.value.observacionCtrl,
        Detalle: JSON.stringify(detalle),
        FormatoTipoMovimientoId: 'ENT_PPA',
        SoporteMovimientoId: 0,
      };

      this.entradasHelper.postEntrada(transaccion).subscribe((res: any) => {
        if (res !== null) {
          this.registrando = false;
          (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.movimientos.entradas.registroTtlOk', { CONSECUTIVO: res.Consecutivo }),
            text: this.translate.instant('GLOBAL.movimientos.entradas.registroTxtOk', { CONSECUTIVO: res.Consecutivo }),
            showConfirmButton: true,
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
