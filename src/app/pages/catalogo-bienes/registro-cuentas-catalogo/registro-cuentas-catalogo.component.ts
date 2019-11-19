import { Component, OnInit, Input, Output, EventEmitter, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { Subgrupo } from '../../../@core/data/models/catalogo/subgrupo';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { Grupo } from '../../../@core/data/models/catalogo/grupo';
import { Catalogo } from '../../../@core/data/models/catalogo';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { CrudMovimientoComponent } from '../crud-movimientos/crud-movimiento.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ngx-registro-cuentas-catalogo',
  templateUrl: './registro-cuentas-catalogo.component.html',
  styleUrls: ['./registro-cuentas-catalogo.component.scss'],
})
export class RegistroCuentasCatalogoComponent implements OnInit {
  grupo_id: number;

  @Output() eventChange = new EventEmitter();
  @ViewChildren(CrudMovimientoComponent) ref: QueryList<CrudMovimientoComponent>;
  info_grupo: Grupo;
  formGrupo: any;
  regGrupo1: any;
  clean: boolean;
  catalogos: Array<Catalogo>;
  catalogoId: number;
  subgrupoHijo: Subgrupo;
  uid_1: Subgrupo;
  ModificarGrupo: boolean;
  uid_2: Subgrupo;
  uid_3: Subgrupo;
  uid_4: Subgrupo;
  Movimiento: number;
  Movimientos_Entradas;
  Movimientos_Salidas;
  Movimientos_Depreciacion;
  Movimientos_Valorizacion;
  selected = new FormControl(0);


  constructor(
    private translate: TranslateService,
    private catalogoElementosService: CatalogoElementosHelper,
    private store: Store<IAppState>,
    private listService: ListService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.catalogos = new Array<Catalogo>();
    this.catalogoId = 0;
    this.loadCatalogos();
    this.listService.findPlanCuentasDebito();
    this.listService.findPlanCuentasCredito();
    this.catalogoElementosService.getTiposMovimientoKronos().subscribe((res: any[]) => {
      this.Movimientos_Entradas = res.filter((x: any) => x.Descripcion.indexOf('Entrada') !== -1 );
      // console.log(this.Movimientos_Entradas);
      this.Movimientos_Salidas = res.filter((x: any) => x.Descripcion.indexOf('Salida') !== -1 );
      // console.log(this.Movimientos_Salidas);
      this.Movimientos_Depreciacion = res.filter((x: any) => x.Descripcion.indexOf('Depreciacion') !== -1 );
      // console.log(this.Movimientos_Depreciacion);
      this.Movimientos_Valorizacion = res.filter((x: any) => x.Descripcion.indexOf('Valorizacion') !== -1 );
      // console.log(this.Movimientos_Valorizacion);
    });
  }

  ngOnInit() {
  }

  ver3(event, mov_id) {
    // console.log(mov_id);
    // console.log(event);
  }
  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadCatalogos() {
    this.catalogoElementosService.getCatalogo().subscribe((res) => {
      if (res !== null) {
        // console.log(res);
        const data = <Array<Catalogo>>res;
        for (const datos in Object.keys(data)) {
          if (data.hasOwnProperty(datos)) {
            this.catalogos.push(data[datos]);
          }
        }
      }
    });
  }

  recargarCatalogo(event) {
    // console.log(event);
    this.eventChange.emit(true);
  }

  onChange(catalogo) {
    this.catalogoId = catalogo;
  }

  QuitarVista() {
    this.uid_1 = undefined;
    this.uid_2 = undefined;
    this.uid_3 = undefined;
    this.uid_4 = undefined;
  }
  receiveMessage(event) {
    this.catalogoElementosService.getGrupoById(event.Id).subscribe(
      res => {
        // console.log(res[0]);
        if (Object.keys(res[0]).length !== 0) {
          this.uid_1 = event;
          this.uid_2 = undefined;
          this.uid_3 = undefined;
          this.uid_4 = undefined;
          this.Movimiento = 1;
        } else {
          this.uid_1 = undefined;
          this.uid_2 = event;
          this.uid_3 = undefined;
          this.uid_4 = undefined;
          this.Movimiento = 1;
        }
      });
    // console.log(event);
  }

}
