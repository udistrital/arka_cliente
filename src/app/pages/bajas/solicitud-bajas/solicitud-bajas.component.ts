import { Component, OnInit } from '@angular/core';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { BajasHelper } from '../../../helpers/bajas/bajasHelper';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { UserService } from '../../../@core/data/users.service';

@Component({
  selector: 'ngx-solicitud-bajas',
  templateUrl: './solicitud-bajas.component.html',
  styleUrls: ['./solicitud-bajas.component.scss'],
})
export class SolicitudBajasComponent implements OnInit {

  DatosElemento: any;
  DatosTabla: any[];
  DatosSolicitante: any;
  HabilitarFormulario: boolean;
  Soportes: any;
  Movimiento: any;
  ElementoMovimiento: any;
  EstadosMovimiento: any;
  FormatosMovimiento: any;
  constructor(
    private router: Router,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private bajasHelper: BajasHelper,
    private store: Store<IAppState>,
    private listService: ListService,
    private userService: UserService,
    ) {
    listService.findformatosMovimiento();
    listService.findEstadosMovimiento();
    this.loadLists();
    }

  ngOnInit() {
    this.DatosElemento = false;
    this.DatosSolicitante = false;
    this.DatosTabla = [];
    this.Soportes = [];
  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        // console.log(list.listFormatosKardex[0]);
        // console.log(list.listEstadosMovimiento[0])
        this.FormatosMovimiento = list.listFormatosMovimiento[0];
        this.EstadosMovimiento = list.listEstadosMovimiento[0];
      },
    );
  }
  Datos_Elemento(elemento: any) {
    if (elemento !== false) {
      this.DatosElemento = elemento;
      // console.log(this.DatosElemento)
    }

    this.Validar_Datos();

  }
  Datos_Solicitante(solicitante: any) {
    if (solicitante !== false) {
      this.DatosSolicitante = solicitante;
      // console.log(this.DatosSolicitante)
    }
    this.Validar_Datos();
  }
  Datos_Tabla(elementos: any) {
    this.DatosTabla = elementos;
    // console.log(this.DatosTabla)
    this.DatosTabla.forEach((element, index) => {
      this.Soportes[index] = element.Soporte;
      // console.log(this.Soportes)
    });

    this.Validar_Datos();

  }
  Validar_Datos() {
    if (this.DatosElemento !== false && this.DatosSolicitante !== false) {
      if (this.DatosTabla !== []) {
        this.HabilitarFormulario = true;
      }
    }
  }

  async postSoporteNuxeo(files: any) {
    // console.log(files);
    return new Promise(async (resolve, reject) => {
      files.forEach((file) => {
        // console.log(file);
        file.Id = file.nombre;
        file.nombre = 'soporte_' + file.IdDocumento + '_bajas';
        // file.key = file.Id;
        file.key = 'soporte_' + file.IdDocumento;
      });
      // console.log(files);
      await this.nuxeoService.getDocumentos$(files, this.documentoService)
        .subscribe(response => {
          // console.log('response', response);
          if (Object.keys(response).length === files.length) {
            resolve(response[files[0].key]);
          }
        }, error => {
          reject(error);
        });
    });
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  async onSubmit() {
    // console.log(this.Soportes)

    const start = async () => {
      await this.asyncForEach(this.Soportes, async (file, index) => {
        await this.postSoporteNuxeo([file]).then((resp: any) => {
          // console.log(resp);
          this.DatosTabla[index].Soporte.Id = resp.Id;
        });
      });

    };
    await start();


    const Elementos: any[] = [];

    this.DatosTabla.forEach((element: any) => {
      Elementos.push({
        Id: element.Id,
        Soporte: element.Soporte.Id,
        Observaciones: element.Observaciones,
        TipoBaja: element.TipoBaja,
      });
    });
    const Baja: any = {
      Funcionario : this.DatosSolicitante.Funcionario.Id,
      Ubicacion : this.DatosSolicitante.Ubicacion.Id,
      Revisor: this.userService.getPersonaId(),
      FechaVistoBueno: null,
      Elementos : Elementos,
    };

    this.Movimiento = {};
    this.Movimiento.Observacion = 'Solicitud de Bajas de Elementos';
    this.Movimiento.Activo = true;
    this.Movimiento.Detalle = JSON.stringify(Baja);
    this.Movimiento.FormatoTipoMovimientoId = this.FormatosMovimiento.find(x => x.CodigoAbreviacion === 'SOL_BAJA');
    this.Movimiento.EstadoMovimientoId = this.EstadosMovimiento.find(x => x.Id === 5);
    this.Movimiento.MovimientoPadreId = null;

    this.bajasHelper.postSolicitud(this.Movimiento).subscribe((res: any) => {
      const opt: any = {
        title: 'Solicitud Realizada',
        text: 'Se ha registrado la solicitud de los elementos relacionados',
        type: 'success',
      };
      (Swal as any).fire(opt);
      this.router.navigate(['/pages/bajas/consulta_solicitud_bajas']);
    });



  }
}
