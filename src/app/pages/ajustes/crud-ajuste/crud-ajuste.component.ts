import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { EstadoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { AjustesHelper } from '../../../helpers/movimientos/ajustesHelper';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';

@Component({
  selector: 'ngx-crud-ajuste',
  templateUrl: './crud-ajuste.component.html',
  styleUrls: ['./crud-ajuste.component.scss'],
})
export class CrudAjusteComponent implements OnInit {
  ajusteData: any;
  ajuste: any;
  valid: boolean;
  estadosMovimiento: Array<EstadoMovimiento>;
  showForm: boolean;
  modoForm: string; // create | get | update
  title: string;
  subtitle: string;
  boton: string;
  consecutivo: string = '';
  rechazo: string = '';
  loading: boolean;
  submitted: boolean;
  @Input() modoCrud: string; // registrar | ver | editar | revisar | aprobar
  @Input() ajusteId: number = 0;
  @Output() accion: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private entradasHelper: EntradaHelper,
    private ajustesHelper: AjustesHelper,
    private confService: ConfiguracionService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  ngOnInit() {
    this.loadEstados();
    this.submitted = false;
    if (this.modoCrud === 'registrar') {
      this.modoForm = 'create';
      this.showForm = true;
    } else if (this.modoCrud !== 'editar') {
      this.getAjuste(this.ajusteId);
      this.modoForm = 'get';
    } else if (this.ajusteId) {
      this.getAjuste(this.ajusteId);
      this.modoForm = 'put';
    }
    this.title = this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.title');
    this.subtitle = this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.subtitle');
    this.boton = this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.accion');
  }

  private getAjuste(ajusteId: number) {
    this.ajustesHelper.getOne(ajusteId).toPromise().then(res => {
      if (res) {
        this.ajuste = res.Movimiento;
        const detalle = JSON.parse(res.Movimiento.Detalle);
        this.ajusteData = {};
        this.ajusteData.movimientos = res.TrContable;
        this.ajusteData.rechazo = detalle.RazonRechazo;
        this.consecutivo = detalle.Consecutivo;
        this.showForm = true;
      }
    });
  }

  public confRechazo() {
    if (!this.loading && !this.submitted && this.valid) {
      (Swal as any).fire({
        title: this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.confrmTtlR'),
        text: this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.confrmTxtR'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.translate.instant('GLOBAL.si'),
        cancelButtonText: this.translate.instant('GLOBAL.no'),
      }).then((result) => {
        if (result.value) {
          (Swal as any).mixin({
            input: 'text',
            confirmButtonText: this.translate.instant('GLOBAL.Acta_Recibido.VerificacionActa.Rechazar'),
            showCancelButton: true,
            progressSteps: ['1'],
            inputValidator: (value) => {
              return new Promise<string>((resolve) => {
                if (!value.length) {
                  resolve(this.translate.instant('GLOBAL.ajustes.revisar.confrmRechazoTtx'));
                } else {
                  resolve('');
                }
              });
            },
          }).queue([
            {
              title: this.translate.instant('GLOBAL.ajustes.revisar.confrmRechazoTtl'),
              text: this.translate.instant('GLOBAL.ajustes.revisar.confrmRechazoTtx'),
            },
          ]).then((result2) => {
            if (result2.value) {
              this.rechazo = result2.value[0];
              this.rechazar();
            }
          });
        }
      });
    }
  }

  public setValidness(event) {
    this.valid = event;
  }

  public confirm(rechazar: boolean = false) {
    if (!this.loading && !this.submitted && this.valid) {
      const sfx = this.modoCrud !== 'revisar' ? '' : rechazar ? 'R' : 'A';
      const title = this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.confrmTtl' + sfx);
      const text = this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.confrmTxt' + sfx);
      (Swal as any).fire({
        title,
        text,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.translate.instant('GLOBAL.si'),
        cancelButtonText: this.translate.instant('GLOBAL.no'),
      }).then((result) => {
        if (result.value) {
          if (this.modoCrud === 'registrar') {
            this.post();
          } else if (this.modoCrud === 'revisar') {
            this.aprobar();
          } else if (this.modoCrud === 'editar') {
            this.update();
          }
        }
      });
    }
  }

  private aprobar() {
    const st = this.estadosMovimiento.find(st_ => st_.Id === this.ajuste.EstadoMovimientoId.Id).Nombre;
    const alm = this.confService.getAccion('aprobarAjusteAlmacen') !== undefined;
    const cont = this.confService.getAccion('aprobarAjusteContabilidad') !== undefined;
    if (st.includes('Ajuste Aprobado por') && (alm || cont)) {
      this.aprobarFinal();
    } else if (st === 'Ajuste En Trámite') {
      const nuevoSt = cont ? 'Ajuste Aprobado por Contabilidad' : alm ? 'Ajuste Aprobado por Almacén' : '';
      this.ajuste.EstadoMovimientoId = this.estadosMovimiento.find(st_ => st_.Nombre === nuevoSt);
      this.put();
    }
  }

  private rechazar() {
    const detalle = JSON.parse(this.ajuste.Detalle);
    detalle.RazonRechazo = this.rechazo;
    this.ajuste.Detalle = JSON.stringify(detalle);
    this.ajuste.EstadoMovimientoId = this.estadosMovimiento.find(st => st.Nombre === 'Ajuste Rechazado');
    this.put(true);
  }

  private update() {
    const TrContable = {
      Movimientos: this.ajusteData.controls.elementos.controls.map(fg => ({
        Cuenta: fg.controls.cuenta.value.Id,
        Debito: fg.controls.debito.value,
        Credito: fg.controls.credito.value,
        TerceroId: fg.controls.tercero.value.TerceroId ? fg.controls.tercero.value.TerceroId.Id: 0,
        Descripcion: fg.controls.descripcion.value,
      })),
    };

    const detalle = JSON.parse(this.ajuste.Detalle);
    detalle.PreTrAjuste = TrContable;
    this.ajuste.Detalle = JSON.stringify(detalle);
    this.ajuste.EstadoMovimientoId = this.estadosMovimiento.find(st => st.Nombre === 'Ajuste En Trámite');
    this.put();
  }

  private aprobarFinal() {
    this.loading = true;
    this.submitted = true;
    this.ajustesHelper.putAjuste(this.ajusteId).toPromise().then((res: any) => {
      this.loading = false;
      this.alertSuccess(false, JSON.parse(res.Detalle).Consecutivo);
    });
  }

  private put(rechazar: boolean = false) {
    this.loading = true;
    this.submitted = true;
    this.entradasHelper.putMovimiento(this.ajuste).toPromise().then((res: any) => {
      this.loading = false;
      this.alertSuccess(rechazar, JSON.parse(res.Detalle).Consecutivo);
    });
  }

  private post() {
    this.loading = true;
    const TrContable = {
      Movimientos: this.ajusteData.controls.elementos.controls.map(fg => ({
        Cuenta: fg.controls.cuenta.value.Id,
        Debito: fg.controls.debito.value,
        Credito: fg.controls.credito.value,
        TerceroId: fg.controls.tercero.value.TerceroId ? fg.controls.tercero.value.TerceroId.Id: 0,
        Descripcion: fg.controls.descripcion.value,
      })),
    };
    this.submitted = true;
    this.ajustesHelper.postAjuste(TrContable).toPromise().then((res: any) => {
      this.loading = false;
      this.alertSuccess(false, JSON.parse(res.Detalle).Consecutivo);
    });
  }

  private alertSuccess(rechazar: boolean, consecutivo: string) {
    const sfx = this.modoCrud !== 'revisar' ? '' : rechazar ? 'R' : 'A';
    const title = this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.successTtl' + sfx);
    const text = this.translate.instant('GLOBAL.ajustes.' + this.modoCrud + '.successTxt' + sfx, { CONSECUTIVO: consecutivo });
    const options = {
      type: 'success',
      title,
      text,
      showConfirmButton: true,
    };
    this.accion.emit(rechazar);
    this.pUpManager.showAlertWithOptions(options);
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length) {
        this.estadosMovimiento = res;
      }
    });
  }
}
