import { EstadoActa_t } from '../../../@core/data/models/acta_recibido/estado_acta';
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
        Estado: EstadoActa_t.Registrada,
        PuedenModificar: 'edicionActaSeccActaEstRegistradaEditar',
        PuedenVer: 'edicionActaSeccActaEstRegistradaVer',
      },
      {
        Estado: EstadoActa_t.EnElaboracion,
        PuedenModificar: 'edicionActaSeccActaEstElaboracionEditar',
        PuedenVer: 'edicionActaSeccActaEstElaboracionVer',
      },
      {
        Estado: EstadoActa_t.EnModificacion,
        PuedenModificar: 'edicionActaSeccActaEstModificacionEditar',
        PuedenVer: 'edicionActaSeccActaEstModificacionVer',
      },
      {
        Estado: EstadoActa_t.Aceptada,
        PuedenModificar: 'edicionActaSeccActaEstAceptadaEditar',
        PuedenVer: 'edicionActaSeccActaEstAceptadaVer',
      },
    ],
  },
  {
    Seccion: 'Elementos',
    Permisos: [
      {
        Estado: EstadoActa_t.Registrada,
        PuedenModificar: 'edicionActaSeccElementosEstRegistradaEditar',
        PuedenVer: 'edicionActaSeccElementosEstRegistradaVer',
      },
      {
        Estado: EstadoActa_t.EnElaboracion,
        PuedenModificar: 'edicionActaSeccElementosEstElaboracionEditar',
        PuedenVer: 'edicionActaSeccElementosEstElaboracionVer',
      },
      {
        Estado: EstadoActa_t.EnModificacion,
        PuedenModificar: 'edicionActaSeccElementosEstModificacionEditar',
        PuedenVer: 'edicionActaSeccElementosEstModificacionVer',
      },
      {
        Estado: EstadoActa_t.Aceptada,
        PuedenModificar: 'edicionActaSeccElementosEstAceptadaEditar',
        PuedenVer: 'edicionActaSeccElementosEstAceptadaVer',
      },
    ],
  },
];
