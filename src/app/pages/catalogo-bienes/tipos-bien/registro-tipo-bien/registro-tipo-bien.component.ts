import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FORM_TIPO_BIEN } from './form-tipo-bien';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { TipoBien} from '../../../../@core/data/models/acta_recibido/tipo_bien';
import { Router } from '@angular/router';
import { CatalogoElementosHelper } from '../../../../helpers/catalogo-elementos/catalogoElementosHelper';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-registro-tipo-bien',
  templateUrl: './registro-tipo-bien.component.html',
  styleUrls: ['./registro-tipo-bien.component.scss'],
})
export class RegistroTipoBienComponent implements OnInit {
  cargando: boolean = false;
  formTipoBien: any;

  @Output() eventChange = new EventEmitter();

  constructor(
    private router: Router,
    private translate: TranslateService,
    private catalogoHelper: CatalogoElementosHelper,
    ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.construirForm();
    // console.log(this.formTipoBien)
  }
  construirForm() {
    const titulo = 'FORMULARIO TB';
    this.formTipoBien = FORM_TIPO_BIEN;
  }
  validarForm(event) {
    if (event.valid) {
      (Swal as any).fire({
        title: this.translate.instant("Registro Tipo de bien"),
        text: this.translate.instant("¿Desea registrar los datos ingresados?"),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085D6',
        cancelButtonColor: '#D33',
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
      }).then((willDelete) => {
        if (willDelete.value) {
            this.registrarTipoBien(event.data.TipoBien);
            
        }
      });
      
    }
  }
  registrarTipoBien(formData:any){
    const trtipobien=new TipoBien;
    trtipobien.NumeroOrden= (formData.Kardex === true) ? 1 : 2;
    trtipobien.Activo = formData.Activo;
    trtipobien.Nombre = formData.Nombre;
    trtipobien.Descripcion=formData.Observaciones;
    trtipobien.CodigoAbreviacion=formData.CodigoAbreviacion;
    // console.log(trtipobien)
    this.eventChange.emit({registrado:true})
    this.catalogoHelper.postTipoBien(trtipobien).toPromise()
    .then((res: any) => {
      if (res) {
        this.showAlert();
        // console.log(res);
      }
    });
    
  }
  private showAlert()
  {
    (Swal as any).fire({
      title: this.translate.instant("Tipo de bien registrado"),
      text: this.translate.instant("Tipo de bien registrado con éxito"),
      type: 'success',
      showConfirmButton: false,
      timer: 2500,
    });
  }
}
