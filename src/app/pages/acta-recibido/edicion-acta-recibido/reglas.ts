import { RolUsuario_t as Rol } from '../../../@core/data/models/roles/rol_usuario';

// Se podría reescribir esta parte como
// un arreglo de dos dimensiones con indices tipo string.
// Ver https://stackoverflow.com/a/29043535/3180052

export const permisosSeccionesActas = [
  {
    Seccion: 'Acta',
    Permisos: [
      {
        Estado: 'Registrada',
        PuedenModificar: [Rol.ADMIN_ALMACEN, Rol.SECRETARIA_ALMACEN],
        PuedenVer: [Rol.CONTRATISTA],
      },
      {
        Estado: 'En Elaboracion',
        PuedenModificar: [Rol.ADMIN_ALMACEN],
        PuedenVer: [Rol.SECRETARIA_ALMACEN, Rol.CONTRATISTA],
      },
      {
        Estado: 'En Modificacion',
        PuedenModificar: [Rol.ADMIN_ALMACEN],
        PuedenVer: [Rol.SECRETARIA_ALMACEN, Rol.CONTRATISTA],
      },
    ],
  },
  {
    Seccion: 'Elementos',
    Permisos: [
      {
        Estado: 'Registrada',
        PuedenModificar: [Rol.ADMIN_ALMACEN],
        PuedenVer: [],
      },
      {
        Estado: 'En Elaboracion',
        PuedenModificar: [Rol.ADMIN_ALMACEN, Rol.CONTRATISTA],
        PuedenVer: [Rol.SECRETARIA_ALMACEN],
      },
      {
        Estado: 'En Modificacion',
        PuedenModificar: [Rol.ADMIN_ALMACEN, Rol.CONTRATISTA],
        PuedenVer: [Rol.SECRETARIA_ALMACEN],
      },
    ],
  },
];
