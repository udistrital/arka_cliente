import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { EstadoMovimiento, FormatoTipoMovimiento, Movimiento } from '../../../@core/data/models/entrada/entrada';
import { DetalleTraslado } from '../../../@core/data/models/movimientos_arka/movimientos_arka';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { TrasladosHelper } from '../../../helpers/movimientos/trasladosHelper';
import { PopUpManager } from '../../../managers/popUpManager';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';

@Component({
  selector: 'ngx-crud-traslado',
  templateUrl: './crud-traslado.component.html',
  styleUrls: ['./crud-traslado.component.scss'],
})
export class CrudTrasladoComponent implements OnInit {

  trasladoData: any;
  valid: boolean;
  formatoTraslado: FormatoTipoMovimiento;
  estadosMovimiento: Array<EstadoMovimiento>;
  showForm: boolean;
  modoForm: string; // create | get | update
  title: string;
  subtitle: string;
  boton: string;
  @Input() modoCrud: string = 'registrar'; // registrar | editar | ver | revisar | confirmar
  @Input() trasladoId: number = 0;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private pUpManager: PopUpManager,
    private movimientosHelper: MovimientosHelper,
    private trasladosHelper: TrasladosHelper,
    private tercerosHelper: TercerosHelper,
    private entradasHelper: EntradaHelper,
  ) { }

  ngOnInit() {
    console.log(this.trasladoId, this.modoCrud);
    this.getFormatoTraslado();
    this.loadEstados();
    if (this.modoCrud === 'registrar') {
      this.title = 'Registrar Solicitud de Traslado';
      this.boton = 'Enviar Solicitud';
      this.modoForm = 'create';
      this.showForm = true;
    } else if (this.modoCrud !== 'editar') {
      this.getTraslado(this.trasladoId);
      this.modoForm = 'get';
      this.title = this.modoCrud === 'ver' ? 'Detalle Solicitud' :
        this.modoCrud === 'revisar' ? 'Aprobar Solicitud' : 'Confirmar Traslado';
      this.boton = this.modoCrud === 'ver' ? '' :
        this.modoCrud === 'revisar' ? 'Aprobar Solicitud' : 'Confirmar Recepción de Traslado';
    } else if (this.trasladoId) {
      this.title = 'Editar Solicitud de Traslado';
      this.boton = 'Actualizar Solicitud de Traslado';
      this.getTraslado(this.trasladoId);
      this.modoForm = 'put';
    }
  }

  getTraslado(trasladoId: number) {
    this.trasladosHelper.getTraslado(trasladoId).subscribe(res => {
      if (res) {
        this.trasladoData = {};
        this.trasladoData.origen = res.FuncionarioOrigen;
        this.trasladoData.destino = res.FuncionarioDestino;
        this.trasladoData.ubicacion = res.Ubicacion;
        this.trasladoData.elementos = res.Elementos;
        this.trasladoData.observaciones = res.Observaciones;
        this.showForm = true;
      }
    });
  }

  private getFormatoTraslado() {
    this.movimientosHelper.getFormatoByNombre('Traslado').subscribe(res => {
      if (res.length) {
        this.formatoTraslado = res[0];
      }
    });
  }

  public setValidness(event) {
    this.valid = event;
    console.log(this.trasladoData)
  }

  public confirm(rechazar: boolean = false) {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.traslados.registro.confrmTtl'),
      text: this.translate.instant('GLOBAL.traslados.registro.confrmTxt'),
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

  private buildMovimiento(rechazar: boolean) {
    const val = this.trasladoData;
    const FuncionarioOrigen = val.controls.origen.value.tercero.Tercero.Id;
    const FuncionarioDestino = val.controls.destino.value.tercero.Tercero.Id;
    const Ubicacion = val.controls.ubicacion.value.ubicacion;
    const Observacion = val.controls.observaciones.value.observaciones;
    const estadoId = this.modoCrud === 'registrar' || this.modoCrud === 'editar' ? 'Traslado En Trámite' :
      rechazar ? 'Traslado Rechazado' : this.modoCrud === 'revisar' ? 'Traslado Aceptado' : this.modoCrud === 'confirmar' ? 'Traslado Confirmado' : '';

      const detalle = <DetalleTraslado>{
      FuncionarioOrigen,
      FuncionarioDestino,
      Ubicacion,
      Elementos: [969], // Cuando esté, se debe poner el id de cada elemento,
      Consecutivo: '',
    };

    const movimiento = <Movimiento>{
      Id: this.trasladoId,
      Detalle: JSON.stringify(detalle),
      Observacion,
      Activo: true,
      FormatoTipoMovimientoId: {
        Id: this.formatoTraslado.Id,
      },
      EstadoMovimientoId: {
        Id: this.estadosMovimiento.find(st => st.Nombre === estadoId).Id,
      },
    };
    if (this.modoCrud === 'registrar') {
      this.postTraslado(movimiento);
    } else {
      this.updateTraslado(movimiento);
    }
  }

  private updateTraslado(movimiento) {
    this.entradasHelper.putMovimiento(movimiento).toPromise().then((res: any) => {
      if (res) {
        this.alertSuccess(false);
      }
    });
  }

  private postTraslado(movimiento) {
    this.trasladosHelper.postTraslado(movimiento).subscribe((res: any) => {
      this.alertSuccess(false);
    });
  }

  private alertSuccess(aprobar: boolean) {
    const consecutivo = 'as'; //JSON.parse(this.movimiento.Detalle).consecutivo;
    (Swal as any).fire({
      type: 'success',
      title: this.translate.instant('GLOBAL.movimientos.entradas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'TtlOk'),
      text: this.translate.instant('GLOBAL.movimientos.entradas.' + (aprobar ? 'aprobacion' : 'rechazo') + 'TxtOk', { CONSECUTIVO: consecutivo }),
      showConfirmButton: false,
      timer: 3000,
    });
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length > 0) {
        this.estadosMovimiento = res;
      }
    });
  }
}
