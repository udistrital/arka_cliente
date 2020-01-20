import { Component, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-apertura-kardex',
  templateUrl: './apertura-kardex.component.html',
  styleUrls: ['./apertura-kardex.component.scss']
})
export class AperturaKardexComponent implements OnInit {

  @Output() DatosEnviados = new EventEmitter();
  @Output() DatosTotales = new EventEmitter();
  elemento_catalogo: any;
  elemento_bodega: any;

  @Input('Elemento_C')
  set name(elemento: any) {
    this.elemento_catalogo = elemento;
    console.log(elemento);
    if (this.elemento_catalogo !== undefined) {
     
    }
  }
  @Input('Elemento_B')
  set name2(elemento: any) {
    this.elemento_bodega = elemento;
    console.log(elemento);
    if (this.elemento_bodega !== undefined) {
     
    }
  }
  Metodos: any[] = [
    {
      Id: 1,
      Nombre: 'Promedio Ponderado',
    },
    {
      Id: 2,
      Nombre: 'PEPS',
    },
    {
      Id: 3,
      Nombre: 'UEPS',
    },
  ]

  form_apertura: FormGroup;
  @ViewChild('fform') firstFormDirective;
  
  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
  ){
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });

    this.form_apertura = this.fb.group({
      Metodo_Valoracion: ['', Validators.required],
      Cantidad_Minima: ['', Validators.required],
      Cantidad_Maxima: ['', Validators.required],
      Observaciones: ['', Validators.required],
    });;
    
  }

  ngOnInit() {
    
  }
}
