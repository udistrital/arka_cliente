import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { RolUsuario_t } from './models/roles/rol_usuario';

const httpOptions = {
  headers: new HttpHeaders({
    'Accept': 'application/json',
    'authorization': 'Bearer ' + window.localStorage.getItem('access_token'),
  }),
};

// const path = environment.PERSONA_SERVICE;
const path = environment.TERCEROS_SERVICE;

@Injectable()
export class UserService {

  private user$ = new Subject<[object]>();
  public user: any;
  private roles: RolUsuario_t[] = [];
  private tokenData: any;
  private terceroId: number = 0;

  constructor(private http: HttpClient) {
    if (window.localStorage.getItem('id_token') !== null && window.localStorage.getItem('id_token') !== undefined) {
      const id_token = window.localStorage.getItem('id_token').split('.');
      const payload = JSON.parse(atob(id_token[1]));
      this.tokenData = payload;
      window.localStorage.setItem('usuario', payload.sub);
      // this.roles = [RolUsuario_t.Secretaria];
      // this.roles = [RolUsuario_t.Proveedor];
      // this.roles = [RolUsuario_t.Contratista];
      // this.roles = [RolUsuario_t.Admin];
      // this.roles = [RolUsuario_t.Revisor];
      this.roles = (payload && payload.role && payload.role.length) ? payload.role : [] ;
      // console.log({'Roles': this.roles});
      // this.http.get(path + 'persona/?query=Usuario:' + payload.sub, httpOptions)
      this.http.get(path + 'tercero/?query=UsuarioWSO2:' + payload.sub, httpOptions)
        .subscribe(res => {
          // console.log({res});
          if (res !== null) {
            this.user = res[0];
            this.user$.next(this.user);
            // window.localStorage.setItem('ente', res[0].Ente);
            this.terceroId = parseInt(res[0].Id, 10); // window.localStorage.setItem('persona_id', res[0].Id);
          }
        });
    }
  }

  public tieneAlgunRol(rolesNecesarios: RolUsuario_t[]): boolean {
    return this.roles.some(rol_usuario => rolesNecesarios.some(rol_necesario => rol_usuario === rol_necesario));
  }

  // public getEnte(): number {
  //   return parseInt(window.localStorage.getItem('ente'), 10);
  // }

  public getPrograma(): number {
    return parseInt(window.localStorage.getItem('programa'), 10);
  }

  public getUsuario(): string {
    return this.tokenData.sub; // window.localStorage.getItem('usuario').toString() ;
  }

  getRoles(): string[] {
    return this.roles;
  }

  public getPersonaId(): number {
    return this.terceroId;
  }

  public getUser() {
    return this.user$.asObservable();
  }

  public getTokenData() {
    return this.tokenData;
  }

}
