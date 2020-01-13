import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { TranslateService } from '@ngx-translate/core';
import { BodegaConsumoHelper } from '../../../helpers/bodega-consumo/bodega-consumo-helper';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { PopUpManager } from '../../../managers/popUpManager';


@Component({
  selector: 'ngx-detalle-solicitud',
  templateUrl: './detalle-solicitud.component.html',
  styleUrls: ['./detalle-solicitud.component.scss'],
})
export class DetalleSolicitudComponent implements OnInit {
  salida_id: any;
  settings: any;
  source: LocalDataSource;
  kardex: any[];
  listColumns: object;
  observacion: any;
  fechaCreacion: any;
  funcionario: any;

  @Input('salida_id')
  set name(salida_id: any) {
    this.salida_id = salida_id;
    // console.log(this.subgrupo_id);
    if (this.salida_id !== undefined) {
      this.loadTablaSettings();
      this.loadSolicitud();
    }
  }
  constructor(private translate: TranslateService, private bodegaHelper: BodegaConsumoHelper,
    private tercerosHelper: TercerosHelper, private actasHelper: ActaRecibidoHelper,
    private pUpManager: PopUpManager ) {
    this.source = new LocalDataSource();
    this.observacion = '';
    this.fechaCreacion = '';
    this.funcionario = '';
  }

  ngOnInit() {
    // console.log('salida id: ', this.salida_id)

  }
  loadTablaSettings() {
    this.listColumns = {
      Id: {
        title: 'Consecutivo',
      },
      Elemento: {
        title: 'Elemento',
      },
      Detalle: {
        title: 'Detalle',
      },
      Cantidad: {
        title: 'Cantidad',
      },
      Disponible: {
        title: 'Disponible',
      },
      VUnitario: {
        title: 'Valor Unitario',
      },
      Total: {
        title: 'Total',
      },
      Observaciones: {
        title: 'Observaciones',
        edit: true,
      },

    };
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-check"></i>',
      },
      edit: {
        editButtonContent: '<i class="fas fa-times"></i>',

      },

      mode: 'external',
      columns: this.listColumns,
    };
  }
  /*   loadSolicitud(): void {
      this.bodegaHelper.getSolicitudBodega(this.salida_id.Id).subscribe(res => {
        if (res !== null) {
          res.forEach(movimiento => {
            this.movimiento = movimiento;
            this.detalle = JSON.parse(movimiento.Detalle);
            console.log(this.detalle.Elementos, 'elemento:  ', movimiento);
            // se trae la informacion del tercero asociado
            this.informacionFuncionario(this.detalle.Funcionario);
            // bucle para llenar la tabla de elementos
            this.detalle.Elementos.forEach( elemento =>{
              this.bodegaHelper.getElementos(elemento.ElementoActa).subscribe(res1 =>{
                console.log(res1,' elemmmment: ', res1[0].ElementoActaId)
                this.actasHelper.getElemento(res1[0].ElementoActaId).subscribe(res2 =>{
                  this.source.append({
                    Id: elemento.ElementoActa,
                    Elemento: res2.Nombre,
                    Detalle: res2.Marca + ' , ' + res2.Serie,
                    Cantidad: elemento.Cantidad ,
                    Disponible: res1[0].SaldoCantidad,
                    VUnitario: res2.ValorUnitario ,
                    Total: 'pendiente',
                    Observaciones:  'Pendiente'
                        // Elemento: '$20.000',
                        //Detalle: elemento.Observacion,
                        //Cantidad: '50'
                      });
                })
              })
            })
          });
        }
      })
    } */
  loadSolicitud(): void {
    this.bodegaHelper.getSolicitudBodega(this.salida_id.Id).subscribe(res => {
      if (res !== null) {
        this.fechaCreacion = res.FechaCreacion;
        this.observacion = res.Observacion;
        res.Elementos.forEach(elemento => {
          this.source.append({
            Id: elemento.Id,
            Elemento: elemento.Nombre,
            Detalle: elemento.Marca + ' , ' + elemento.Serie,
            Cantidad: elemento.CantidadSolicitada,
            Disponible: elemento.CantidadDisponible,
            VUnitario: elemento.ValorUnitario,
            Total: 'pendiente',
            Observaciones: 'Pendiente',
          });

        });
      }
    });
  }


  informacionFuncionario(funcionario) {
    this.tercerosHelper.getTerceroById(funcionario).subscribe(res1 => {
      if (res1 !== null) {
        this.funcionario = res1;
      }
    });
  }


  /*   loadSalidas(): void {
      this.kardex = [
        {
          Id: '02/01/2020', FechaRegistro: 'Ocurrio la situación x', Solicitante: '20', Elemento: '$20.000',
          Detalle: '$200.000', Cantidad: '50'
        },
        {
          Id: '02/01/2020', FechaRegistro: 'Ocurrio la situación x', Solicitante: '20', Elemento: '$20.000',
          Detalle: '$200.000', Cantidad: '50'
        }, {
          Id: '02/01/2020', FechaRegistro: 'Ocurrio la situación x', Solicitante: '20', Elemento: '$20.000',
          Detalle: '$200.000', Cantidad: '50'
        },
      ];
      //this.source.append(this.kardex);
      //this.source.setFilter(this.kardex, false)
      this.source.load(this.kardex);
    } */
      onAprobado(event) {
    this.pUpManager.showSuccessAlert('Peticion de elemento aprobada');
    // this.salidaId = `${event.data.Id}`;
    // this.detalle = true;
  }
  onRechazado(event) {
    this.pUpManager.showErrorAlert('Peticion de elemento rechazada');
    // this.salidaId = `${event.data.Id}`;
    // this.detalle = true;
  }

}
