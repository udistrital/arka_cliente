import { Component } from '@angular/core';

@Component({
  selector: 'ngx-registrar-traslado',
  template: `
    <mat-card>
      <mat-card-content>
        <ngx-crud-traslado [modoCrud]="'registrarInterno'" (accion)="noop()"></ngx-crud-traslado>
      </mat-card-content>
    </mat-card>
  `,
  styles: [],
})
export class RegistrarTrasladoComponent {
  noop() {}
}
