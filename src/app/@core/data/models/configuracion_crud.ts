// Modelos de datos asociados al CRUD de configuracion
// en orden alfabetico

// ESTRUCTURAS DE DATOS PRINCIPALES
// (Relacionadas con tablas)

export class Aplicacion {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Dominio: string;
  Estado: boolean;
  Alias: string;
  EstiloIcono: string;
}

export class MenuOpcion {
  Id: number;
  Nombre: string;
  Descripcion: string;
  Url: string;
  Layout: string;
  Aplicacion: Partial<Aplicacion>;
  TipoOpcion: TipoOpcion;
  Icono: string;
}

export class MenuOpcionPadre {
  Id: number;
  Padre: Partial<MenuOpcion>;
  Hijo: Partial<MenuOpcion>;
}

export class MetodoHttp {
  Id: number;
  Nombre: string;
  Descripcion: string;
}

export class Notificacion {
  Id: number;
  FechaCreacion: Date;
  CuerpoNotificacion: JSON;
  NotificacionConfiguracion: Partial<NotificacionConfiguracion>;
}

export class NotificacionConfiguracion {
  Id: number;
  EndPoint: string;
  MetodoHttp: Partial<MetodoHttp>;
  Tipo: Partial<NotificacionTipo>;
  CuerpoNotificacion: JSON;
  Aplicacion: Partial<Aplicacion>;
}

export class NotificacionConfiguracionPerfil {
  Id: number;
  NotificacionConfiguracion: Partial<NotificacionConfiguracion>;
  Perfil: Partial<Perfil>;
}

export class NotificacionEstado {
  Id: number;
  Nombre: string;
  CodigoAbreviacion: string;
  Descripcion: string;
  Activo: boolean;
  NumeroOrden: number; // confirmar
}

export class NotificacionEstadoUsuario {
  Id: number;
  Notificacion: Partial<Notificacion>;
  NotificacionEstado: Partial<NotificacionEstado>;
  Fecha: Date;
  Usuario: string;
  Activo: boolean;
}

export class NotificacionTipo {
  Id: number;
  Nombre: string;
}

export class Parametro {
  Id: number;
  Nombre: string;
  Valor: string;
  Aplicacion: Partial<Aplicacion>;
}

export class Perfil {
  Id: number;
  Nombre: string;
  Aplicacion: Partial<Aplicacion>;
}

export class PerfilXMenuOpcion {
  Id: number;
  Perfil: Partial<Perfil>;
  Opcion: Partial<MenuOpcion>;
}

export enum TipoOpcion {
  Menu = 'Menú',
  Accion = 'Acción',
  Boton = 'Botón',
}

// ESTRUCTURAS UTILITARIAS/AUXILIARES

/**
 * Estructura retornada por los controladores
 * - menu_opcion_padre/ArbolMenus/{roles}/{app}
 * - perfil_x_menu_opcion/MenusPorAplicacion/{id}
 */
export class Menu extends MenuOpcion {
  Opciones: Partial<Menu>[];
}
