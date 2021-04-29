import { Component, OnInit, Input, ViewChild, ɵConsole } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl, ValidatorFn } from '@angular/forms';
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

  constructor(private fb: FormBuilder,private router: Router) { }

  ngOnInit() {
    this.loadData();

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
  FormulariosConfig() {
    this.inicioForm = this.fb.group({
      inicioCtrl: ['', [Validators.required]],
    });
    this.normasForm = this.fb.group({
      normasCtrl: ['', Validators.nullValidator],
    });
    this.propuestaForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
    this.contabilidadForm = this.fb.group({
      ordenadorCtrl: ['', Validators.nullValidator],
    });
    this.soporteForm = this.fb.group({
      supervisorCtrl: ['', Validators.nullValidator],
    });
  }
}
