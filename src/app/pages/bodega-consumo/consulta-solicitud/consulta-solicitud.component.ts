import { Component, OnInit, Input } from '@angular/core';
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
  detalle: boolean;
  listColumns: object;
  salidaId: any;
  Editar: boolean = false;
  @Input('Editar')
  set name(edit: boolean){
    this.Editar = edit;
  }

  constructor(private translate: TranslateService,
    private bodegaHelper: BodegaConsumoHelper, private tercerosHelper: TercerosHelper) {
    this.source = new LocalDataSource();



  }

  ngOnInit() {
    this.loadTablaSettings();
    this.loadSalidas();
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

      /* Elemento: {
         title: 'Elemento',
       },
       Detalle: {
         title: 'Detalle',
       },
       Cantidad: {
         title: 'Cantidad',
       },*/

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
      this.bodegaHelper.getSolicitudesBodegaPendiente().subscribe(res => {
        if (res !== null) {
          // console.log(res)
          let detalle: any;
          res.forEach(elemento => {
            detalle = JSON.parse(elemento.Detalle);
            this.tercerosHelper.getTerceroById(detalle.Funcionario).subscribe(res1 => {
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
          });
        }
      });
    } else {
      this.bodegaHelper.getSolicitudesBodega().subscribe(res => {
        if (Object.keys(res[0]).length !== 0) {
          // console.log(res)
          let detalle: any;
          res.forEach(elemento => {
            detalle = JSON.parse(elemento.Detalle);
            this.tercerosHelper.getTerceroById(detalle.Funcionario).subscribe(res1 => {
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
          });
        }
      });
    }
  }

  onCustom(event) {
    const date = event.data.Solicitante.split(' - ');
    this.salidaId = {
      Id: event.data.Id,
      Cedula: date[0],
      Funcionario: date[1],
    };
    this.detalle = true;
  }

  onVolver() {
    this.detalle = false;
  }

}
