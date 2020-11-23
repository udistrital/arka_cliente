import { Component, OnInit } from '@angular/core';
import { Catalogo } from '../../../@core/data/models/catalogo';
import { LocalDataSource } from 'ngx-smart-table';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import 'style-loader!angular2-toaster/toaster.css';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import {Router} from '@angular/router';

@Component({
  selector: 'ngx-list-catalogo',
  templateUrl: './list-catalogo.component.html',
  styleUrls: ['./list-catalogo.component.scss'],
})
export class ListCatalogoComponent implements OnInit {
  uid: number;
  cambiotab: boolean[] = [true, false, false];
  config: ToasterConfig;
  settings: any;

  source: LocalDataSource = new LocalDataSource();

  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private toasterService: ToasterService,
    public router: Router,
  ) {
    this.loadData();
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
  }

  cargarCampos() {
    this.settings = {
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.Acciones'),
      },
      add: {
        addButtonContent: '<i class="nb-plus"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash"></i>',
        confirmDelete: true,
      },
      mode: 'external',
      columns: {
        // Id: {
        //   title: this.translate.instant('GLOBAL.id'),
        //   // type: 'number;',
        //   valuePrepareFunction: (value) => {
        //     return value;
        //   },
        // },
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
          width: '20%',
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
          width: '20%',
          // type: 'string;',
          valuePrepareFunction: (value) => {
            return value;
          },
        },
        FechaInicio: {
          title: this.translate.instant('GLOBAL.fechainicio'),
          width: '20%',
          // type: 'Date;',
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
        FechaFin: {
          title: this.translate.instant('GLOBAL.fechafin'),
          width: '20%',
          // type: 'Date;',
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
        Activo: {
          title: this.translate.instant('GLOBAL.activo'),
          width: '10%',
          // type: 'boolean;',
          valuePrepareFunction: (value) => {
            if (value === true)
               return 'Activo';
            else
               return 'Inactivo';
          },
        },
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.catalogoElementosService.getCatalogo().subscribe(res => {
      if (res !== null) {
        const data = <Array<any>>res;
        // console.log(data);
        this.source.load(data);
      }
    });
  }

  ngOnInit() {
  }

  onEdit(event): void {
    this.uid = event.data.Id;
    this.router.navigate(['/pages/catalogo/crud-catalogo'], { state: { example: this.uid}});
  }

  onCreate(event): void {
    this.uid = 0;
    this.cambiotab = [false, true, false];
  }

  onDelete(event): void {
    const opt: any = {
      title: 'Desactivar?',
      text: 'Catalogo desactivado!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    (Swal as any)(opt)
      .then((willDelete) => {
        if (willDelete.value) {

         const catalogo = <Catalogo>event.data;
         catalogo.Activo = false;



        this.catalogoElementosService.putCatalogo(catalogo, catalogo.Id).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', 'deleted', 'Catalogo deleted');
            }
        });
/*

          this.catalogoElementosService.deleteCatalogo(event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.showToast('info', 'deleted', 'Catalogo deleted');
            }
          });*/

        }
      });
  }

  activetab(): void {
    this.cambiotab = [true, false, false];
  }

  selectTab(event): void {
    switch (event.tabTitle) {
      case this.translate.instant('GLOBAL.lista'):
        {
          this.cambiotab = [true, false, false];
          break;
        }
      case this.translate.instant('GLOBAL.formulario'):
        {
          this.cambiotab = [false, true, false];
          break;
        }
      case this.translate.instant('GLOBAL.Detalle'):
        {
          this.cambiotab = [false, false, true];
          break;
        }
      default:
        {
          this.cambiotab = [false, false, false];
          break;
        }
    }
  }

  onChange(event) {
    if (event) {
      this.loadData();
      this.cambiotab = [true, false, false];



    }
  }


  itemselec(event): void {
    // console.log("afssaf");
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      // 'toast-top-full-width', 'toast-bottom-full-width', 'toast-top-left', 'toast-top-center'
      positionClass: 'toast-top-center',
      timeout: 5000,  // ms
      newestOnTop: true,
      tapToDismiss: false, // hide on click
      preventDuplicates: true,
      animation: 'slideDown', // 'fade', 'flyLeft', 'flyRight', 'slideDown', 'slideUp'
      limit: 5,
    });
    const toast: Toast = {
      type: type, // 'default', 'info', 'success', 'warning', 'error'
      title: title,
      body: body,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toasterService.popAsync(toast);
  }

}
