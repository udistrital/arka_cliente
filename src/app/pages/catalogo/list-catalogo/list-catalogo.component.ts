import { Component, OnInit } from '@angular/core';
import { Catalogo } from '../../../@core/data/models/catalogo/catalogo';
import { LocalDataSource } from 'ng2-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Router } from '@angular/router';
import { SmartTableService } from '../../../@core/data/SmartTableService';
import { ConfiguracionService } from '../../../@core/data/configuracion.service';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-list-catalogo',
  templateUrl: './list-catalogo.component.html',
  styleUrls: ['./list-catalogo.component.scss'],
})
export class ListCatalogoComponent implements OnInit {

  uid: number;
  cambiotab: boolean[] = [true, false, false];
  settings: any;
  cargando: boolean = true;
  source: LocalDataSource = new LocalDataSource();

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private router: Router,
    private tabla: SmartTableService,
    private pUpManager: PopUpManager,
    private confService: ConfiguracionService,
  ) { }

  ngOnInit() {
    this.cargarCampos();
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
    const t = {
      crear: this.translate.instant('GLOBAL.catalogo.crear'),
      editar: this.translate.instant('GLOBAL.catalogo.editar'),
      desactivar: this.translate.instant('GLOBAL.catalogo.desactivar'),
    };
    this.settings = {
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
        add: !!this.confService.getRoute('/pages/catalogo/crud-catalogo'),
      },
      add: {
        addButtonContent: '<i class="fas" title="' + t.crear + '" aria-label="' + t.crear + '">'
          + this.translate.instant('GLOBAL.crear_nuevo') + '</i>',
      },
      edit: {
        editButtonContent: '<i class="far fa-edit" title="' + t.editar + '" aria-label="' + t.editar + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="fas fa-ban" title="' + t.desactivar + '" aria-label="' + t.desactivar + '"></i>',
      },
      mode: 'external',
      columns: {
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          width: '30%',
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          width: '30%',
        },
        FechaModificacion: {
          title: this.translate.instant('GLOBAL.Acta_Recibido.ConsultaActas.FechaModificacionHeader'),
          width: '20%',
          filter: {
            type: 'daterange',
            config: {
              daterange: {
                format: 'yyyy/mm/dd',
              },
            },
          },
          valuePrepareFunction: this.tabla.formatDate,
        },
        Activo: {
          width: '10%',
          title: this.translate.instant('GLOBAL.activo'),
          ...this.tabla.getSettingsBool(),
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.catalogoElementosService.getCatalogo(false).subscribe((res: Catalogo[]) => {
      this.source.load(res);
      this.cargando = false;
    });
  }

  onEdit(event): void {
    this.uid = event.data.Id;
    this.router.navigate(['/pages/catalogo/crud-catalogo'], { state: { example: this.uid } });
  }

  onCreate(): void {
    this.router.navigate(['/pages/catalogo/crud-catalogo']);
  }

  onDelete(event): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.catalogo.desactivar'),
      text: this.translate.instant('GLOBAL.catalogo.validacion_desactivar'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    };

    this.pUpManager.showAlertWithOptions(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          const catalogo = <Catalogo>event.data;
          catalogo.Activo = false;
          this.catalogoElementosService.putCatalogo(catalogo, catalogo.Id).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.successDesactivar();
            }
          });
        }
      });
  }

  private successDesactivar() {
    const opt = {
      title: this.translate.instant('GLOBAL.catalogo.desactivar'),
      text: this.translate.instant('GLOBAL.catalogo.desactivar_success'),
      type: 'success',
    };
    this.pUpManager.showAlertWithOptions(opt);
  }

}
