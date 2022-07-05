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
        PuedenModificar: 'edicionActaSeccActaEstRegistradaEditar',
        PuedenVer: 'edicionActaSeccActaEstRegistradaVer',
      },
      {
        Estado: 'En Elaboración',
        PuedenModificar: 'edicionActaSeccActaEstElaboracionEditar',
        PuedenVer: 'edicionActaSeccActaEstElaboracionVer',
      },
      {
        Estado: 'En Modificación',
        PuedenModificar: 'edicionActaSeccActaEstModificacionEditar',
        PuedenVer: 'edicionActaSeccActaEstModificacionVer',
      },
      {
        Estado: 'Aceptada',
        PuedenModificar: 'edicionActaSeccActaEstAceptadaEditar',
        PuedenVer: 'edicionActaSeccActaEstAceptadaVer',
      },
    ],
  },
  {
    Seccion: 'Elementos',
    Permisos: [
      {
        Estado: 'Registrada',
        PuedenModificar: 'edicionActaSeccElementosEstRegistradaEditar',
        PuedenVer: 'edicionActaSeccElementosEstRegistradaVer',
      },
      {
        Estado: 'En Elaboración',
        PuedenModificar: 'edicionActaSeccElementosEstElaboracionEditar',
        PuedenVer: 'edicionActaSeccElementosEstElaboracionVer',
      },
      {
        Estado: 'En Modificación',
        PuedenModificar: 'edicionActaSeccElementosEstModificacionEditar',
        PuedenVer: 'edicionActaSeccElementosEstModificacionVer',
      },
      {
        Estado: 'Aceptada',
        PuedenModificar: 'edicionActaSeccElementosEstAceptadaEditar',
        PuedenVer: 'edicionActaSeccElementosEstAceptadaVer',
      },
    ],
  },
];
