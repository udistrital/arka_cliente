/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { WSO2 } from './autenticacion';

export const environment = {
  production: false,
  ...WSO2,

  ASSETS_SERVICE: 'https://pruebasassets.portaloas.udistrital.edu.co/',
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'Bt3CUzvz_b1WD0vqSXJs_suMDvka',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role documento',
    REDIRECT_URL: 'https://pruebasarka.portaloas.udistrital.edu.co',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'https://pruebasarka.portaloas.udistrital.edu.co',
  },
};
