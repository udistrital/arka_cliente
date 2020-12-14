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
        PuedenModificar: [Rol.Admin, Rol.Secretaria],
        PuedenVer: [Rol.Contratista],
      },
      {
        Estado: 'En Elaboracion',
        PuedenModificar: [Rol.Admin],
        PuedenVer: [Rol.Secretaria, Rol.Contratista],
      },
      {
        Estado: 'En Modificacion',
        PuedenModificar: [Rol.Admin],
        PuedenVer: [Rol.Secretaria, Rol.Contratista],
      },
    ],
  },
  {
    Seccion: 'Elementos',
    Permisos: [
      {
        Estado: 'Registrada',
        PuedenModificar: [Rol.Admin],
        PuedenVer: [],
      },
      {
        Estado: 'En Elaboracion',
        PuedenModificar: [Rol.Admin, Rol.Contratista],
        PuedenVer: [Rol.Secretaria],
      },
      {
        Estado: 'En Modificacion',
        PuedenModificar: [Rol.Admin, Rol.Contratista],
        PuedenVer: [Rol.Secretaria],
      },
    ],
  },
];
