import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { ElementoSalida } from '../../../@core/data/models/salidas/salida_elementos';


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

  @Input('salida_id')
  set name(salida_id: number) {
    this.salida_id = salida_id;
    // console.log(this.subgrupo_id);
    if (this.salida_id !== undefined) {
      this.loadLists();
    }
  }

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;

  constructor(
    private router: Router,
    private actaRecibidoHelper: ActaRecibidoHelper,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private listService: ListService,
  ) {
    this.source = new LocalDataSource();
    this.detalle = false;
    this.listService.findProveedores();
    this.listService.findSedes();
    this.listService.findTipoBien();
    this.listService.findSubgruposConsumo();
    this.listService.findSubgruposConsumoControlado();
    this.listService.findSubgruposDevolutivo();
    this.cargarCampos();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      // this.loadTablaSettings();
    });
  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Consumo = list.listConsumo[0];
        this.ConsumoControlado = list.listConsumoControlado[0];
        this.Devolutivo = list.listDevolutivo[0];
        this.Proveedores = list.listProveedores[0];
        this.Sedes = list.listSedes[0];
        this.TipoBien = list.listTipoBien[0];
        // console.log(list);
        if (this.Consumo !== undefined && this.Devolutivo !== undefined &&
          this.ConsumoControlado !== undefined && this.Proveedores !== undefined &&
          this.Sedes !== undefined && this.salida_id !== undefined && this.TipoBien !== undefined) {
          this.CargarSalida();
        }
      },
    );

  }
  CargarSalida() {
    this.salidasHelper.getSalida(this.salida_id).subscribe(res1 => {
      if (Object.keys(res1[0]).length !== 0) {

        const detalle = JSON.parse(res1[0].Salida.Detalle);

        this.actaRecibidoHelper.getSedeDependencia(detalle.ubicacion).subscribe(res2 => {
          const valor = res2[0].EspacioFisicoId.Codigo.substring(0, 4);
          res1[0].Salida.Funcionario = this.Proveedores.find(x => x.Id === parseFloat(detalle.funcionario));
          res1[0].Salida.Sede = this.Sedes.find(y => y.Codigo === valor);
          res1[0].Salida.Dependencia = res2[0].DependenciaId;
          res1[0].Salida.Ubicacion = res2[0].EspacioFisicoId;
          this.salida = res1[0];
        });

        res1[0].Elementos.forEach(element => {
          this.actaRecibidoHelper.getElemento(element.ElementoActaId).subscribe(datos => {

            const elemento = new ElementoSalida();
            elemento.ValorUnitario = datos.ValorUnitario;
            elemento.ValorTotal = datos.ValorTotal;
            elemento.Id = datos.Id;
            elemento.Nombre = datos.Nombre;
            elemento.Cantidad = datos.Cantidad;
            elemento.Marca = datos.Marca;
            elemento.Serie = datos.Serie;
            elemento.TipoBienId = this.TipoBien.find(x => x.Id === datos.TipoBienId.Id);
            elemento.Funcionario = null;
            elemento.Sede = null;
            elemento.Asignado = false;
            elemento.Dependencia = null;
            elemento.Ubicacion = null;
            if (datos.TipoBienId.Id === 1 && Object.keys(this.Consumo[0]).length !== 0) {
              elemento.SubgrupoCatalogoId = this.Consumo.find(x => x.Id === datos.SubgrupoCatalogoId);
            }
            if (datos.TipoBienId.Id === 2 && Object.keys(this.ConsumoControlado[0]).length !== 0) {
              elemento.SubgrupoCatalogoId = this.ConsumoControlado.find(x => x.Id === datos.SubgrupoCatalogoId);
            }
            if (datos.TipoBienId.Id === 3 && Object.keys(this.Devolutivo[0]).length !== 0) {
              elemento.SubgrupoCatalogoId = this.Devolutivo.find(x => x.Id === datos.SubgrupoCatalogoId);
            }
            this.source.append(elemento);
            // console.log(elemento);
          });
        });
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
        TipoBienId: {
          title: 'Tipo de Bien',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        SubgrupoCatalogoId: {
          title: 'Subgrupo',
          valuePrepareFunction: (value: any) => {
            return value.Nombre;
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
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
      },
    };
  }

}
