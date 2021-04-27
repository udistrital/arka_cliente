import { Component, OnInit, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { ListService } from '../../../@core/store/services/list.service';
import { IAppState } from '../../../@core/store/app.state';
import { BodegaConsumoHelper } from '../../../helpers/bodega_consumo/bodegaConsumoHelper';

@Component({
  selector: 'ngx-apertura-kardex',
  templateUrl: './apertura-kardex.component.html',
  styleUrls: ['./apertura-kardex.component.scss'],
})
export class AperturaKardexComponent implements OnInit {

  @Output() DatosEnviados = new EventEmitter();

  elemento_catalogo: any;
  elemento_bodega: any;

  ElementoMovimiento: any;
  FormatosKardex: any;
  EstadosMovimiento: any;
  Movimiento: any;

  cargaLista: boolean;

  @Input('Elemento_C')
  set name(elemento: any) {
    this.elemento_catalogo = elemento;
    // console.log(elemento);
  }
  @Input('Elemento_B')
  set name2(elemento: any) {
    this.elemento_bodega = elemento;
    // console.log(elemento);
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
  ];

  form_apertura: FormGroup;
  @ViewChild('fform') firstFormDirective;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder,
    private store: Store<IAppState>,
    private listService: ListService,
    private BodegaConsumo: BodegaConsumoHelper,
  ) {
  }

  ngOnInit() {
    // this.cargaLista = undefined;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findformatosKardex();
    this.listService.findEstadosMovimiento();
    this.loadLists();
    this.form_apertura = this.fb.group({
      Metodo_Valoracion: ['', Validators.required],
      Cantidad_Minima: ['', Validators.required],
      Cantidad_Maxima: ['', Validators.required],
      Observaciones: ['', Validators.required],
    });
  }

  public loadLists() {
    if (this.cargaLista === undefined) {
      this.cargaLista = false;
    this.store.select((state) => state).subscribe(
      (list) => {
        // console.log(list.listFormatosKardex[0]);
        // console.log(list.listEstadosMovimiento[0])
        this.FormatosKardex = list.listFormatosKardex[0];
        this.EstadosMovimiento = list.listEstadosMovimiento[0];
        this.checkCarga();
      },
    );
    }
  }

  checkCarga() {
    if (this.FormatosKardex !== null && this.FormatosKardex !== undefined
      && this.EstadosMovimiento !== null && this.EstadosMovimiento !== undefined
    ) {
      this.cargaLista = true;
    }
  }

  onSubmit() {
    const form = this.form_apertura.value;
    const detalle: any = {};
    detalle.Metodo_Valoracion = parseFloat(form.Metodo_Valoracion);
    detalle.Cantidad_Maxima = parseFloat(form.Cantidad_Maxima);
    detalle.Cantidad_Minima = parseFloat(form.Cantidad_Minima);

    this.Movimiento = {};
    this.Movimiento.Observacion = form.Observaciones;
    this.Movimiento.Activo = true;
    this.Movimiento.Detalle = JSON.stringify(detalle);
    this.Movimiento.FormatoTipoMovimientoId = this.FormatosKardex.find(x => x.CodigoAbreviacion === 'AP_KDX');
    this.Movimiento.EstadoMovimientoId = this.EstadosMovimiento.find(x => x.Id === 4);
    this.Movimiento.MovimientoPadreId = this.elemento_bodega.MovimientoId;
    // console.log(this.Movimiento);

    this.elemento_bodega.ElementoCatalogoId = this.elemento_catalogo.Id;
    this.elemento_bodega.MovimientoId = this.Movimiento;
    this.ElementoMovimiento = this.elemento_bodega;
    // console.log(this.ElementoMovimiento);
  }

  onSubmit2() {
    const AperturaKardex = {
      Movimiento: [],
    };
    AperturaKardex.Movimiento.push(
      {
        Kardex: this.Movimiento,
        Elementos: [this.ElementoMovimiento],
      },
    );
    // console.log(AperturaKardex);
    this.BodegaConsumo.postMovimientoKardex(AperturaKardex).subscribe((res: any) => {
      const opt: any = {
        title: 'Apertura Realizada',
        text: 'Se ha registrado la solicitud de los elementos relacionados',
        type: 'success',
      };
      (Swal as any).fire(opt);
      this.router.navigate(['/pages/bodega_consumo/consulta_kardex']);
    });
  }
}
