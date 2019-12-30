import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { LocalDataSource } from 'ngx-smart-table';
import { Router } from '@angular/router';
import { EntradaHelper } from '../../../helpers/entradas/entradaHelper';
import { Entrada } from '../../../@core/data/models/entrada/entrada';
import { Contrato } from '../../../@core/data/models/entrada/contrato';
import { Supervisor } from '../../../@core/data/models/entrada/supervisor';
import { OrdenadorGasto } from '../../../@core/data/models/entrada/ordenador_gasto';
import { TipoEntrada } from '../../../@core/data/models/entrada/tipo_entrada';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { NuxeoService } from '../../../@core/utils/nuxeo.service';
import { DocumentoService } from '../../../@core/data/documento.service';
import { SalidaHelper } from '../../../helpers/salidas/salidasHelper';


@Component({
  selector: 'ngx-consulta-salida-especifica',
  templateUrl: './consulta-salida-especifica.component.html',
  styleUrls: ['./consulta-salida-especifica.component.scss']
})
export class ConsultaSalidaEspecificaComponent implements OnInit {
  salida_id: number;
  salida: any;

  @Input('salida_id')
  set name(salida_id: number) {
    this.salida_id = salida_id;
    // console.log(this.subgrupo_id);
    if (this.salida_id !== undefined) {
      this.CargarSalida();
    }
  }

  source: LocalDataSource;
  entradas: Array<Entrada>;
  detalle: boolean;
  actaRecibidoId: number;
  consecutivoEntrada: string;
  entradaEspecifica: Entrada;
  contrato: Contrato;
  settings: any;
  documentoId: boolean;

  constructor(private router: Router, private salidasHelper: SalidaHelper, private translate: TranslateService,
    private nuxeoService: NuxeoService, private documentoService: DocumentoService) {
    this.source = new LocalDataSource();
    this.detalle = false;
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { // Live reload
      // this.loadTablaSettings();
    });
  }
  CargarSalida() {
    this.salidasHelper.getSalida(this.salida_id).subscribe(res => {
      if (Object.keys(res[0]).length !== 0) {

        var detalle = JSON.parse(res[0].Salida.Detalle);
        console.log(detalle)
        res[0].Salida.Funcionario = detalle.funcionario;
        res[0].Salida.Ubicacion = detalle.ubicacion;
        this.salida = res[0];
        console.log(this.salida);
      }

    })
  }

}
