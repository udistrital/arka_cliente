import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';

@Component({
  selector: 'ngx-consulta-salida-especifica',
  templateUrl: './consulta-salida-especifica.component.html',
  styleUrls: ['./consulta-salida-especifica.component.scss'],
})

export class ConsultaSalidaEspecificaComponent implements OnInit {
  salida_id: number;
  salida: any;
  Proveedores: any;
  Consumo: any;
  Devolutivo: any;
  ConsumoControlado: any;
  Dependencias: any;
  Sedes: any;
  TipoBien: any;
  mode: string = 'determinate';

  @Input('salida_id')
  set name(salida_id: number) {
    this.salida_id = salida_id;
    if (this.salida_id !== undefined) {
      this.CargarSalida();
    }
  }

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  trContable: any;
  fecha: Date;
  concepto: string;
  consecutivo: string;

  constructor(
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,

  ) {
    this.source = new LocalDataSource();
    this.detalle = false;
    // this.listService.findProveedores();
    // this.listService.findSedes();
    this.cargarCampos();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      // this.loadTablaSettings();
    });

  }


  CargarSalida() {
    this.salidasHelper.getSalida(this.salida_id).subscribe((res: any) => {
      if (res.Salida) {

        res.Salida.MovimientoPadreId.Detalle = JSON.parse(res.Salida.MovimientoPadreId.Detalle);
        this.salida = res.Salida;

        if (res.Elementos.length) {
          res.Elementos.forEach(el => {
            const sg = el.SubgrupoCatalogoId;
            el.SubgrupoCatalogoId = sg.SubgrupoId;
            el.TipoBienId = sg.TipoBienId;
          });
          this.source.load(res.Elementos);
        }

        if (res.trContable) {
          const fecha = new Date(res.trContable.fecha).toLocaleString();
          this.trContable = {
            rechazo: '',
            movimientos: res.trContable.movimientos,
            concepto: res.trContable.concepto,
            fecha,
          };
        }
      }
    });
  }
  cargarCampos() {

    this.settings = {
      hideSubHeader: false,
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Acciones',
        position: 'right',
        add: false,
        delete: false,
        edit: false,
      },
      columns: {
        Nombre: {
          title: 'Elemento',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Cantidad: {
          title: 'Cantidad',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Placa: {
          title: 'Placa',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        SubgrupoCatalogoId: {
          title: this.translate.instant('GLOBAL.subgrupo.clase.nombre'),
          valuePrepareFunction: (value: any) => {
            return !value ? '' : value.Codigo ? value.Codigo + ' - ' + value.Nombre : value.Nombre;
          },
          filterFunction: this.filterFunction,
        },
        TipoBienId: {
          title: 'Tipo de Bien',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            if (cell && search.length) {
              if (cell.Nombre) {
                if (cell.Nombre.toUpperCase().indexOf(search.toUpperCase()) > -1) {
                  return true;
                } else {
                  return false;
                }
              }
            } else {
              return false;
            }
          },
        },
        Marca: {
          title: 'Marca',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Serie: {
          title: 'Serie',
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        ValorTotal: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.ValorTotalHeader'),
          type: 'html',
          valuePrepareFunction: (data) => {
            const value = data ? Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(data) : '';
            return '<p class="currency">' + value + '</p>';
          },
        },
        VidaUtil: {
          title: this.translate.instant('GLOBAL.vidaUtilSug'),
        },
        ValorResidual: {
          title: this.translate.instant('GLOBAL.valorResidualSug'),
        },
      },
    };
  }

  private filterFunction(cell?: any, search?: string): boolean {
    if (cell && search.length) {
      if (cell.Codigo && cell.Nombre) {
        if ((cell.Codigo + ' - ' + cell.Nombre.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
          return true;
        } else {
          return false;
        }
      } else if (cell.Nombre) {
        if ((cell.Nombre.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

}
