/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: false,
  NUXEO: {
    PATH: 'https://documental.udistrital.edu.co/nuxeo/',
  },
  CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
  NOTIFICACION_SERVICE: 'ws://pruebasapi.intranetoas.udistrital.edu.co:8116/ws',
  CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
  ADMINISTRATIVA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/administrativa_jbpm/v1/',
  ACTA_RECIBIDO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/acta_recibido_crud/v1/',
  ENTRADAS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/entradas_crud/v1/',
  ARKA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/arka_mid/v1/',
  UNIDADES_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/administrativa_amazon_api/v1/',
  CATALOGO_BIENES_SERVICE: 'http://10.20.2.134:8087/v1/',
  CATALOGO_ELEMENTOS_SERVICE: 'http://10.20.2.134:8087/v1/',
  FINANCIERA_SERVICE: 'http://10.20.2.143:8089/v1/',
  SPAGOBI: {
    PROTOCOL: 'https',
    HOST: 'intelligentia.udistrital.edu.co',
    PORT: '8443',
    CONTEXTPATH: 'SpagoBI',
    USER: 'sergio_orjuela',
    PASSWORD: 'sergio_orjuela',
  },
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
