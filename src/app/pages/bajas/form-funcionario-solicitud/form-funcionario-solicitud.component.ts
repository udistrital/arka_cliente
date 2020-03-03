import { Component, OnInit, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';

import 'hammerjs';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';

import Swal from 'sweetalert2';
import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { CompleterService, CompleterData } from 'ng2-completer';
import { Store } from '@ngrx/store';
import { IAppState } from '../../../@core/store/app.state';
import { ListService } from '../../../@core/store/services/list.service';
import { PopUpManager } from '../../../managers/popUpManager';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentoService } from '../../../@core/data/documento.service';
import { TercerosHelper } from '../../../helpers/terceros/tercerosHelper';
import { NbStepperComponent } from '@nebular/theme';

@Component({
  selector: 'ngx-form-funcionario-solicitud',
  templateUrl: './form-funcionario-solicitud.component.html',
  styleUrls: ['./form-funcionario-solicitud.component.scss'],
})
export class FormFuncionarioSolicitudComponent implements OnInit {

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
  fileDocumento: any;
  Validador: any;


  @Output() DatosEnviados = new EventEmitter();
  placa: any;
  encargado: string;
  elementos_placa: any;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private Actas_Recibido: ActaRecibidoHelper,
    private completerService: CompleterService,
    private store: Store<IAppState>,
    private listService: ListService,

    private terceros: TercerosHelper,


  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.elementos = [];
    this.elementos_placa = [];
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
      Funcionario: ['', Validators.required],
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

    if (this.form_salida.valid === true) {
      const form = this.form_salida.value;
      // console.log(form)
      // console.log(this.elementos);
      // console.log(this.Sedes);
      // console.log(this.Ubicaciones)
      const datos: any = {
        Funcionario: this.elementos.find(element => element.NombreCompleto === form.Funcionario),
        Sede: this.Sedes.find(element => element.Id === parseFloat(form.Sede)),
        Dependencia: this.Dependencias.find(element => element.Nombre === form.Dependencia),
        Ubicacion: this.Ubicaciones.find(element => element.Id === parseFloat(form.Ubicacion)),
      };
      // console.log(datos);
      this.DatosEnviados.emit(datos);
    } else {
      this.DatosEnviados.emit(false);
    }

  }
  usarLocalStorage() { }

  // MÉTODO PARA BUSCAR PROVEEDORES EXISTENTES
  loadProveedoresElementos(): void {
    if (this.proveedorfiltro.length > 3) {
      this.terceros.getProveedores(this.proveedorfiltro).subscribe(res => {
        // console.log(res)
        if (Object.keys(res).length !== 0) {

          this.elementos = res

        }
      });
    }
  }

  // MÉTODO PARA FILTRAR PROVEEDORES
  changeNombreProveedor(event) {
    this.proveedorfiltro = event.target.value;
    this.loadProveedoresElementos();

  }


}
