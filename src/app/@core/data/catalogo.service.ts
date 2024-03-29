import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CatalogoService {
    clientes$ = new Subject<boolean>();
    clientes: boolean;

    CambiarEstado() {
        this.clientes = !this.clientes;
        this.clientes$.next(this.clientes);
      }

    getEstado$(): Observable<boolean> {
        return this.clientes$.asObservable();
      }

}
