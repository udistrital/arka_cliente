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
    private pUpManager: PopUpManager,
    private sanitization: DomSanitizer,
    private nuxeoService: NuxeoService,
    private documentoService: DocumentoService,
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
      Soporte: ['', [Validators.required]],
      TipoBaja: ['', [Validators.required]],
      Placa: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{13,13}$')]],
      Observaciones: ['', [Validators.required]]
    });
  }

  onSubmit() {

    if (this.form_salida.valid === true) {
      const form = this.form_salida.value;
      console.log(form)
      const datos: any = {
        Soporte: this.fileDocumento,
        TipoBaja: form.TipoBaja,
        Placa: this.elementos_placa.find(element => element.Placa === form.Placa ),
        Observaciones: form.Observaciones,
      };
      console.log(datos);
      this.DatosEnviados.emit(datos);
      this.form_salida.reset();
      this.clearFile();
    } else {
      this.DatosEnviados.emit(false);
    }
  }

  usarLocalStorage() { }



  download() {

    const new_tab = window.open(this.fileDocumento.urlTemp, this.fileDocumento.urlTemp, '_blank');
    new_tab.onload = () => {
      new_tab.location = this.fileDocumento.urlTemp;
    };
    new_tab.focus();
  }



  onInputFileDocumento(event) {
    // console.log(event.target.files);
    // console.log(event.srcElement.files);
    const max_size = 1;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {

        if (file.size < max_size * 1024000) {

          file.urlTemp = URL.createObjectURL(event.srcElement.files[0]);
          file.url = this.cleanURL(file.urlTemp);
          file.IdDocumento = 13; // tipo de documento (API documentos_crud)
          file.file = event.target.files[0];
          this.fileDocumento = file;
          this.Validador = true;

        } else {
          (Swal as any).fire({
            title: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_title'),
            text: this.translate.instant('GLOBAL.Acta_Recibido.CapturarElementos.Tamaño_placeholder'),
            type: 'warning',
          });
          this.Validador = false;
        }
        // console.log(file);
        // console.log(this.fileDocumento);
      } else {
        this.Validador = false;
        this.pUpManager.showErrorAlert('error' + this.translate.instant('GLOBAL.error'));
      }
    }
  }
  clearFile() {
    this.form_salida.get('Soporte').setValue('');
    this.fileDocumento = undefined;
    this.Validador = undefined;
  }
  cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  // MÉTODO PARA BUSCAR PLACAS EXISTENTES
  loadPlacasElementos(): void {
    if (this.placa.length > 3) {
      this.Actas_Recibido.getElementosByPlaca2(this.placa).subscribe(res => {
        console.log(res)
        if (Object.keys(res).length !== 0) {
          this.elementos_placa = res;
        }
      });
    }
  }
  // MÉTODO QUE ACTUALIZA LO CAMBIOS EN EL CAMPO DE PLACAS
  changePlacaElemento(event) {
    this.placa = event.target.value;
    this.loadPlacasElementos();

  }
}
