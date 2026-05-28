import { Component, OnInit, Input } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { ReportesHelper } from '../../../helpers/reportes/reportesHelper';

@Component({
  selector: 'ngx-consulta-salida-especifica',
  templateUrl: './consulta-salida-especifica.component.html',
  styleUrls: ['./consulta-salida-especifica.component.scss'],
})
export class ConsultaSalidaEspecificaComponent implements OnInit {
  salida_id: number;
  refresh_version: number;
  salida: any;
  estadoMovimientoNombre: string;
  mode: string = 'determinate';

  @Input('salida_id')
  set name(salida_id: number) {
    this.salida_id = salida_id;
    if (this.salida_id !== undefined) {
      this.CargarSalida();
    }
  }

  @Input('refresh_version')
  set refreshVersion(refresh_version: number) {
    this.refresh_version = refresh_version;
    if (this.salida_id !== undefined && this.refresh_version !== undefined) {
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
  linkEntrada: string;
  sourceComprobante: LocalDataSource;
  settingsComprobante: any;
  trContableDetallePorElemento: any;
  totalDebitoComprobante: number = 0;
  totalCreditoComprobante: number = 0;

  constructor(
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private reportesHelper: ReportesHelper,

  ) {
    this.source = new LocalDataSource();
    this.sourceComprobante = new LocalDataSource();
    this.detalle = false;
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.cargarCampos();
      this.cargarCamposComprobante();
    });
    this.cargarCampos();
    this.cargarCamposComprobante();

  }


  CargarSalida() {
    this.salidasHelper.getSalida(this.salida_id).subscribe((res: any) => {
      if (res.Salida) {

        res.Salida.MovimientoPadreId.Detalle = JSON.parse(res.Salida.MovimientoPadreId.Detalle);
        this.linkEntrada = '#/pages/entradas/consulta_entrada/' + res.Salida.MovimientoPadreId.Id;

        this.salida = res.Salida;
        this.estadoMovimientoNombre = res.Salida.EstadoMovimientoId && res.Salida.EstadoMovimientoId.Nombre;

        if (res.Elementos.length) {
          this.source.load(res.Elementos);
        }

        if (res.TransaccionContable) {
          const fecha = new Date(res.TransaccionContable.Fecha).toLocaleString();
          this.trContable = {
            rechazo: '',
            movimientos: res.TransaccionContable.movimientos,
            concepto: res.TransaccionContable.Concepto,
            fecha,
          };
        }

        this.cargarDetalleCuentasSalida(this.salida.Consecutivo);
      }
    });
  }

  cargarDetalleCuentasSalida(consecutivo: string) {
    if (!consecutivo) {
      this.sourceComprobante.load([]);
      return;
    }

    this.reportesHelper.getDetalleCuentasSalida(consecutivo).subscribe((res: any[]) => {
      const rows = Array.isArray(res) ? res : [];
      this.sourceComprobante.load(rows);
      this.totalDebitoComprobante = rows.reduce((acc, row) => acc + this.parseCurrencyValue(row.Debito), 0);
      this.totalCreditoComprobante = rows.reduce((acc, row) => acc + this.parseCurrencyValue(row.Credito), 0);
      this.trContableDetallePorElemento = {
        rechazo: '',
        movimientos: rows.map((row) => ({
          Cuenta: this.parseCuentaLabel(row.Cuenta),
          TerceroId: this.parseTerceroLabel(row.Tercero),
          Descripcion: row.Descripcion,
          Debito: this.parseCurrencyValue(row.Debito),
          Credito: this.parseCurrencyValue(row.Credito),
        })),
      };
    });
  }

  private parseCurrencyValue(value: any): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const normalizedValue = value
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      const parsedStringValue = Number(normalizedValue);
      return Number.isFinite(parsedStringValue) ? parsedStringValue : 0;
    }

    const parsedGenericValue = Number(value);
    return Number.isFinite(parsedGenericValue) ? parsedGenericValue : 0;
  }

  private parseCuentaLabel(value: string) {
    if (!value) {
      return { Codigo: '', Nombre: '', RequiereTercero: false };
    }
    const parts = value.split(' - ');
    return {
      Codigo: parts.shift() || '',
      Nombre: parts.join(' - '),
      RequiereTercero: !!value,
    };
  }

  private parseTerceroLabel(value: string) {
    if (!value) {
      return null;
    }
    const parts = value.split(' - ');
    return {
      Numero: parts.shift() || '',
      NombreCompleto: parts.join(' - '),
    };
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
            return (!value || !value.SubgrupoId) ? '' :
              value.SubgrupoId.Codigo ? (value.SubgrupoId.Codigo + ' - ' + value.SubgrupoId.Nombre) : value.SubgrupoId.Nombre;
          },
          filterFunction: this.filterFunction,
        },
        TipoBienId: {
          title: 'Tipo de Bien',
          valuePrepareFunction: (value: any) => {
            return value ? value.Nombre : '';
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

  cargarCamposComprobante() {
    this.settingsComprobante = {
      hideSubHeader: false,
      noDataMessage: 'No se encontraron cuentas contables asociadas.',
      actions: false,
      pager: {
        display: true,
        perPage: 10,
      },
      columns: {
        Secuencia: {
          title: 'Secuencia',
        },
        Cuenta: {
          title: 'Cuenta',
        },
        Tercero: {
          title: 'Tercero',
          valuePrepareFunction: (value: string) => value || '',
        },
        Descripcion: {
          title: 'Descripción',
        },
        Debito: {
          title: 'Débito',
          type: 'html',
          valuePrepareFunction: (value: number) => {
            const formatted = value ? Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value) : '';
            return '<p class="currency">' + formatted + '</p>';
          },
        },
        Credito: {
          title: 'Crédito',
          type: 'html',
          valuePrepareFunction: (value: number) => {
            const formatted = value ? Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value) : '';
            return '<p class="currency">' + formatted + '</p>';
          },
        },
      },
    };
  }

  private filterFunction(cell?: any, search?: string): boolean {
    if (cell && search.length) {
      if (cell.SubgrupoId && cell.SubgrupoId.Codigo && cell.SubgrupoId.Nombre) {
        if ((cell.SubgrupoId.Codigo + ' - ' + cell.SubgrupoId.Nombre.toUpperCase()).indexOf(search.toUpperCase()) > -1) {
          return true;
        } else {
          return false;
        }
      } else if (cell.SubgrupoId && cell.SubgrupoId.Nombre) {
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
