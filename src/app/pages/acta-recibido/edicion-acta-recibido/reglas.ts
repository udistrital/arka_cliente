import { RolUsuario_t as Rol } from '../../../@core/data/models/roles/rol_usuario';

// Se podría reescribir esta parte como
// un arreglo de dos dimensiones con indices tipo string.
// Ver https://stackoverflow.com/a/29043535/3180052

// Si se tienen roles con permisos de editar y ver
// tendrá prevalencia el permiso de editar
// ( ver función cargaPermisos() )

export const permisosSeccionesActas = [
  {
    Seccion: 'Acta',
    Permisos: [
      {
        Estado: 'Registrada',
        PuedenModificar: [Rol.Admin, Rol.Secretaria, Rol.Revisor],
        PuedenVer: [Rol.Contratista],
      },
      {
        Estado: 'En Elaboracion',
        PuedenModificar: [Rol.Admin, Rol.Revisor],
        PuedenVer: [Rol.Contratista, Rol.Proveedor],
      },
      {
        Estado: 'En Modificacion',
        PuedenModificar: [Rol.Admin, Rol.Revisor],
        PuedenVer: [Rol.Contratista],
      },
      {
        Estado: 'Aceptada',
        PuedenModificar: [Rol.Admin, Rol.Revisor],
        PuedenVer: [],
      },
    ],
  },
  {
    Seccion: 'Elementos',
    Permisos: [
      {
        Estado: 'Registrada',
        PuedenModificar: [Rol.Admin, Rol.Revisor],
        PuedenVer: [],
      },
      {
        Estado: 'En Elaboracion',
        PuedenModificar: [Rol.Admin, Rol.Contratista, Rol.Proveedor, Rol.Revisor],
        PuedenVer: [],
      },
      {
        Estado: 'En Modificacion',
        PuedenModificar: [Rol.Admin, Rol.Contratista, Rol.Revisor],
        PuedenVer: [],
      },
      {
        Estado: 'Aceptada',
        PuedenModificar: [Rol.Admin, Rol.Revisor],
        PuedenVer: [],
      },
    ],
  },
];
