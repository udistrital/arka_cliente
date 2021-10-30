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
import { SoporteActa, Ubicacion } from '../../../@core/data/models/acta_recibido/soporte_acta';
import { Proveedor } from '../../../@core/data/models/acta_recibido/Proveedor';
import { EstadoActa } from '../../../@core/data/models/acta_recibido/estado_acta';
import { EstadoElemento } from '../../../@core/data/models/acta_recibido/estado_elemento';
import { HistoricoActa } from '../../../@core/data/models/acta_recibido/historico_acta';
import { TransaccionActaRecibido } from '../../../@core/data/models/acta_recibido/transaccion_acta_recibido';
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
import { isObject } from 'rxjs/internal-compatibility';


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
  proveedorfiltro: string;
  elementos: any;
  elementos2: any;
  UbicacionesFiltradas: any;

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
    this.listService.findDependencias();
    this.listService.findSedes();
    this.listService.findProveedores();
    this.loadLists();
  }

  ngOnInit() {
    this.form_salida = this.Formulario;
    this.loadLists;
  }
  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.Dependencias = list.listDependencias[0];
        this.Proveedores = list.listProveedores[0];
        this.Sedes = list.listSedes[0];
        this.dataService2 = this.completerService.local(this.Proveedores, 'compuesto', 'compuesto');
        this.dataService3 = this.completerService.local(this.Dependencias, 'Nombre', 'Nombre');
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
    if (this.form_salida.get('Sede').valid && this.form_salida.get('Dependencia').valid &&
      sede !== undefined && dependencia !== undefined) {
      this.UbicacionesFiltradas = [];
      const transaccion: any = {};
      transaccion.Sede = this.Sedes.find((x) => x.Id === parseFloat(sede));
      transaccion.Dependencia = this.Dependencias.find((x) => x.Nombre === dependencia);
      if (transaccion.Sede !== undefined && transaccion.Dependencia !== undefined) {
        this.Actas_Recibido.postRelacionSedeDependencia(transaccion).subscribe((res: any) => {
          if (isObject(res[0].Relaciones)) {
            this.form_salida.patchValue({ Ubicacion: '' });
            this.UbicacionesFiltradas = res[0].Relaciones;
          }
        });
      }
    }
  }

  onSubmit() {
    if (this.elementos2) {
      const form = this.form_salida.value;
      form.Funcionario = this.elementos2;
      form.Sede = this.Sedes.find(y => y.Id === parseFloat(form.Sede));
      form.Dependencia = this.Dependencias.find(y => y.Nombre === form.Dependencia);
      form.Ubicacion = this.UbicacionesFiltradas.find(w => w.Id === parseFloat(form.Ubicacion));
      this.DatosEnviados.emit(form);
    } else {
      this.pUpManager.showErrorAlert(this.translate.instant('GLOBAL.movimientos.salidas.errorFuncionario'));
    }

  }

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
            // console.log(res[0]);
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
    if (this.elementos.length !== 0) {

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
