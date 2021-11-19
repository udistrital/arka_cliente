import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { EstadoMovimiento, FormatoTipoMovimiento, Movimiento } from '../../../@core/data/models/entrada/entrada';
import { DetalleTraslado } from '../../../@core/data/models/movimientos_arka/movimientos_arka';
import { MovimientosHelper } from '../../../helpers/movimientos/movimientosHelper';
import { TrasladosHelper } from '../../../helpers/traslados/trasladosHelper';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-registro-traslado',
  templateUrl: './registro-traslado.component.html',
  styleUrls: ['./registro-traslado.component.scss'],
})
export class RegistroTrasladoComponent implements OnInit {

  trasladoData: any;
  valid: boolean;
  formatoTraslado: FormatoTipoMovimiento;
  estadoMovimiento: EstadoMovimiento;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private pUpManager: PopUpManager,
    private movimientosHelper: MovimientosHelper,
    private trasladosHelper: TrasladosHelper,
  ) { }

  ngOnInit() {
    this.getFormatoTraslado();
    this.getEstadoMovimiento();
  }

  private getFormatoTraslado() {
    this.movimientosHelper.getFormatoByNombre('Solicitud de Traslado').subscribe(res => {
      if (res !== null) {
        this.estadoMovimiento = res[0];
      }
    });
  }

  private getEstadoMovimiento() {
    this.movimientosHelper.getEstadoByNombre('Entrada Rechazada').subscribe(res => {
      if (res !== null) {
        this.formatoTraslado = res[0];
      }
    });
  }

  public setValidness(event) {
    this.valid = event;
  }

  public confirm() {
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
        this.registrar();
      }
    });
  }

  private registrar() {
    const detalle = <DetalleTraslado>{
      FuncionarioOrigen: this.trasladoData.origen.tercero.Tercero.Id,
      FuncionarioDestino: this.trasladoData.destino.tercero.Tercero.Id,
      Ubicacion: this.trasladoData.ubicacion.ubicacion,
      Elementos: [969], // Cuando esté, se debe poner el id de cada elemento,
      Consecutivo: '',
    };
    const movimiento = <Movimiento>{
      Detalle: JSON.stringify(detalle),
      Observacion: this.trasladoData.observaciones.observaciones,
      Activo: true,
      FormatoTipoMovimientoId: {
        Id: this.formatoTraslado.Id,
      },
      EstadoMovimientoId: {
        Id: this.estadoMovimiento.Id,
      },
    };
    this.trasladosHelper.postTraslado(movimiento).subscribe( (res: any) => {
    const consecutivo = JSON.parse(res.Detalle).Consecutivo;
    const title = this.translate.instant('GLOBAL.traslados.registro.successTtl');
    const text = this.translate.instant('GLOBAL.traslados.registro.successTxt', { CONSECUTIVO: consecutivo });
    const options = {
      type: 'success',
      title,
      text,
      showConfirmButton: false,
      timer: 5000,
    };
    this.pUpManager.showAlertWithOptions(options);
    this.router.navigate(['/pages/salidas/consulta_salidas']);
    });
  }

}
