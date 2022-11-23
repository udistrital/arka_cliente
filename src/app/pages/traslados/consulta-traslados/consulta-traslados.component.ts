import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { EstadoMovimiento } from '../../../@core/data/models/entrada/entrada';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { UserService } from '../../../@core/data/users.service';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { TrasladosHelper } from '../../../helpers/movimientos/trasladosHelper';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-consulta-traslados',
  templateUrl: './consulta-traslados.component.html',
  styleUrls: ['./consulta-traslados.component.scss'],
})

export class ConsultaTrasladosComponent implements OnInit {

  settings: any;
  modo: string; // 'consulta' || 'confirmacion' || 'revision';
  modoCrud: string; // 'registrar' || 'ver' || 'editar' || 'confirmar' || 'revisar';
  source: LocalDataSource;
  estadosMovimiento: Array<EstadoMovimiento>;
  mostrar: boolean;
  filaSeleccionada: any;
  trasladoId: number;
  title: string;
  subtitle: string;

  constructor(
    private translate: TranslateService,
    private entradasHelper: EntradaHelper,
    private route: ActivatedRoute,
    private trasladosHelper: TrasladosHelper,
    private pUpManager: PopUpManager,
    private confService: ConfiguracionService,
    private userService: UserService,
    private tabla: SmartTableService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data && data.modo !== null && data.modo !== undefined) {
        this.modo = data.modo;
      }
    });
    this.source = new LocalDataSource();
    this.loadEstados();
    this.title = this.translate.instant('GLOBAL.traslados.' + this.modo + '.title');
    this.subtitle = this.translate.instant('GLOBAL.traslados.' + this.modo + '.subtitle');
  }

  loadTraslados(): void {
    this.trasladosHelper.getTraslados(this.modo === 'confirmacion', this.modo === 'revision')
      .subscribe(res => {
        if (res.length) {
          res.forEach(salida => {
            salida.EstadoMovimientoId = this.estadosMovimiento.find(estado =>
              estado.Id === salida.EstadoMovimientoId).Nombre;
          });
        }
        this.source.load(res);
        this.source.setSort([{ field: 'FechaCreacion', direction: 'desc' }]);
        this.mostrar = true;
      });
  }

  private loadEstados() {
    this.entradasHelper.getEstadosMovimiento().toPromise().then(res => {
      if (res.length) {
        this.estadosMovimiento = res;
        this.loadTablaSettings();
        this.loadTraslados();
      }
    });
  }

  public actualizarVista() {
    if (this.modo === 'revision') {
      this.source.remove(this.filaSeleccionada);
    } else {
      this.loadTraslados();
    }
  }

  public onRegister() {
    const query = 'Nombre__in:cierreEnCurso,Valor:true';
    this.confService.getAllParametro(query).subscribe(res => {
      if (res && res.length) {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
      } else {
        this.modoCrud = 'registrar';
        this.trasladoId = 0;
      }
    });
  }

  public onEdit(event) {
    this.filaSeleccionada = event.data;
    if (this.modo === 'consulta') {
      if (event.data.EstadoMovimientoId === 'Traslado Rechazado' || event.data.EstadoMovimientoId === 'Traslado Por Confirmar') {
        const usuario = this.userService.getPersonaId();
        if (usuario && event.data && event.data.FuncionarioOrigen &&
          event.data.FuncionarioOrigen.Id && event.data.FuncionarioOrigen.Id === usuario) {
          const query = 'Nombre__in:cierreEnCurso,Valor:true';
          this.confService.getAllParametro(query).subscribe(res => {
            if (res && res.length) {
              this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
            } else {
              this.modoCrud = 'editar';
              this.trasladoId = event.data.Id;
            }
          });
        } else {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.consulta.errorPermisoEditar'));
        }
      } else {
        this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.traslados.consulta.errorEditar'));
      }
    } else if (this.modo === 'confirmacion') {
      const query = 'Nombre__in:cierreEnCurso,Valor:true';
      this.confService.getAllParametro(query).subscribe(res => {
        if (res && res.length) {
          this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
        } else {
          this.modoCrud = 'confirmar';
          this.trasladoId = event.data.Id;
        }
      });
    } else if (this.modo === 'revision') {
      const query = 'Nombre__in:modificandoCuentas|cierreEnCurso,Valor:true';
      this.confService.getAllParametro(query).subscribe(res => {
        if (res && res.length) {
          if (res[0].Nombre === 'cierreEnCurso') {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cierres.alertaEnCurso'));
          } else {
            this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.cuentas.alerta_modificacion'));
          }
        } else {
          this.modoCrud = 'revisar';
          this.trasladoId = event.data.Id;
        }
      });
    }
  }

  public onDelete(event) {
    this.filaSeleccionada = event.data;
    this.modoCrud = 'ver';
    this.trasladoId = event.data.Id;
  }

  volver() {
    this.modoCrud = '';
    this.filaSeleccionada = null;
  }

  private loadTablaSettings() {
    const t = {
      registrar: this.translate.instant('GLOBAL.traslados.consulta.nuevoTraslado'),
      delete: this.translate.instant('GLOBAL.verDetalle'),
      edit: this.translate.instant('GLOBAL.traslados.' + (this.modo === 'consulta' ? this.modo : 'revisar') + '.accionEdit'),
      icon: this.modo === 'consulta' ? 'eye' : 'edit',
    };
    const estadoSelect = 'GLOBAL.traslados.estados.';
    const columns = this.modo === 'consulta' ? {
      EstadoMovimientoId: {
        title: this.translate.instant('GLOBAL.traslados.consulta.estadoTraslado'),
        width: '300px',
        filter: {
          type: 'list',
          config: {
            selectText: this.translate.instant('GLOBAL.seleccionar') + '...',
            list: [
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Por Confirmar').Nombre,
                title: this.translate.instant(estadoSelect + 'tramite'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Confirmado').Nombre,
                title: this.translate.instant(estadoSelect + 'confirmado'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Rechazado').Nombre,
                title: this.translate.instant(estadoSelect + 'rechazado'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Aprobado').Nombre,
                title: this.translate.instant(estadoSelect + 'aprobado'),
              },
              {
                value: this.estadosMovimiento.find(status => status.Nombre === 'Traslado Anulado').Nombre,
                title: this.translate.instant(estadoSelect + 'anulado'),
              },
            ],
          },
        },
      },
    } : [];

    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.traslados.consulta.' +
        (this.modo === 'consulta' ? 'noTrasladosView' : this.modo === 'revision' ? 'noTrasladosReview' : 'noTrasladosConfirm')),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        position: 'right',
        delete: this.modo === 'consulta',
        edit: true,
        add: !!this.confService.getAccion('registrarTraslado'),
      },
      add: {
        addButtonContent: '<i class="fas" title="' + t.registrar + '" aria-label="' + t.registrar + '">'
          + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      edit: {
        editButtonContent: '<i class="fas fa-edit" title="' + t.edit + '" aria-label="' + t.edit + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-eye" title="' + t.delete + '" aria-label="' + t.delete + '"></i>',
      },
      mode: 'external',
      columns: {
        Consecutivo: {
          title: this.translate.instant('GLOBAL.consecutivo'),
        },
        FechaCreacion: {
          title: this.translate.instant('GLOBAL.fecha_creacion'),
          width: '70px',
          valuePrepareFunction: this.tabla.formatDate,
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
        },
        FuncionarioOrigen: {
          title: this.translate.instant('GLOBAL.funcionarioOrigen'),
          ...this.tabla.getSettingsObject('NombreCompleto'),
        },
        FuncionarioDestino: {
          title: this.translate.instant('GLOBAL.funcionarioDestino'),
          ...this.tabla.getSettingsObject('NombreCompleto'),
        },
        Ubicacion: {
          title: this.translate.instant('GLOBAL.ubicacion'),
        },
        ...columns,
      },
    };
  }

}
