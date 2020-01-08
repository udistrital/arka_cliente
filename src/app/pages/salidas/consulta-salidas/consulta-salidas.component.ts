import { Component, OnInit } from '@angular/core';
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
import { parse } from 'path';

@Component({
  selector: 'ngx-consulta-salidas',
  templateUrl: './consulta-salidas.component.html',
  styleUrls: ['./consulta-salidas.component.scss'],
})
export class ConsultaSalidasComponent implements OnInit {

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;
  salidaId: string;
  Proveedores: any;
  Dependencias: any;
  Sedes: any;

  constructor(
    private router: Router,
    private salidasHelper: SalidaHelper,
    private translate: TranslateService,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private store: Store<IAppState>,
    private Actas_Recibido: ActaRecibidoHelper,
    private listService: ListService,
  ) {
    this.source = new LocalDataSource();
    this.detalle = false;
    this.loadTablaSettings();
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findProveedores();
    this.loadLists();
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Proveedores = list.listProveedores[0];
        this.Dependencias = list.listDependencias[0];
        // this.Ubicaciones = list.listUbicaciones[0];
        this.Sedes = list.listSedes[0];
        // this.dataService = this.completerService.local(this.Ubicaciones, 'Nombre', 'Nombre');
        // console.log(this.Proveedores);
        // console.log(this.Dependencias);
        // console.log(this.Sedes);
        // console.log(list);
        if (this.Dependencias !== undefined && this.Sedes !== undefined && this.Proveedores !== undefined) {
          // console.log('ok');
          this.source.getElements().then((res) => {
            // console.log(Object.keys(res));
            if (Object.keys(res).length === 0) {
              this.loadSalidas();
            }
          });
        }
      },
    );
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
  }

  loadTablaSettings() {
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
      columns: {
        Id: {
          title: 'Consecutivo',
        },
        Observacion: {
          title: 'Observaciones',
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        FechaModificacion: {
          title: this.translate.instant('GLOBAL.fecha_entrada'),
          width: '70px',
          valuePrepareFunction: (value: any) => {
            const date = value.split('T');
            return date[0];
          },
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        MovimientoPadreId: {
          title: 'Entrada Asociada',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value;
            } else {
              return '';
            }
          },
        },
        Funcionario: {
          title: 'Funcionario',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.NomProveedor;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.NomProveedor.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
        Sede: {
          title: 'Sede',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
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
        Dependencia: {
          title: 'Dependencia',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.Nombre;
            } else {
              return '';
            }
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
        Ubicacion: {
          title: 'Ubicacion',
          valuePrepareFunction: (value: any) => {
            if (value !== null) {
              return value.EspacioFisicoId.Nombre;
            } else {
              return '';
            }
          },
          filterFunction: (cell?: any, search?: string): boolean => {
            // console.log(cell);
            // console.log(search);
            if (Object.keys(cell).length !== 0) {
              if (cell.EspacioFisicoId.Nombre.indexOf(search) > -1) {
                return true;
              } else {
                return false;
              }
            } else {
              return false;
            }
          },
        },
      },
    };
  }
  loadSalidas(): void {

      this.salidasHelper.getSalidas().subscribe(res1 => {
        // console.log(res1);
        if (res1 !== null) {
          const datos = res1;
          datos.forEach(element => {
            const detalle = JSON.parse(element.Detalle);
            // console.log(detalle)
            this.Actas_Recibido.getSedeDependencia(detalle.ubicacion).subscribe(res => {
              const valor = res[0].EspacioFisicoId.Codigo.substring(0, 4);
              // console.log(res)
              element.Funcionario = this.Proveedores.find(x => x.Id === parseFloat(detalle.funcionario));
              element.Ubicacion = res[0];
              element.Sede = this.Sedes.find(y => y.Codigo === valor);
              element.Dependencia = res[0].DependenciaId;
              this.source.append(element);
            });
          });
          // console.log(datos);
          // this.source.load(datos);
        }
      });
  }
  onCustom(event) {
    this.salidaId = `${event.data.Id}`;
    this.detalle = true;
  }
  onVolver() {
    // this.source.empty().then(() => {
       this.detalle = !this.detalle;
    //   if (this.Dependencias !== undefined && this.Sedes !== undefined && this.Proveedores !== undefined) {
    //    // console.log('ok');
    //     this.loadSalidas();
    //  }
    // });
  }
}
