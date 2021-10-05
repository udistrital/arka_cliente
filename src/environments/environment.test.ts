/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: false,
  NUXEO: {
    PATH: 'https://documental.portaloas.udistrital.edu.co/nuxeo/',
    CREDENTIALS: {
      USERNAME: 'desarrollooas',
      PASS: 'desarrollooas2019',
    },
  },

  ACTA_RECIBIDO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/acta_recibido_crud/v1/',
  ADMINISTRATIVA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/administrativa_jbpm/v1/',
  ARKA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/arka_mid/v1/',
  CATALOGO_ELEMENTOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/catalogo_elementos_crud/v1/',
  CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
  CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
  CUENTAS_CONTABLES_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/cuentas_contables_crud/',
  DOCUMENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/documento_crud/v2/',
  GOOGLE_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/google_mid/v1/',
  MOVIMIENTOS_ARKA_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/movimientos_arka_crud/v1/',
  MOVIMIENTOS_KRONOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/movimientos_crud/v1/',
  NOTIFICACION_SERVICE: 'ws://pruebasapi.intranetoas.udistrital.edu.co:8116/ws',
  OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v1/',
  TERCEROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
  UNIDADES_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/administrativa_amazon_api/v1/',

  SPAGOBI: {
    PROTOCOL: 'https',
    HOST: 'inteligenciainstitucional.portaloas.udistrital.edu.co',
    PORT: '443',
    CONTEXTPATH: 'knowage',
    USER: 'desarrollooas',
    PASSWORD: 'desarrollooas',
    DOCUMENT_LABEL_ENTRADAS: 'RteEntradaArka',
  },
  TOKEN: {
    AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
    CLIENTE_ID: 'Bt3CUzvz_b1WD0vqSXJs_suMDvka',
    RESPONSE_TYPE: 'id_token token',
    SCOPE: 'openid email role documento',
    REDIRECT_URL: 'https://pruebasarka.portaloas.udistrital.edu.co',
    SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
    SIGN_OUT_REDIRECT_URL: 'https://pruebasarka.portaloas.udistrital.edu.co',
    AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
  },
};
