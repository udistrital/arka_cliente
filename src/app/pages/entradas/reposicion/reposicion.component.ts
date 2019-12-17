import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Elemento } from '../../../@core/data/models/acta_recibido/elemento';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';


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
   elementos: Array<Elemento>;
   placa: string;
   placas: Array<string>;

   @Input() actaRecibidoId: string;

  constructor(private fb: FormBuilder, private  actashelper: ActaRecibidoHelper) {
    this.elementos = new Array<Elemento>();

  }

  ngOnInit() {
    this.elementoForm = this.fb.group({
      elementoCtrl: ['', Validators.required],
      encargadoCtrl: ['', Validators.required],
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

      this.actashelper.getElementos().subscribe(res => {
        if (res !== null) {
          // console.log(res)
          while (this.elementos.length > 0) {
            this.elementos.pop();
          }
          for (const index of Object.keys(res)) {
            if (res[index].Placa.includes(this.placa)) {
             // console.log(" placa ", res[index].Placa)
              this.elementos.push(res[index].Placa);
            }
          }
        }
      });

    }
  }

  changePlacaElemento(event) {

    this.placa = event.target.value;
    // console.log(this.placa);
    // console.log(this.placa.length );
    this.loadPlacasElementos();

  }

}
