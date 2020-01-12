import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';

import { MatTable } from '@angular/material';
import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { ActaRecibido } from '../../../@core/data/models/acta_recibido/acta_recibido';
import { Elemento, Impuesto } from '../../../@core/data/models/acta_recibido/elemento';
import { TipoBien } from '../../../@core/data/models/acta_recibido/tipo_bien';
import { SoporteActa, Ubicacion, Dependencia } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionSoporteActa, TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
import Swal from 'sweetalert2';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Unidad } from '../../../@core/data/models/acta_recibido/unidades';
import { CompleterService, CompleterData } from 'ng2-completer';
import { HttpLoaderFactory } from '../../../app.module';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from '../../../@core/data/documento.service';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { NbStepperComponent } from '@nebular/theme';


@Component({
  selector: 'ngx-form-elementos-seleccionados',
  templateUrl: './form-elementos-seleccionados.component.html',
  styleUrls: ['./form-elementos-seleccionados.component.scss'],
})
export class FormElementosSeleccionadosComponent implements OnInit {
  searchStr: string;
  searchStr2: Array<string>;
  searchStr3: string;
  dataService: CompleterData;
  dataService2: CompleterData;
  dataService3: CompleterData;
  Proveedores: any;
  Dependencias: any;
  Ubicaciones: any;
  Sedes: any;
  form_salida: FormGroup;
  Datos: any;
  proveedorfiltro: string;
  elementos: any;
  elementos2: any;

  @Input('Datos')
  set name(datos_seleccionados: any) {
    this.Datos = datos_seleccionados;
  }
  @Output() DatosEnviados = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private toasterService: ToasterService,
    private completerService: CompleterService,
    private store: Store<IAppState>,
    private listService: ListService,
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
    private terceros: TercerosHelper,


  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.elementos = [];
    // this.listService.findProveedores();
    this.listService.findDependencias();
    this.listService.findSedes();
    // this.listService.findUbicaciones();
    this.loadLists();
  }

  ngOnInit() {
    this.form_salida = this.Formulario;
  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Dependencias = list.listDependencias[0];
        // this.Ubicaciones = list.listUbicaciones[0];
        this.Sedes = list.listSedes[0];
        this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
        // this.dataService = this.completerService.local(this.Ubicaciones, 'Nombre', 'Nombre');
      },
    );
  }
  get Formulario(): FormGroup {
    return this.fb.group({
      Proveedor: ['', Validators.required],
      Sede: ['', Validators.required],
      Dependencia: ['', Validators.required],
      Ubicacion: ['', Validators.required],
    });
  }
  Traer_Relacion_Ubicaciones() {
    const sede = this.form_salida.get('Sede').value;
    const dependencia = this.form_salida.get('Dependencia').value;

    if (this.form_salida.get('Sede').valid || this.form_salida.get('Dependencia').valid) {
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      // console.log(this.Sedes);
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          // console.log(res)
          if (Object.keys(res[0]).length !== 0) {
            this.Ubicaciones = res[0].Relaciones;
          } else {
            this.Ubicaciones = undefined;
          }
        });
      }
    }
  }

  onSubmit() {
    const form = this.form_salida.value;
    const proveedor___ = form.Proveedor.split(' ');

    if (Object.keys(this.Datos.selected).length !== 0) {
      const seleccionados = this.Datos.selected;
      const datos = this.Datos.source.data;

      seleccionados.forEach((elemento) => {
        elemento.Funcionario = this.elementos2;
        // elemento.Funcionario = this.Proveedores.find(z => z.compuesto === form.Proveedor);
        elemento.Sede = this.Sedes.find(y => y.Id === parseFloat(form.Sede));
        elemento.Dependencia = this.Dependencias.find(y => y.Nombre === form.Dependencia);
        elemento.Ubicacion = this.Ubicaciones.find(w => w.Id === parseFloat(form.Ubicacion));
        elemento.Asignado = true;
        datos.find(element => {
          if (element.Id === elemento.Id) {
            element = elemento;
          }
          // console.log(element);
        });
      });
      this.DatosEnviados.emit(datos);
    }

  }
  usarLocalStorage() { }

  // MÉTODO PARA BUSCAR PROVEEDORES EXISTENTES
  loadProveedoresElementos(): void {
    if (this.proveedorfiltro.length > 3) {
      this.terceros.getProveedores(this.proveedorfiltro).subscribe(res => {
        if (res != null) {
          while (this.elementos.length > 0) {
            this.elementos.pop();
          }
          if (Object.keys(res).length === 1) {
            this.elementos2 = res[0];
          }
          for (const index of Object.keys(res)) {
            if (res[index].NombreCompleto != null) {
              this.elementos.push(res[index].NombreCompleto);
            }
          }
        }
      });

    }
  }

  // MÉTODO PARA FILTRAR PROVEEDORES
  changeNombreProveedor(event) {
    this.proveedorfiltro = event.target.value;
    this.loadProveedoresElementos();

  }
// MÉTODO PARA VERIFICAR QUE EL DATO EN EL INPUT CORRESPONDA CON UNO EN LA LISTA
  verfificarProveedor() {
    if (this.elementos.length > 0) {

      if (this.proveedorfiltro !== '') {
        if (!this.elementos.find(element => element === this.proveedorfiltro)) {
          this.proveedorfiltro = '';
          this.pUpManager.showErrorAlert('El contrato seleccionado no existe!');
        } else {
          this.onSubmit();
        }
      }
    }
  }
}
