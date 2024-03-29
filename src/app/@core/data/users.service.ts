import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

import { environment } from './../../../environments/environment';
import { PopUpManager } from '../../managers/popUpManager';
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

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private pUpManager: PopUpManager,
  ) {
    if (window.localStorage.getItem('id_token') !== null && window.localStorage.getItem('id_token') !== undefined) {
      const id_token = window.localStorage.getItem('id_token').split('.');
      const payload = JSON.parse(atob(id_token[1]));
      this.tokenData = payload;
      window.localStorage.setItem('usuario', payload.sub);
      // DESCOMENTAR SOLO PARA PRUEBAS:
      // this.roles.push(RolUsuario_t.Secretaria);
      // this.roles.push(RolUsuario_t.Proveedor);
      // this.roles.push(RolUsuario_t.Contratista);
      // this.roles.push(RolUsuario_t.Admin);
      // this.roles.push(RolUsuario_t.Revisor);
      this.roles = (payload && payload.role && payload.role.length) ? payload.role : [] ;
      // console.log({'Roles': this.roles});
      // this.http.get(path + 'persona/?query=Usuario:' + payload.sub, httpOptions)
      this.http.get(path + 'tercero/?query=UsuarioWSO2:' + payload.sub, httpOptions)
        .subscribe(res => {
          if (res && Object.keys(res[0]).length) {
            this.user = res[0];
            this.user$.next(this.user);
            // window.localStorage.setItem('ente', res[0].Ente);
            this.terceroId = parseInt(res[0].Id, 10); // window.localStorage.setItem('persona_id', res[0].Id);
          } else {
            const doc_ = window.localStorage.getItem('user');
            const doc = doc_ ? JSON.parse(atob(doc_)).userService : '';
            const tipo = doc ? ',TipoDocumentoId__CodigoAbreviacion:' + doc.documento_compuesto.replace(/[0-9]/g, '') : '';
            if (doc) {
              this.http.get(path + 'datos_identificacion/?query=Activo:true,Numero:' + doc.documento + tipo, httpOptions)
                .subscribe((res_: any) => {
                  if (res_ && res_.length && Object.keys(res_[0]).length) {
                    this.user = res_[0];
                    this.user$.next(this.user);
                    if (res_[0].TerceroId) {
                      this.terceroId = parseInt(res_[0].TerceroId.Id, 10);
                    }
                  } else {
                    this.http.get(path + 'datos_identificacion/?query=Activo:true,Numero:' + doc.documento, httpOptions)
                    .subscribe((res__: any) => {
                      if (res__ && res__.length && Object.keys(res__[0]).length) {
                        this.user = res__[0];
                        this.user$.next(this.user);
                        if (res__[0].TerceroId) {
                          this.terceroId = parseInt(res__[0].TerceroId.Id, 10);
                        }
                      }
                    });
                  }
                });
            }
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

  public getUserMail(): string {
    return this.tokenData.email; // window.localStorage.getItem('usuario').toString() ;
  }

  getRoles(): string[] {
    return this.roles;
  }

  /**
   * Obtiene un string con todos los roles, con el separador indicado.
   * (de no especificarse, el separador es ',').
   *
   * NOTA: Hay algo en Autenticación(WSO2) que no deja que lo siguiente
   * funcione adecuadamente (permitir roles con '/')...:
   *
   * Adicionalmente, si los roles tienen '/', se retornan sanitizados
   * para poderlos usar en URLs
   *
   * ... Una vez se arregle, comentar/eliminar el .filter
   */

  public getPersonaId(): number {
    return this.terceroId;
  }

  public TerceroValido(): boolean {
    if (!this.getPersonaId()) {
      this.pUpManager.showAlertWithOptions({
        title: this.translate.instant('GLOBAL.error'),
        text: this.translate.instant('GLOBAL.Errores.errorTercero'),
        type: 'error',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: this.translate.instant('GLOBAL.cerrar'),
      });
      return false;
    } else {
      return true;
    }
  }

  public getUser() {
    return this.user$.asObservable();
  }

  public getTokenData() {
    return this.tokenData;
  }

}
