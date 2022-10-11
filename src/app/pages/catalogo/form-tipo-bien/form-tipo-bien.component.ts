import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CatalogoElementosHelper } from '../../../helpers/catalogo-elementos/catalogoElementosHelper';
import { PopUpManager } from '../../../managers/popUpManager';

@Component({
  selector: 'ngx-form-tipo-bien',
  templateUrl: './form-tipo-bien.component.html',
  styleUrls: ['./form-tipo-bien.component.scss'],
})
export class FormTipoBienComponent implements OnInit, OnChanges {

  form: FormGroup;
  tiposBienPadre: any[] = [];
  @Input() tipoBienIn: any;
  @Output() tipoBienOut: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private catalogoHelper: CatalogoElementosHelper,
    private pupmanager: PopUpManager,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.loadTiposBienPadre(this.tipoBienIn.Id);
    this.createForm(this.tipoBienIn);
  }

  ngOnChanges(): void {
    this.createForm(this.tipoBienIn);
  }

  private createForm(data: any) {
    this.form = this.fb.group({
      Id: [data && data.Id ? data.Id : 0],
      TipoBienPadreId: [
        {
          value: data && data.TipoBienPadreId ? data.TipoBienPadreId.Id : '',
          disabled: false,
        },
        {
          validators: [this.validateRange()],
        },
      ],
      Nombre: [
        {
          value: data && data.Nombre ? data.Nombre : '',
          disabled: false,
        },
        {
          validators: [Validators.required, Validators.maxLength(20)],
        },
      ],
      Descripcion: [
        {
          value: data && data.Descripcion ? data.Descripcion : '',
          disabled: false,
        },
        {
          validators: [Validators.maxLength(250)],
        },
      ],
      LimiteInferior: [
        {
          value: data && data.LimiteInferior ? data.LimiteInferior : 0,
          disabled: false,
        },
        {
          validators: [Validators.required, Validators.min(0), this.validateRange()],
        },
      ],
      LimiteSuperior: [
        {
          value: data && data.LimiteSuperior ? data.LimiteSuperior : 0,
          disabled: false,
        },
        {
          validators: [Validators.required, Validators.min(0), this.validateRange()],
        },
      ],
      NecesitaPlaca: [
        {
          value: data && data.NecesitaPlaca ? data.NecesitaPlaca : false,
          disabled: false,
        },
      ],
      NecesitaPoliza: [
        {
          value: data && data.NecesitaPoliza ? data.NecesitaPoliza : false,
          disabled: false,
        },
      ],
      BodegaConsumo: [
        {
          value: data && data.BodegaConsumo ? data.BodegaConsumo : false,
          disabled: false,
        },
      ],
      Activo: [
        {
          value: data && data.Activo ? data.Activo : false,
          disabled: false,
        },
        {
          validators: [this.validateRange()],
        },
      ],
    });
  }

  private loadTiposBienPadre(id: number): void {
    const query = 'limit=-1&query=Activo:true' +
      (id ? '' : ',TipoBienPadreId__isnull:true') +
      '&fields=Id,Nombre' + (id ? ',TipoBienPadreId' : '');
    this.catalogoHelper.getAllTiposBien(query).subscribe(res => {

      if (!id) {
        this.tiposBienPadre = res;
        return;
      }

      const esPadre = res
        .filter(tb => tb.TipoBienPadreId)
        .filter(tb => tb.TipoBienPadreId.Id === this.tipoBienIn.Id);

      if (!esPadre.length) {
        this.tiposBienPadre = res
          .filter(tb => !tb.TipoBienPadreId)
          .filter(tb => tb.Id !== this.tipoBienIn.Id);
      }
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }

    const options = this.options(this.form.value.Id ? 'actualizacion' : 'registro');
    this.pupmanager.showAlertWithOptions(options)
      .then((willDelete) => {
        for (const prop of Object.keys(this.form.controls)) {
          this.form.value[prop] = this.form.controls[prop].value;
        }
        if (this.form.value.TipoBienPadreId) {
          this.form.value.TipoBienPadreId = { Id: this.form.value.TipoBienPadreId };
        } else {
          this.form.value.TipoBienPadreId = null;
          this.form.value.LimiteInferior = 0;
          this.form.value.LimiteSuperior = 0;
        }
        if (willDelete.value) {
          this.tipoBienOut.emit(this.form.value);
        }
      });

  }

  private validateRange(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent) {
        const min = control.parent.get('LimiteInferior');
        const max = control.parent.get('LimiteSuperior');

        if (min.value === null || max.value === null || min.value < 0 || max.value < 0) {
          return;
        }

        const id = control.parent.get('Id').value;
        const activo = control.parent.get('Activo').value;
        const padre = control.parent.get('TipoBienPadreId').value;

        if (!padre || (padre && !activo && max.value >= min.value)) {
          control.parent.get('LimiteInferior').setErrors(null);
          control.parent.get('LimiteSuperior').setErrors(null);
        } else if (activo && padre && max.value <= min.value) {
          control.parent.get('LimiteInferior').setErrors({ 'errorRange': true });
          control.parent.get('LimiteSuperior').setErrors({ 'errorRange': true });
        } else if (activo && max.value > min.value && padre) {
          const query = 'min=' + min.value + '&max=' + max.value + '&padre_id=' + padre + '&id=' + id;
          this.catalogoHelper.getAllTiposBien(query).subscribe(res => {
            if (res && res.length) {
              control.parent.get('LimiteInferior').setErrors({ 'errorOverlapped': true });
              control.parent.get('LimiteSuperior').setErrors({ 'errorOverlapped': true });
            } else {
              control.parent.get('LimiteInferior').setErrors(null);
              control.parent.get('LimiteSuperior').setErrors(null);
            }
          });
        }
      }

      return;

    };
  }

  private options(type: string) {
    return {
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085D6',
      cancelButtonColor: '#D33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      title: this.translate.instant('GLOBAL.parametros.tiposBien.' + type + '_title'),
      text: this.translate.instant('GLOBAL.parametros.tiposBien.' + type + '_text'),
    };
  }

}
