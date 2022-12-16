/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { WSO2 } from './autenticacion';

export const environment = {
  production: false,
  ...WSO2,

  // ARKA_SERVICE: 'http://localhost:8083/v1/',
  // CATALOGO_ELEMENTOS_SERVICE: 'http://localhost:8080/v1/',
  // CUENTAS_CONTABLES_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8209/v1/',
  // GOOGLE_SERVICE: 'http://localhost:8080/v1/',
  // MOVIMIENTOS_ARKA_SERVICE: 'http://localhost:8080/v1/',

  ASSETS_SERVICE: 'https://pruebasassets.portaloas.udistrital.edu.co/',
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'e36v1MPQk2jbz9KM4SmKhk8Cyw0a',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role documento',
    REDIRECT_URL: 'http://localhost:4200/',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'http://localhost:4200/',
  },

};
