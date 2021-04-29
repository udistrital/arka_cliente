import { Component, OnInit, Input, ViewChild, ɵConsole } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
import { LocalDataSource } from 'ngx-smart-table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from '../../../managers/popUpManager';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { Router, NavigationExtras } from '@angular/router';
import { NbStepperComponent } from '@nebular/theme';
import Swal from 'sweetalert2';
import { isObject } from 'rxjs/internal-compatibility';

@Component({
  selector: 'ngx-avaluo',
  templateUrl: './avaluo.component.html',
  styleUrls: ['./avaluo.component.scss']
})
export class AvaluoComponent implements OnInit {
  // FORMULARIOS
  inicioForm: FormGroup;
  normasForm: FormGroup;
  propuestaForm: FormGroup;
  contabilidadForm: FormGroup;
  soporteForm: FormGroup;

  @Input() bienSeleccionadoId: Number;

  //VALIDADORES
  checked: boolean;

  // VARIABLES
  data:any;
  datatable:any;
  settings: any;
  source: LocalDataSource;

  constructor(private fb: FormBuilder,private router: Router,private translate: TranslateService,) {
    this.source = new LocalDataSource();
    this.LoadTabla();
    this.loadTablaSettings();
   }

  ngOnInit() {
    this.FormulariosConfig();
    this.loadData();
    this.LoadTabla();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      this.LoadTabla();
      this.loadTablaSettings();
    });
   }
  loadData() { 
    let Prueba = [
      {Id:0,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Sabio Caldas"},
      {Id:1,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Arturo Suarez copete"},
      {Id:2,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Macarena A"},
      {Id:3,FechaRegistro:"2021/01/02",BienInmueble:"Edificio Macarena B"}
    ]
    this.data= Prueba;
    console.log({Prueba:this.data})
    
  }
  LoadTabla() {
    let PruebaTabla = [
      {Secuencia:0,NIT:"571589",Cuenta:"2-3-11-27",NombreCuenta:"XXXXX",Detalle:"Diferencia por conciliar RA 42 Giro sin registrar en libros",
      Debito:"X",Credito:"6104175"},
      {Secuencia:1,NIT:"6664489",Cuenta:"2-3-11-15",NombreCuenta:"XXXXX",Detalle:"Diferencia por conciliar RA 42 Giro sin registrar en libros",
      Debito:"6104175",Credito:"X"}
    ]
    this.source.load(PruebaTabla);

  }

  FormulariosConfig() {
    this.inicioForm = this.fb.group({
      inicioCtrl: ['', [Validators.required]],
    });
    this.normasForm = this.fb.group({
      normasCtrl: ['', Validators.nullValidator],
    });
    this.propuestaForm = this.fb.group({
      propuestaCtrl: ['', Validators.nullValidator],
    });
    this.contabilidadForm = this.fb.group({
      contabilidadCtrl: ['', Validators.nullValidator],
    });
    this.soporteForm = this.fb.group({
      soporteCtrl: ['', Validators.nullValidator],
    });
  }
  loadTablaSettings() {
    this.settings = {
      hideSubHeader: true,
      noDataMessage: 'No se encontraron elementos asociados.',
      actions: {
        columnTitle: 'Seleccionar',
        position: 'right',
        add: false,
        edit: false,
        delete: false,
      },
      columns: {
        Secuencia: {
          title: "Secuencia",
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        NIT: {
          title: "NIT",
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Cuenta: {
          title: "Cuenta",
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        NombreCuenta: {
          title: "NombreCuenta",
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Detalle: {
          title: "Detalle",
        },
        Debito: {
          title: "Débito",
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
        Credito: {
          title: "Crédito",
          valuePrepareFunction: (value: any) => {
            return value;
          },
        },
      },
    };
  }


}
