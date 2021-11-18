import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-registro-traslado',
  templateUrl: './registro-traslado.component.html',
  styleUrls: ['./registro-traslado.component.scss'],
})
export class RegistroTrasladoComponent implements OnInit {

  trasladoData: any;
  valid: boolean;

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  public setValidness(event) {
    this.valid = event;
  }

  public confirm() {
    (Swal as any).fire({
      title: this.translate.instant('GLOBAL.traslados.registro.confrmTtl'),
      text: this.translate.instant('GLOBAL.traslados.registro.confrmTxt'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('GLOBAL.si'),
      cancelButtonText: this.translate.instant('GLOBAL.no'),
    }).then((result) => {
      if (result.value) {
        this.registrar();
      }
    });
  }

  private registrar() {
    // this.trasladosHelper.Post.....
  }

}
