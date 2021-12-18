import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { EstadoMovimiento, Movimiento } from '../../../@core/data/models/entrada/entrada';
import { DetalleBaja, SoporteMovimiento, TrSoporteMovimiento } from '../../../@core/data/models/movimientos_arka/movimientos_arka';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { BajasHelper } from '../../../helpers/bajas/bajasHelper';
import { ImplicitAutenticationService } from '../../../@core/utils/implicit_autentication.service';
import { GestorDocumentalService } from '../../../helpers/gestor_documental/gestorDocumentalHelper';
import { UserService } from '../../../@core/data/users.service';

@Component({
  selector: 'ngx-crud-bajas',
  templateUrl: './crud-bajas.component.html',
  styleUrls: ['./crud-bajas.component.scss'],
})
export class CrudBajasComponent implements OnInit {

  bajaData: any;
  valid: boolean;
  estadosMovimiento: Array<EstadoMovimiento>;
  showForm: boolean;
  modoForm: string; // create | get | update
  title: string;
  subtitle: string;
  boton: string;
  consecutivo: string = '';
  rechazo: string = '';
  @Input() modoCrud: string = 'registrar'; // registrar | ver | editar | revisar | aprobar
  @Input() bajaId: number = 0;
  @Output() accion: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private translate: TranslateService,
    private pUpManager: PopUpManager,
    private movimientosHelper: MovimientosHelper,
    private entradasHelper: EntradaHelper,
    private bajasHelper: BajasHelper,
    private autenticationService: ImplicitAutenticationService,
    private documento: GestorDocumentalService,
    private userService: UserService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
  }

  ngOnInit() {
    this.loadEstados();
    if (this.modoCrud === 'registrar') {
      this.modoForm = 'create';
      this.showForm = true;
    } else if (this.modoCrud !== 'editar') {
      this.getBaja(this.bajaId);
      this.modoForm = 'get';
    } else if (this.bajaId) {
      this.getBaja(this.bajaId);
      this.modoForm = 'put';
    }
    this.title = this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.title');
    this.subtitle = this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.subtitle');
    this.boton = this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.accion');
  }

  private getBaja(bajaId: number) {
    this.bajasHelper.getSolicitud(bajaId).subscribe(res => {
      if (res) {
        this.consecutivo = res.Consecutivo ? res.Consecutivo : '';
        this.bajaData = {};
        this.bajaData.elementos = res.Elementos;
        this.bajaData.soporte = res.Soporte;
        this.bajaData.tipoBaja = res.TipoBaja;
        this.bajaData.elementos = res.Elementos;
        this.bajaData.observaciones = res.Observaciones;
        this.bajaData.funcionario = res.Funcionario;
        this.bajaData.revisor = res.Revisor;
        this.bajaData.rechazo = res.RazonRechazo;
        this.showForm = true;
      }
    });
  }

  public rechazar() {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.confrmTtlR'),
      text: this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.confrmTxtR'),
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
                resolve(this.translate.instant('GLOBAL.traslados.revisar.confrmRechazoTtx'));
              } else {
                resolve('');
              }
            });
          },
        }).queue([
          {
            title: this.translate.instant('GLOBAL.bajas.revisar.confrmRechazoTtl'),
            text: this.translate.instant('GLOBAL.bajas.revisar.confrmRechazoTtx'),
          },
        ]).then((result2) => {
          if (result2.value) {
            this.rechazo = result2.value[0];
            this.buildMovimiento(true);
          }
        });

      }
    });
  }

  public setValidness(event) {
    this.valid = event;
  }

  public confirm(rechazar: boolean = false) {
    const sfx = this.modoCrud !== 'revisar' ? '' : rechazar ? 'R' : 'A';
    const title = this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.confrmTtl' + sfx);
    const text = this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.confrmTxt' + sfx);
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
        this.buildMovimiento(rechazar);
      }
    });
  }

  private async buildMovimiento(rechazar: boolean) {

    const Funcionario = this.bajaData.controls.info.controls.funcionario.value.id;
    const Elementos = this.bajaData.controls.elementos.controls.map(control => control.value.id);
    const tipoBaja = this.bajaData.controls.info.controls.tipoBaja.value;
    const estadoId = (this.modoCrud === 'registrar' || this.modoCrud === 'editar') ? 'Baja En Trámite' :
      (rechazar) ? 'Baja Rechazada' :
        (this.modoCrud === 'revisar') ? 'Baja En Comité' :
          (this.modoCrud === 'aprobar') ? 'Baja Aprobada' : '';
    const FechaRevisionA = this.modoCrud === 'revisar' ? new Date() :
      this.bajaData.controls.info.value.fechaRevision;
    const FechaRevisionC = this.modoCrud === 'aprobar' ? new Date() :
      this.bajaData.controls.info.value.fechaAprobacion;
    const Revisor = this.modoCrud === 'revisar' ? this.userService.getPersonaId() :
      this.bajaData.controls.info.value.revisor.id;
    const detalle = <DetalleBaja>{
      Elementos,
      Funcionario,
      Revisor,
      FechaRevisionA,
      FechaRevisionC,
      Consecutivo: this.consecutivo ? this.consecutivo : '',
      RazonRechazo: this.rechazo,
    };

    const movimiento = <Movimiento>{
      Id: this.bajaId,
      Detalle: JSON.stringify(detalle),
      Observacion: this.bajaData.controls.observaciones.value.observaciones,
      Activo: true,
      FormatoTipoMovimientoId: {
        Id: tipoBaja,
      },
      EstadoMovimientoId: {
        Id: this.estadosMovimiento.find(st => st.Nombre === estadoId).Id,
      },
    };

    const file = this.bajaData.controls.info.controls.soporte.value.file;
    if (file) {
      const documento = await this.postFile(this.bajaData.controls.info.controls.soporte.value.file);
      const soporte = <SoporteMovimiento>{
        Id: 0,
        DocumentoId: documento,
        Activo: true,
        MovimientoId: new Movimiento,
      };

      const trMovimiento = <TrSoporteMovimiento>{
        Soporte: soporte,
        Movimiento: movimiento,
      };
      if (this.modoCrud === 'registrar') {
        this.postBaja(trMovimiento);
      } else if (this.modoCrud === 'editar') {
        this.putBaja(trMovimiento, this.bajaId);
      }
    } else if (this.modoCrud === 'revisar' || (this.modoCrud === 'editar' && !file)) {
      this.updateMovimiento(movimiento, rechazar);
    }
  }

  private updateMovimiento(movimiento, rechazar: boolean) {
    this.entradasHelper.putMovimiento(movimiento).toPromise().then((res: any) => {
      this.alertSuccess(rechazar, JSON.parse(res.Detalle).Consecutivo);
    });
  }

  private postBaja(movimiento: TrSoporteMovimiento) {
    this.bajasHelper.postBaja(movimiento).subscribe((res: any) => {
      this.alertSuccess(false, JSON.parse(res.Detalle).Consecutivo);
    });
  }

  private putBaja(movimiento: TrSoporteMovimiento, bajaId: number) {
    this.bajasHelper.putBaja(movimiento, bajaId).subscribe((res: any) => {
      this.alertSuccess(false, JSON.parse(res.Detalle).Consecutivo);
    });
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

  private alertSuccess(rechazar: boolean, consecutivo: string) {
    const sfx = this.modoCrud !== 'revisar' ? '' : rechazar ? 'R' : 'A';
    const title = this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.successTtl' + sfx);
    const text = this.translate.instant('GLOBAL.bajas.' + this.modoCrud + '.successTxt' + sfx, { CONSECUTIVO: consecutivo });
    const options = {
      type: 'success',
      title,
      text,
      showConfirmButton: true,
    };
    this.accion.emit(true);
    this.pUpManager.showAlertWithOptions(options);
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
      }
    });
  }

}
