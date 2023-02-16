import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PopUpManager } from '../../../managers/popUpManager';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { TransaccionEntrada } from '../../../@core/data/models/entrada/entrada';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { ListService } from '../../../@core/store/services/list.service';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';

@Component({
  selector: 'ngx-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})

export class RegistroComponent implements OnInit {

  // Datos Tabla
  source: LocalDataSource = new LocalDataSource();
  settings: any;
  tiposDeEntradas: any[];
  unidadesEjecutoras: any;
  idexud: boolean;
  // Acta de recibido
  actaSeleccionada: string = '';
  opcionEntrada: any = '';
  title: string;
  spinner: string;
  step: string; // = 'acta' || 'tipo' || 'formulario';

  @Input() ActaParaEditar: any;
  @Input() EntradaId: number;
  @Output() volver: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private actaRecibidoHelper: ActaRecibidoHelper,
    private entradasHelper: EntradaHelper,
    private pUpManager: PopUpManager,
    private translate: TranslateService,
    private tabla: SmartTableService,
    private listService: ListService,
    private store: Store<IAppState>,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.listService.findUnidadesEjecutoras();
  }

  ngOnInit() {
    this.title = 'GLOBAL.';
    this.actaSeleccionada = this.EntradaId && this.ActaParaEditar ? this.ActaParaEditar : '';
    this.loadTablaSettings();
    this.loadLists();
    if (this.EntradaId) {
      this.title += 'movimientos.entradas.editarTtl';
      this.cargarActa(this.ActaParaEditar);
    } else {
      this.title += 'registrar_entrada';
      this.cargarTiposDeEntradas();
    }

  }

  public loadLists() {
    this.store.select((state) => state).subscribe(list => {
      if (list.listUnidadesEjecutoras && list.listUnidadesEjecutoras.length && list.listUnidadesEjecutoras[0]) {
        this.unidadesEjecutoras = list.listUnidadesEjecutoras[0];
      }
    });
  }

  public onVolver() {
    if (!this.EntradaId) {
      if (this.step === 'formulario' && this.actaSeleccionada) {
        this.actaSeleccionada = '';
        this.step = 'acta';
      } else if ((this.step === 'formulario' && !this.actaSeleccionada) || this.step === 'acta') {
        this.opcionEntrada = '';
        this.step = 'tipo';
      } else if (this.step === 'tipo') {
        this.volver.emit(false);
      }
    } else {
      if (this.step === 'formulario') {
        this.opcionEntrada = '';
        this.step = 'tipo';
      } else if (this.step === 'tipo') {
        this.volver.emit(false);
      }
    }
  }

  public onSubmit(entrada: TransaccionEntrada) {
    if (entrada.Detalle) {
      this.spinner = this.EntradaId ? 'Actualizando Entrada' : 'Registrando Entrada';
      entrada.Id = this.EntradaId ? this.EntradaId : 0;
      this.entradasHelper.postEntrada(entrada, entrada.Id, false).subscribe((res: any) => {
        this.spinner = '';
        if (res.Error) {
          this.pUpManager.showErrorAlert(res.Error);
        } else if (res.Movimiento.Id) {
          this.pUpManager.showAlertWithOptions(this.getOptionsRegistro(res.Movimiento.Consecutivo));
          this.volver.emit(true);
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.entradas.registroFail'));
        }
      });
    }
  }

  private cargarActa(acta) {
    if (!acta) {
      this.cargarTiposDeEntradas();
      return;
    }

    this.spinner = 'Cargando detalle del acta';
    this.actaRecibidoHelper.getAllActaRecibido('query=Id:' + acta).subscribe(res => {
      this.spinner = '';
      if (res && res.length) {
        this.cargarTiposDeEntradas(res[0].TipoActaId.Id, res[0].UnidadEjecutoraId);
      }
    });
  }

  private getOptionsRegistro(consecutivo: string) {
    const modo = this.EntradaId ? 'update' : 'registro';
    return {
      type: 'success',
      title: this.translate.instant('GLOBAL.movimientos.entradas.' + modo + 'TtlOk', { CONSECUTIVO: consecutivo }),
      text: this.translate.instant('GLOBAL.movimientos.entradas.' + modo + 'TxtOk', { CONSECUTIVO: consecutivo }),
    };
  }

  private loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_actas_entrada'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'detalle',
            title: '<i class="fas fa-arrow-right" title="Seleccionar"></i>',
          },
        ],
      },
      columns: {
        Id: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaCreacionHeader'),
          ...this.tabla.getSettingsDate(),
        },
        FechaVistoBueno: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaVistoBuenoHeader'),
          ...this.tabla.getSettingsDate(),
        },
        RevisorId: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.ModificadaPor'),
        },
        DependenciaId: {
          title: this.translate.instant('GLOBAL.dependencia'),
        },
        PersonaAsignada: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.AceptadaPor'),
        },
        Observaciones: {
          title: this.translate.instant('GLOBAL.observaciones'),
        },
      },
    };
  }

  public loadActas(): void {
    if (this.opcionEntrada.NumeroOrden === 3 || this.actaSeleccionada) {
      this.step = 'formulario';
      return;
    }

    const idexud_ = this.entradasIDEXUD.some(u => u === this.opcionEntrada.CodigoAbreviacion);
    let unidadEjecutora = '';
    if (!idexud_) {
      const ud = this.unidadesEjecutoras.find(u => u.CodigoAbreviacion === 'UD');
      unidadEjecutora = ud ? ud.Id : '0';
    }

    this.step = 'acta';
    this.spinner = 'Cargando actas aceptadas';
    this.actaRecibidoHelper.getAllActasRecibido_('Aceptada', this.opcionEntrada.NumeroOrden, unidadEjecutora, -1, 0).subscribe(res => {
      this.spinner = '';
      if (res && res.length) {
        this.source.load(res);
      }
    });
  }

  public onActa(event) {
    this.step = 'formulario';
    this.actaSeleccionada = `${event.data.Id}`;
    const idexud_ = this.unidadesEjecutoras.find(u => u.CodigoAbreviacion === 'IDEXUD');
    this.idexud = idexud_ && idexud_.Id === event.data.UnidadEjecutoraId;
  }

  private cargarTiposDeEntradas(tipo?: number, unidadEjecutora?: number) {
    this.step = 'tipo';
    this.spinner = 'Cargando tipos de entradas';
    let entradasIDEXUD = '';
    this.idexud = false;
    if (unidadEjecutora) {
      const idexud = this.unidadesEjecutoras.find(u => u.CodigoAbreviacion === 'IDEXUD');
      entradasIDEXUD = idexud && unidadEjecutora === idexud.Id ? this.entradasIDEXUD.join(',') : '';
    }

    let query = 'limit=-1&sortby=Nombre&order=asc&query=CodigoAbreviacion';
    if (entradasIDEXUD) {
      this.idexud = true;
      query += '__in:' + entradasIDEXUD;
    } else {
      query += '__startswith:ENT_,NumeroOrden';
      if (tipo) {
        query += ':' + tipo;
      } else {
        query += '__lte:3';
      }
    }

    this.entradasHelper.getAllFormatoTipoMovimiento(query).subscribe(res_ => {
      this.spinner = '';
      this.tiposDeEntradas = res_;
    });
  }

  get entradasIDEXUD() {
    return ['ENT_ADQ'];
  }

}
