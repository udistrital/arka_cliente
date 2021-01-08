#Variables de Entorno

Archivos de configuracion para variables de entorno para

- `dev`: Entorno local de pruebas
- `test`: Entorno de preproduccion
- `prod`: Entorno de produccion

##Archivo de configuracion
```shell 
NUXEO:
{
    PATH: 'endpoint documentos',
},
CONFIGURACION_SERVICE: 'endpoint configuración',
NOTIFICACION_SERVICE: 'endpoint notificaciones',
CONF_MENU_SERVICE: 'endpoint configuracion de menu',
TOKEN:
{
    AUTORIZATION_URL: 'endpoint autorización',
    CLIENTE_ID: 'token cliente',
    RESPONSE_TYPE: 'tipo de respuesta',
    SCOPE: 'datos asociados al cliente',
    REDIRECT_URL: 'endpoint de redireccionamiento Sign Up',
    SIGN_OUT_URL: 'endpoint de Sign Out',
    SIGN_OUT_REDIRECT_URL: 'endpoint de redireccionamiento Sign Out',
},
```

