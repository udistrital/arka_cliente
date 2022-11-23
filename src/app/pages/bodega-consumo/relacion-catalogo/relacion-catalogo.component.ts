import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { Router } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';

@Component({
  selector: 'ngx-relacion-catalogo',
  templateUrl: './relacion-catalogo.component.html',
  styleUrls: ['./relacion-catalogo.component.scss'],
})
export class RelacionCatalogoComponent implements OnInit {

  source: LocalDataSource;
  detalle: boolean;
  settings: any;
  cargando: boolean;

  @Output() DatosEnviados = new EventEmitter();
  @Input() Subgrupo_Id: any;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private catalogoHelper: CatalogoElementosHelper,
  ) {
    this.source = new LocalDataSource();
    this.detalle = false;
    this.loadTablaSettings();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.loadTablaSettings();
    });
    if (this.Subgrupo_Id) {
      this.ElementosSinAsignar(this.Subgrupo_Id);
    }
  }

  loadTablaSettings() {
    this.settings = {
      hideSubHeader: false,
      noDataMessage: this.translate.instant('GLOBAL.no_data_entradas'),
      actions: {
        columnTitle: this.translate.instant('GLOBAL.Relacionar'),
        position: 'right',
        add: false,
        edit: false,
        delete: false,
        custom: [
          {
            name: this.translate.instant('GLOBAL.Relacionar'),
            title: '<span class="fas fa-arrow-right" title="' + this.translate.instant('GLOBAL.Relacionar') + '"></span>',
          },
        ],
      },
      columns: {
        Codigo: {
          title: this.translate.instant('GLOBAL.codigo'),
        },
        Nombre: {
          title: this.translate.instant('GLOBAL.nombre'),
        },
        Descripcion: {
          title: this.translate.instant('GLOBAL.descripcion'),
        },
      },
    };
  }

  ElementosSinAsignar(subgrupo_id): void {
    this.cargando = true;
    this.catalogoHelper.getElementosSubgrupo(subgrupo_id).subscribe((res: any) => {
      if (res && res.length) {
        this.source.load(res);
      }
      this.cargando = false;
    });
  }

  onCustom(event) {
    this.DatosEnviados.emit(event.data);
    this.detalle = true;
  }

  onVolver() {
    this.detalle = !this.detalle;
  }

  onRegister() {
    this.router.navigate(['/pages/entradas/registro']);
  }

}
