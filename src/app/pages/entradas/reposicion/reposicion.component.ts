import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';


@Component({
  selector: 'ngx-reposicion',
  templateUrl: './reposicion.component.html',
  styleUrls: ['./reposicion.component.scss'],
})
export class ReposicionComponent implements OnInit {

  elementoForm: FormGroup;
  soporteForm: FormGroup;
  observacionForm: FormGroup;
   // elementos
   elementos: any;
   placa: string;
   encargado: string;
   placas: Array<string>;

   @Input() actaRecibidoId: string;

  constructor(private fb: FormBuilder, private  actashelper: ActaRecibidoHelper, private  entradashelper: EntradaHelper) {
    this.elementos = [];

  }

  ngOnInit() {
    this.elementoForm = this.fb.group({
      elementoCtrl: ['', Validators.required],
      encargadoCtrl: ['', Validators.required],
      placaHurtadaCtrl: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{2,4}$')],
      ],
    });

    this.soporteForm = this.fb.group({
      soporteCtrl: ['', Validators.required],
    });
    this.observacionForm = this.fb.group({
      observacionCtrl: ['', Validators.nullValidator],
    });
  }

  // Métodos para validar campos requeridos en el formulario
  onElementoSubmit() {
    this.elementoForm.markAsDirty();
  }

  onSoporteSubmit() {
    this.soporteForm.markAsDirty();
  }

  loadPlacasElementos(): void {
    if (this.placa.length > 3) {
      this.actashelper.getElementos(this.placa).subscribe(res => {
        if (res != null ) {
          while (this.elementos.length > 0) {
            this.elementos.pop();            
          }
          this.encargado=""
          for (const index of Object.keys(res)) {
            if(res[index].Placa != null){         
              console.log(res)     
              this.elementos.push(res[index].Placa);               
            }            
          }
        }
      });
      if(this.placa.length == 13){
        this.loadEncargadoElementos(this.placa)
      }
      
    }
  }

  changePlacaElemento(event) {
    this.placa = event.target.value;
    this.loadPlacasElementos();

  }
 
  loadEncargadoElementos(placa): void {  
    console.log("entra a buscar encargado")    
      this.entradashelper.getEncargadoElementoByPlaca(placa).subscribe(res => {
        if (res != null && res!=undefined) {
          console.log("entra aca ",res)
          //encargado      
          this.encargado= res.funcionario          
        }else{
          this.encargado= ""
        }
      });

    
  }
}
