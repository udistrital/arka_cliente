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
  selector: 'ngx-entrada-kardex',
  templateUrl: './entrada-kardex.component.html',
  styleUrls: ['./entrada-kardex.component.scss'],
})
export class EntradaKardexComponent implements OnInit {

  @Output() DatosEnviados = new EventEmitter();

  elemento_catalogo: any;
  elemento_bodega: any;
  elementos_kardex: any[];

  ElementoMovimiento: any;
  FormatosKardex: any;
  EstadosMovimiento: any;
  Movimiento: any;

  ElementosKardex: any;

  @Input('Elementos_K')
  set name3(elementos: any[]) {
    this.elementos_kardex = elementos;
    // console.log(elementos);
  }
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
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    listService.findformatosKardex();
    listService.findEstadosMovimiento();
    this.loadLists();
    this.form_apertura = this.fb.group({
      Observaciones: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        // console.log(list.listFormatosKardex[0]);
        // console.log(list.listEstadosMovimiento[0])
        this.FormatosKardex = list.listFormatosKardex[0];
        this.EstadosMovimiento = list.listEstadosMovimiento[0];
      },
    );
  }

  onSubmit() {

    const ultimo_elemento = this.elementos_kardex[this.elementos_kardex.length - 1];
    const form = this.form_apertura.value;
    this.Movimiento = {};
    this.Movimiento.Observacion = form.Observaciones;
    this.Movimiento.Activo = true;
    this.Movimiento.Detalle = JSON.stringify({});
    this.Movimiento.FormatoTipoMovimientoId = this.FormatosKardex.find(x => x.CodigoAbreviacion === 'ENT_KDX');
    this.Movimiento.EstadoMovimientoId = this.EstadosMovimiento.find(x => x.Id === 4);
    this.Movimiento.MovimientoPadreId = this.elemento_bodega.MovimientoId;
    // console.log(this.Movimiento);

    this.elemento_bodega.ElementoCatalogoId = this.elemento_catalogo.Id;
    this.elemento_bodega.MovimientoId = this.Movimiento;

    this.elemento_bodega.SaldoCantidad += ultimo_elemento.SaldoCantidad;
    this.elemento_bodega.SaldoValor += ultimo_elemento.SaldoValor;

    this.ElementoMovimiento = this.elemento_bodega;
    // console.log(this.ElementoMovimiento);
    // console.log({ultimo_elemento, elementos_kardex: this.elementos_kardex});
    // console.log({Movimiento: this.Movimiento, ElementoMovimiento: this.ElementoMovimiento});
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
    // console.log({AperturaKardex});
    // /*
    this.BodegaConsumo.postMovimientoKardex(AperturaKardex).subscribe((res: any) => {
      const opt: any = {
        title: 'Entrada Realizada',
        text: 'Se ha registrado la entrada de los elementos relacionados',
        type: 'success',
      };
      (Swal as any).fire(opt);
      this.router.navigate(['/pages/bodega_consumo/consulta_kardex']);
    });
    // */
  }
}
