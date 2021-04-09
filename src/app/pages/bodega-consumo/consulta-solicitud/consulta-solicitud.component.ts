import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalDataSource } from 'ngx-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-consulta-solicitud',
  templateUrl: './consulta-solicitud.component.html',
  styleUrls: ['./consulta-solicitud.component.scss'],
})
export class ConsultaSolicitudComponent implements OnInit {

  settings: any;
  source: LocalDataSource;
  kardex: any[];
  listColumns: object;
  salidaId: any;
  mostrar: boolean;
  Editar: boolean = false;

  constructor(
    private translate: TranslateService,
    private bodegaHelper: BodegaConsumoHelper,
    private tercerosHelper: TercerosHelper,
    private route: ActivatedRoute,
  ) {
    this.source = new LocalDataSource();
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      // console.log({data});
      if (data && data.Editar !== null && data.Editar !== undefined) {
        this.Editar = data.Editar;
      }
      this.loadTablaSettings();
      this.loadSalidas();
    });
  }

  loadTablaSettings() {
    this.listColumns = {
      Id: {
        title: 'Consecutivo',
      },
      FechaRegistro: {
        title: 'Fecha de registro',
        // width: '70px',
        valuePrepareFunction: (value: any) => {
          const date = value.split('T');
          return date[0];
        },
      },
      Solicitante: {
        title: 'solicitante',
      },

    };
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.detalle'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            // name: this.translate.instant('GLOBAL.detalle'),
            name: 'Seleccionar',
            title: '<i class="fas fa-eye"></i>',
          },
        ],
      },
      columns: this.listColumns,
    };
  }

  loadSalidas(): void {
    if (this.Editar) {
      // console.log('Modo: Editar');
      this.bodegaHelper.getSolicitudesBodegaPendiente().subscribe(res => {
        // console.log({resEditar: res});
        if (res !== null) {
          this.completarInfoTercero(res);
        }
      });
    } else {
      // console.log('Modo: Consulta');
      this.bodegaHelper.getSolicitudesBodega().subscribe(res => {
        // console.log({resConsulta: res});
        if (Object.keys(res[0]).length !== 0) {
          // console.log(res)
          this.completarInfoTercero(res);
        }
      });
    }
  }

  private completarInfoTercero(res) {
          this.mostrar = true;
          let detalle: any;
          res.forEach((elemento, k) => {
            detalle = JSON.parse(elemento.Detalle);
            if (detalle.hasOwnProperty('Funcionario') && detalle.Funcionario) {
              this.tercerosHelper.getTerceroById(detalle.Funcionario).subscribe(res1 => {
                // console.log({k, detalle, res1});
                if (res1 !== null) {
                  // console.log('funcionario', res1.NombreCompleto);
                  this.source.append({
                    Id: elemento.Id,
                    FechaRegistro: elemento.FechaCreacion,
                    Solicitante: res1.Numero + ' - ' + res1.NombreCompleto,
                    // Elemento: '$20.000',
                    // Detalle: elemento.Observacion,
                    // Cantidad: '50'
                  });
                }
              });
            }
          });
  }

  onCustom(event) {
    const date = event.data.Solicitante.split(' - ');
    this.salidaId = {
      Id: event.data.Id,
      Cedula: date[0],
      Funcionario: date[1],
    };
    // console.log({event, salidaId: this.salidaId});
  }

  onVolver() {
    this.salidaId = undefined;
  }

}
