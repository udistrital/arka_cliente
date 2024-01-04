import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActaRecibidoHelper } from '../../../helpers/acta_recibido/actaRecibidoHelper';
import { ParametrosHelper } from '../../../helpers/parametros/parametrosHelper';

@Component({
  selector: 'ver-autor',
  templateUrl: './ver-autor.component.html',
  styleUrls: ['./ver-autor.component.scss'],
})
export class VerAutorComponent implements OnInit {

  nombre = '';
  nacionalidad = '';
  edad = 0;
  publicaciones: any[];
  generos: string[];
  verPublicaciones = false;

  autorForm: FormGroup;

  padres: any[] = [];
  hijos: any[] = [];

  constructor(
    private elementos: ActaRecibidoHelper,
    private parametros: ParametrosHelper,
  ) { }

  ngOnInit() {
    // this.elementos.getAllElemento('')
    //   .subscribe(response => {
    //   })

    this.parametros.getAllTipoParametro('limit=-1')
      .subscribe(responseTipos => {
        this.padres = responseTipos;
      });
    this.nombre = '';
    this.edad = 0;
    this.nacionalidad = '';

    this.publicaciones = [
      {
        titulo: 'Capacitación front OATI',
        year: '2012',
        resumen: 'Vemos cositas generales de angular y de la oati',
        ISBN: '5467890hjg',
      },
      {
        titulo: 'Capacitación backend OATI',
        year: '2023',
        resumen: 'Vemos cositas generales del manejo de apis',
        ISBN: '5467890hjgjfghjhg',
      },
    ];

    this.autorForm = new FormGroup(
      {
        nombre: new FormControl(
          {
            value: '',
            disabled: false,
          },
          { validators: [Validators.required, Validators.maxLength(50)] },
        ),
        pais: new FormControl(
          {
            value: '',
            disabled: false,
          },
          { validators: [Validators.required] },
        ),
        edad: new FormControl(
          {
            value: 0,
            disabled: false,
          },
          { validators: [Validators.required, Validators.min(18), Validators.max(100)] },
        ),
        mail: new FormControl(
          {
            value: 0,
            disabled: false,
          },
          { validators: [Validators.email] },
        ),
        website: new FormControl(
          {
            value: '',
            disabled: false,
          },
          { validators: [Validators.pattern(/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/)] },
        ),
        fechaNacimiento: new FormControl(
          {
            value: '',
            disabled: false,
          },
          { validators: [Validators.required, this.validateFechas()] },
        ),
        fechaDeceso: new FormControl(
          {
            value: '',
            disabled: false,
          },
          { validators: [this.validateFechas()] },
        ),
        docente: new FormControl(
          {
            value: false,
            disabled: false,
          },
          { validators: [this.validarDocente()] },
        ),
        materias: new FormControl(
          {
            value: '',
            disabled: false,
          },
          { validators: [] },
        ),
        padre: new FormControl(
          {
            value: '',
            disabled: false,
          },
          { validators: [Validators.required] },
        ),
        hijo: new FormControl(
          {
            value: '',
            disabled: false,
          },
          { validators: [Validators.required] },
        ),
      });

    // this.autorForm.get('padre').valueChanges
    //   .subscribe(change => {
    //     // Limpia hijo
    //     this.autorForm.get('hijo').setValue('')
    //     this.parametros.getAllParametro('query=TipoParametroId__Id:' + change)
    //       .subscribe(responseParametros => {
    //         this.hijos = responseParametros
    //       })
    //   })
  }

  cargarHijos() {
    const padreId = this.autorForm.get('padre').value;
    this.autorForm.get('hijo').setValue('');
    this.parametros.getAllParametro('query=TipoParametroId__Id:' + padreId)
      .subscribe(responseParametros => {
        this.hijos = responseParametros;
      });
  }

  public togglePublicaciones() {
    this.verPublicaciones = !this.verPublicaciones;
  }
  // 5602 acta
  validarDocente(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }
      if (control.value) {
        control.parent.get('materias').setValidators([Validators.required]);
      } else {
        control.parent.get('materias').clearValidators();
        control.parent.get('materias').updateValueAndValidity();
      }
      return null;
    };
  }

  validateFechas(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && control.parent.controls) {
        const nacimiento = control.parent.value.fechaNacimiento;
        const deceso = control.parent.value.fechaDeceso;

        if (nacimiento && deceso && nacimiento >= deceso) {
          return { errorFecha: true };
        } else {
          control.parent.get('fechaNacimiento').setErrors(null);
          control.parent.get('fechaDeceso').setErrors(null);
        }
      }
      return null;
    };
  }

}
