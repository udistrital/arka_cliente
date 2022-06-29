// Modelos de datos asociados al CRUD de configuracion
// en orden alfabetico

import { BaseId } from './base';

// ESTRUCTURAS DE DATOS PRINCIPALES
// (Relacionadas con tablas)

export class Aplicacion extends BaseId {
  Nombre: string;
  Descripcion: string;
  Dominio: string;
  Estado: boolean;
  Alias: string;
  EstiloIcono: string;
}

export class MenuOpcion extends BaseId {
  Nombre: string;
  Descripcion: string;
  Url: string;
  Layout: string;
  Aplicacion: Partial<Aplicacion>;
  TipoOpcion: TipoOpcion;
  Icono: string;
}

export class MenuOpcionPadre extends BaseId {
  Padre: Partial<MenuOpcion>;
  Hijo: Partial<MenuOpcion>;
}

export class MetodoHttp extends BaseId {
  Nombre: string;
  Descripcion: string;
}

export class Notificacion extends BaseId {
  FechaCreacion: Date;
  CuerpoNotificacion: JSON;
  NotificacionConfiguracion: Partial<NotificacionConfiguracion>;
}

export class NotificacionConfiguracion extends BaseId {
  EndPoint: string;
  MetodoHttp: Partial<MetodoHttp>;
  Tipo: Partial<NotificacionTipo>;
  CuerpoNotificacion: JSON;
  Aplicacion: Partial<Aplicacion>;
}

export class NotificacionConfiguracionPerfil extends BaseId {
  NotificacionConfiguracion: Partial<NotificacionConfiguracion>;
  Perfil: Partial<Perfil>;
}

export class NotificacionEstado extends BaseId {
  Nombre: string;
  CodigoAbreviacion: string;
  Descripcion: string;
  Activo: boolean;
  NumeroOrden: number; // confirmar
}

export class NotificacionEstadoUsuario extends BaseId {
  Notificacion: Partial<Notificacion>;
  NotificacionEstado: Partial<NotificacionEstado>;
  Fecha: Date;
  Usuario: string;
  Activo: boolean;
}

export class NotificacionTipo extends BaseId {
  Nombre: string;
}

export class Parametro extends BaseId {
  Nombre: string;
  Valor: string;
  Aplicacion: Partial<Aplicacion>;
}

export class Perfil extends BaseId {
  Nombre: string;
  Aplicacion: Partial<Aplicacion>;
}

export class PerfilXMenuOpcion extends BaseId {
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
