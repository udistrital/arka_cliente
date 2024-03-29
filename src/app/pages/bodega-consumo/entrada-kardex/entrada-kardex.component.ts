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

  cargaLista: boolean;

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
  @ViewChild('fform', {static: true}) firstFormDirective;

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
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
    });
    this.listService.findformatosKardex();
    this.listService.findEstadosMovimiento();
    this.loadLists();
    this.form_apertura = this.fb.group({
      Observaciones: [''],
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
    const ultimo_elemento = this.elementos_kardex[this.elementos_kardex.length - 1];
    const form = this.form_apertura.value;
    this.Movimiento = {};
    this.Movimiento.Observacion = form.Observaciones;
    this.Movimiento.Activo = true;
    this.Movimiento.Detalle = JSON.stringify({});
    this.Movimiento.FormatoTipoMovimientoId = this.FormatosKardex.find(x => x.CodigoAbreviacion === 'ENT_KDX');
    this.Movimiento.EstadoMovimientoId = this.EstadosMovimiento.find(x => x.Nombre === 'Registro Kardex');
    this.Movimiento.MovimientoPadreId = this.elemento_bodega.MovimientoId;

    this.elemento_bodega.ElementoCatalogoId = this.elemento_catalogo.Id;
    this.elemento_bodega.ElementoActaId = null;
    this.elemento_bodega.MovimientoId = this.Movimiento;

    this.elemento_bodega.SaldoCantidad += ultimo_elemento.SaldoCantidad;
    this.elemento_bodega.SaldoValor += ultimo_elemento.SaldoValor;

    this.ElementoMovimiento = this.elemento_bodega;
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
    this.BodegaConsumo.postMovimientoKardex(AperturaKardex).subscribe((res: any) => {
      const opt: any = {
        title: 'Entrada Realizada',
        text: 'Se ha registrado la entrada de los elementos relacionados',
        type: 'success',
      };
      (Swal as any).fire(opt);
      this.router.navigate(['/pages/bodega_consumo/consulta_kardex']);
    });
  }
}
